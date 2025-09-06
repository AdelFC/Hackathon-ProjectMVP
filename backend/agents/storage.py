"""
Storage system for the Social CM Orchestrator Suite
Handles persistence of strategies, posted content, and metrics
"""

import json
import os
import hashlib
from typing import List, Dict, Optional, Any
from datetime import datetime, date, timedelta
from pathlib import Path
import sqlite3
from contextlib import contextmanager

from agents.models import (
    MonthlyPlan,
    PostRecord,
    PerformanceMetrics,
    OrchestratorState,
    Platform,
    DailyPost,
    PostingResult,
    GeneratedPost
)

class StorageManager:
    """Manages storage for the orchestrator suite"""

    def __init__(self, base_path: str = None):
        """
        Initialize storage manager

        Args:
            base_path: Base directory for storage (optional)
        """
        # Determine base path based on environment
        if base_path:
            self.base_path = Path(base_path)
        else:
            # Check if running in Docker
            if os.environ.get('DATA_PATH'):
                self.base_path = Path(os.environ['DATA_PATH']) / "orchestrator"
            # Check if volumes directory exists (for local development)
            elif Path("volumes/data/orchestrator").exists():
                self.base_path = Path("volumes/data/orchestrator")
            # Fallback to backend/data for backward compatibility
            else:
                self.base_path = Path("backend/data/orchestrator")

        self.base_path.mkdir(parents=True, exist_ok=True)

        # Create subdirectories
        self.strategies_path = self.base_path / "strategies"
        self.posts_path = self.base_path / "posts"
        self.metrics_path = self.base_path / "metrics"
        self.images_path = self.base_path / "images"
        self.state_path = self.base_path / "state"

        for path in [self.strategies_path, self.posts_path,
                    self.metrics_path, self.images_path, self.state_path]:
            path.mkdir(exist_ok=True)

        # Initialize database for quick lookups
        self.db_path = self.base_path / "orchestrator.db"
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database for tracking"""
        with self._get_db() as conn:
            cursor = conn.cursor()

            # Create tables
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS posted_content (
                    id TEXT PRIMARY KEY,
                    date TEXT NOT NULL,
                    platform TEXT NOT NULL,
                    post_id TEXT,
                    content_hash TEXT UNIQUE,
                    content TEXT,
                    posted_at TEXT,
                    success BOOLEAN,
                    error TEXT,
                    UNIQUE(date, platform)
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS monthly_plans (
                    id TEXT PRIMARY KEY,
                    brand_name TEXT,
                    start_date TEXT,
                    end_date TEXT,
                    created_at TEXT,
                    is_active BOOLEAN,
                    plan_json TEXT
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    post_id TEXT,
                    platform TEXT,
                    measured_at TEXT,
                    impressions INTEGER,
                    engagements INTEGER,
                    clicks INTEGER,
                    shares INTEGER,
                    comments INTEGER,
                    likes INTEGER,
                    engagement_rate REAL,
                    FOREIGN KEY (post_id) REFERENCES posted_content(post_id)
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS orchestrator_runs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    run_date TEXT UNIQUE,
                    started_at TEXT,
                    completed_at TEXT,
                    posts_attempted INTEGER,
                    posts_succeeded INTEGER,
                    posts_failed INTEGER,
                    errors TEXT
                )
            """)

            conn.commit()

    @contextmanager
    def _get_db(self):
        """Get database connection context manager"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    # Strategy Management
    def save_monthly_plan(self, plan: MonthlyPlan) -> str:
        """
        Save a monthly plan

        Args:
            plan: Monthly plan to save

        Returns:
            Plan ID
        """
        plan_id = f"plan_{plan.brand_name}_{plan.calendar.start_date}_{datetime.now().strftime('%Y%m%d%H%M%S')}"

        # Save to JSON file
        plan_file = self.strategies_path / f"{plan_id}.json"
        with open(plan_file, 'w', encoding='utf-8') as f:
            json.dump(plan.dict(), f, indent=2, ensure_ascii=False)

        # Save to database
        with self._get_db() as conn:
            cursor = conn.cursor()

            # Deactivate previous plans
            cursor.execute("""
                UPDATE monthly_plans SET is_active = 0
                WHERE brand_name = ? AND is_active = 1
            """, (plan.brand_name,))

            # Insert new plan
            cursor.execute("""
                INSERT INTO monthly_plans
                (id, brand_name, start_date, end_date, created_at, is_active, plan_json)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                plan_id,
                plan.brand_name,
                plan.calendar.start_date,
                plan.calendar.end_date,
                plan.created_at,
                True,
                json.dumps(plan.dict())
            ))
            conn.commit()

        return plan_id

    def get_active_plan(self, brand_name: str) -> Optional[MonthlyPlan]:
        """
        Get the active monthly plan for a brand

        Args:
            brand_name: Brand name

        Returns:
            Active monthly plan or None
        """
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT plan_json FROM monthly_plans
                WHERE brand_name = ? AND is_active = 1
                ORDER BY created_at DESC LIMIT 1
            """, (brand_name,))

            row = cursor.fetchone()
            if row:
                plan_data = json.loads(row['plan_json'])
                return MonthlyPlan(**plan_data)

        return None

    def get_daily_posts(self, brand_name: str, target_date: str) -> List[DailyPost]:
        """
        Get posts scheduled for a specific date

        Args:
            brand_name: Brand name
            target_date: Target date (YYYY-MM-DD)

        Returns:
            List of daily posts
        """
        plan = self.get_active_plan(brand_name)
        if not plan:
            return []

        return [post for post in plan.calendar.posts if post.date == target_date]

    # Idempotency and Deduplication
    def has_been_posted(self, date: str, platform: Platform) -> bool:
        """
        Check if content has already been posted for a date/platform

        Args:
            date: Date (YYYY-MM-DD)
            platform: Platform

        Returns:
            True if already posted
        """
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id FROM posted_content
                WHERE date = ? AND platform = ? AND success = 1
            """, (date, platform.value))

            return cursor.fetchone() is not None

    def get_content_hash(self, content: str) -> str:
        """
        Generate hash for content deduplication

        Args:
            content: Content to hash

        Returns:
            Content hash
        """
        return hashlib.sha256(content.encode('utf-8')).hexdigest()

    def is_duplicate_content(self, content: str) -> bool:
        """
        Check if content is duplicate

        Args:
            content: Content to check

        Returns:
            True if duplicate
        """
        content_hash = self.get_content_hash(content)

        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id FROM posted_content
                WHERE content_hash = ?
            """, (content_hash,))

            return cursor.fetchone() is not None

    # Post Recording
    def record_post(self, record: PostRecord) -> bool:
        """
        Record a posted content

        Args:
            record: Post record

        Returns:
            Success status
        """
        # Save to JSON file
        post_file = self.posts_path / f"{record.date}_{record.platform.value}_{record.id}.json"
        with open(post_file, 'w', encoding='utf-8') as f:
            json.dump(record.dict(), f, indent=2, ensure_ascii=False)

        # Save to database
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO posted_content
                (id, date, platform, post_id, content_hash, content, posted_at, success, error)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                record.id,
                record.date,
                record.platform.value,
                record.post_id,
                record.content_hash,
                record.generated_post.content,
                record.posting_result.timestamp,
                record.posting_result.success,
                record.posting_result.error
            ))
            conn.commit()

        return True

    def get_posted_content(self, start_date: str, end_date: str,
                          platform: Optional[Platform] = None) -> List[PostRecord]:
        """
        Get posted content for a date range

        Args:
            start_date: Start date
            end_date: End date
            platform: Optional platform filter

        Returns:
            List of post records
        """
        with self._get_db() as conn:
            cursor = conn.cursor()

            if platform:
                cursor.execute("""
                    SELECT * FROM posted_content
                    WHERE date >= ? AND date <= ? AND platform = ?
                    ORDER BY date DESC, posted_at DESC
                """, (start_date, end_date, platform.value))
            else:
                cursor.execute("""
                    SELECT * FROM posted_content
                    WHERE date >= ? AND date <= ?
                    ORDER BY date DESC, posted_at DESC
                """, (start_date, end_date))

            records = []
            for row in cursor.fetchall():
                # Load full record from JSON file
                post_file = self.posts_path / f"{row['date']}_{row['platform']}_{row['id']}.json"
                if post_file.exists():
                    with open(post_file, 'r', encoding='utf-8') as f:
                        record_data = json.load(f)
                        records.append(PostRecord(**record_data))

            return records

    # Performance Metrics
    def save_metrics(self, metrics: PerformanceMetrics) -> bool:
        """
        Save performance metrics

        Args:
            metrics: Performance metrics

        Returns:
            Success status
        """
        # Save to JSON file
        metrics_file = self.metrics_path / f"{metrics.post_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.json"
        with open(metrics_file, 'w', encoding='utf-8') as f:
            json.dump(metrics.dict(), f, indent=2)

        # Save to database
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO performance_metrics
                (post_id, platform, measured_at, impressions, engagements,
                 clicks, shares, comments, likes, engagement_rate)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                metrics.post_id,
                metrics.platform.value,
                metrics.measured_at,
                metrics.impressions,
                metrics.engagements,
                metrics.clicks,
                metrics.shares,
                metrics.comments,
                metrics.likes,
                metrics.engagement_rate
            ))
            conn.commit()

        return True

    def get_metrics(self, post_id: str) -> List[PerformanceMetrics]:
        """
        Get metrics for a post

        Args:
            post_id: Post ID

        Returns:
            List of performance metrics
        """
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM performance_metrics
                WHERE post_id = ?
                ORDER BY measured_at DESC
            """, (post_id,))

            metrics = []
            for row in cursor.fetchall():
                metrics.append(PerformanceMetrics(
                    post_id=row['post_id'],
                    platform=Platform(row['platform']),
                    measured_at=row['measured_at'],
                    impressions=row['impressions'],
                    engagements=row['engagements'],
                    clicks=row['clicks'],
                    shares=row['shares'],
                    comments=row['comments'],
                    likes=row['likes'],
                    engagement_rate=row['engagement_rate']
                ))

            return metrics

    def get_yesterday_performance(self, brand_name: str) -> Dict[str, Any]:
        """
        Get yesterday's performance summary

        Args:
            brand_name: Brand name

        Returns:
            Performance summary
        """
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        posts = self.get_posted_content(yesterday, yesterday)

        total_impressions = 0
        total_engagements = 0
        platform_stats = {}

        for post in posts:
            metrics = self.get_metrics(post.post_id)
            if metrics:
                latest_metric = metrics[0]
                total_impressions += latest_metric.impressions
                total_engagements += latest_metric.engagements

                if latest_metric.platform not in platform_stats:
                    platform_stats[latest_metric.platform.value] = {
                        'impressions': 0,
                        'engagements': 0
                    }

                platform_stats[latest_metric.platform.value]['impressions'] += latest_metric.impressions
                platform_stats[latest_metric.platform.value]['engagements'] += latest_metric.engagements

        return {
            'date': yesterday,
            'total_posts': len(posts),
            'total_impressions': total_impressions,
            'total_engagements': total_engagements,
            'average_engagement_rate': (total_engagements / total_impressions * 100) if total_impressions > 0 else 0,
            'platform_breakdown': platform_stats
        }

    # Orchestrator State
    def save_orchestrator_state(self, state: OrchestratorState) -> bool:
        """
        Save orchestrator state

        Args:
            state: Orchestrator state

        Returns:
            Success status
        """
        state_file = self.state_path / f"state_{state.current_date}.json"
        with open(state_file, 'w', encoding='utf-8') as f:
            json.dump(state.dict(), f, indent=2, ensure_ascii=False)

        return True

    def get_orchestrator_state(self, date: str) -> Optional[OrchestratorState]:
        """
        Get orchestrator state for a date

        Args:
            date: Date (YYYY-MM-DD)

        Returns:
            Orchestrator state or None
        """
        state_file = self.state_path / f"state_{date}.json"
        if state_file.exists():
            with open(state_file, 'r', encoding='utf-8') as f:
                state_data = json.load(f)
                return OrchestratorState(**state_data)

        return None

    def record_orchestrator_run(self, date: str, posts_attempted: int,
                               posts_succeeded: int, posts_failed: int,
                               errors: Optional[List[str]] = None) -> bool:
        """
        Record an orchestrator run

        Args:
            date: Run date
            posts_attempted: Number of posts attempted
            posts_succeeded: Number of successful posts
            posts_failed: Number of failed posts
            errors: List of errors

        Returns:
            Success status
        """
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO orchestrator_runs
                (run_date, started_at, completed_at, posts_attempted,
                 posts_succeeded, posts_failed, errors)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                date,
                datetime.now().isoformat(),
                datetime.now().isoformat(),
                posts_attempted,
                posts_succeeded,
                posts_failed,
                json.dumps(errors) if errors else None
            ))
            conn.commit()

        return True

    def has_run_today(self, date: str) -> bool:
        """
        Check if orchestrator has run today

        Args:
            date: Date to check

        Returns:
            True if already run
        """
        with self._get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id FROM orchestrator_runs
                WHERE run_date = ?
            """, (date,))

            return cursor.fetchone() is not None

    # Image Management
    def save_image(self, image_base64: str, platform: Platform, date: str) -> str:
        """
        Save generated image

        Args:
            image_base64: Base64 encoded image
            platform: Platform
            date: Date

        Returns:
            Image file path
        """
        import base64

        image_filename = f"{date}_{platform.value}_{datetime.now().strftime('%H%M%S')}.png"
        image_path = self.images_path / image_filename

        # Decode and save image
        image_data = base64.b64decode(image_base64)
        with open(image_path, 'wb') as f:
            f.write(image_data)

        return str(image_path)

    # Cleanup and Maintenance
    def cleanup_old_data(self, days_to_keep: int = 90) -> Dict[str, int]:
        """
        Clean up old data

        Args:
            days_to_keep: Number of days of data to keep

        Returns:
            Cleanup statistics
        """
        cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).strftime('%Y-%m-%d')
        stats = {'posts_deleted': 0, 'metrics_deleted': 0, 'files_deleted': 0}

        with self._get_db() as conn:
            cursor = conn.cursor()

            # Delete old posts
            cursor.execute("""
                DELETE FROM posted_content
                WHERE date < ?
            """, (cutoff_date,))
            stats['posts_deleted'] = cursor.rowcount

            # Delete old metrics
            cursor.execute("""
                DELETE FROM performance_metrics
                WHERE measured_at < ?
            """, (cutoff_date,))
            stats['metrics_deleted'] = cursor.rowcount

            conn.commit()

        # Clean up old files
        for path in [self.posts_path, self.metrics_path, self.state_path]:
            for file in path.glob('*'):
                if file.is_file():
                    file_date = file.stem.split('_')[0]
                    try:
                        if file_date < cutoff_date:
                            file.unlink()
                            stats['files_deleted'] += 1
                    except:
                        pass

        return stats


# Singleton instance
_storage_instance = None

def get_storage() -> StorageManager:
    """Get storage manager singleton instance"""
    global _storage_instance
    if _storage_instance is None:
        _storage_instance = StorageManager()
    return _storage_instance
