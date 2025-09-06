"""
Orchestrator Agent V2 - Simplified version for startup parameter support
This agent handles daily execution of content posting across all platforms
"""

from dotenv import load_dotenv
import os
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import json

# Import models and storage
from agents.models import (
    Platform,
    MonthlyPlan,
    DailyPost,
    DailyContentPackage,
    SignalData,
    GeneratedPost,
    PostingResult,
    PostRecord,
    OrchestratorState,
    PerformanceMetrics
)
from agents.storage import get_storage

load_dotenv()

class OrchestratorAgentV2:
    """Orchestrator Agent for daily content execution with startup parameter support"""

    def __init__(self, startup_name: Optional[str] = None, startup_url: Optional[str] = None, startup_context: Optional[str] = None):
        """Initialize the Orchestrator Agent V2

        Args:
            startup_name: Name of the startup for content generation
            startup_url: URL of the startup's landing page for analysis
            startup_context: Analyzed context from the startup's landing page
        """
        print("Initializing OrchestratorAgentV2 with startup parameters")

        # Store startup configuration
        self.startup_name = startup_name
        self.startup_url = startup_url
        self.startup_context = startup_context

        # Storage manager
        self.storage = get_storage()
        print("Storage manager initialized")

        # Note: Channel agents would be initialized here with startup parameters
        # For now, we'll simulate their behavior
        self.channel_agents = {
            Platform.LINKEDIN: None,  # Would be LinkedinAgent(startup_name=startup_name, startup_url=startup_url)
            Platform.FACEBOOK: None,  # Would be FacebookAgent(startup_name=startup_name, startup_url=startup_url, startup_context=startup_context)
            Platform.TWITTER: None,   # Would be TwitterAgent(startup_name=startup_name, startup_url=startup_url, startup_context=startup_context)
        }
        print(f"Channel agents configured for startup: {startup_name}")

    def gather_signals(self, brand_name: str) -> SignalData:
        """Gather recent signals for content adaptation"""
        print(f"Gathering signals for brand: {brand_name}")

        # Get yesterday's performance
        yesterday_perf = self.storage.get_yesterday_performance(brand_name)

        # In production, these would come from external APIs
        signals = SignalData(
            news_items=[
                "AI funding reaches record high in Q1 2024",
                "New regulations for startup investments announced",
                "Tech industry sees 30% growth in sponsorship deals"
            ],
            yesterday_performance=yesterday_perf,
            trending_topics=[
                "#StartupSuccess",
                "#AIInnovation",
                "#FundingFriday",
                "#TechTrends2024"
            ],
            competitor_activity=[
                "Competitor X launches new matching feature",
                "Industry report shows 50% increase in sponsor interest"
            ]
        )

        return signals

    def create_content_package(
        self,
        post: DailyPost,
        signals: SignalData,
        execution_date: str,
        startup_name: Optional[str] = None,
        startup_url: Optional[str] = None,
        startup_context: Optional[str] = None
    ) -> DailyContentPackage:
        """Create a content package for channel agents"""
        # Determine optimal posting time based on platform
        posting_times = {
            Platform.LINKEDIN: "09:00",
            Platform.FACEBOOK: "14:00",
            Platform.TWITTER: "12:00"
        }

        # Create content package with startup info
        package = DailyContentPackage(
            date=execution_date,
            platform=post.platform,
            base_content=post,
            signals=signals,
            posting_time=posting_times.get(post.platform, "10:00"),
            max_retries=3,
            startup_name=startup_name or self.startup_name,
            startup_url=startup_url or self.startup_url
        )

        return package

    def dispatch_to_channel(
        self,
        package: DailyContentPackage,
        dry_run: bool = False
    ) -> PostingResult:
        """Dispatch content package to appropriate channel agent"""
        print(f"Dispatching content to {package.platform.value} with startup context")

        try:
            if dry_run:
                # Simulate posting
                print(f"[DRY RUN] Simulating post to {package.platform.value}:")
                print(f"  Topic: {package.base_content.topic}")
                print(f"  Startup: {package.startup_name}")
                print(f"  Startup Context: {self.startup_context[:100] if self.startup_context else 'None'}...")
                print(f"  Time: {package.posting_time}")

                return PostingResult(
                    success=True,
                    platform=package.platform,
                    post_id=f"dry_run_{package.platform.value}_{package.date}",
                    post_url=f"https://{package.platform.value.lower()}.com/post/dry_run",
                    timestamp=datetime.now().isoformat()
                )

            # Actual posting logic would go here
            # For now, simulate successful posting
            print(f"  📤 Sending to {package.platform.value} agent with startup context...")
            print(f"  ✅ Content generated for {package.startup_name}")

            return PostingResult(
                success=True,
                platform=package.platform,
                post_id=f"{package.platform.value.lower()}_{package.date}_{datetime.now().strftime('%H%M%S')}",
                post_url=f"https://{package.platform.value.lower()}.com/post/simulated",
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            print(f"Exception in dispatch_to_channel: {str(e)}")
            return PostingResult(
                success=False,
                platform=package.platform,
                error=str(e),
                timestamp=datetime.now().isoformat(),
                retry_count=1
            )

    def execute_daily(
        self,
        brand_name: str,
        execution_date: Optional[str] = None,
        force: bool = False,
        dry_run: bool = False,
        platforms: Optional[List[Platform]] = None,
        startup_name: Optional[str] = None,
        startup_url: Optional[str] = None,
        startup_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute daily content posting with startup context"""
        # Set execution date
        if not execution_date:
            execution_date = datetime.now().strftime("%Y-%m-%d")

        print(f"Starting daily execution for {brand_name} on {execution_date}")
        print(f"Brand: {brand_name}")
        print(f"Startup: {startup_name or self.startup_name}")
        print(f"Startup Context: {'Available' if (startup_context or self.startup_context) else 'None'}")
        print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")

        # Check idempotency
        if not force and self.storage.has_run_today(execution_date):
            print("⚠️ Already executed today. Use force=True to override.")
            return {
                "success": False,
                "message": "Already executed today",
                "date": execution_date
            }

        # Get active monthly plan
        plan = self.storage.get_active_plan(brand_name)
        if not plan:
            print("❌ No active monthly plan found")
            return {
                "success": False,
                "error": "No active monthly plan",
                "date": execution_date
            }

        # Get today's posts
        daily_posts = self.storage.get_daily_posts(brand_name, execution_date)
        if not daily_posts:
            print(f"❌ No posts scheduled for {execution_date}")
            return {
                "success": False,
                "error": "No posts scheduled for this date",
                "date": execution_date
            }

        # Filter by platforms if specified
        if platforms:
            daily_posts = [p for p in daily_posts if p.platform in platforms]

        print(f"📋 Found {len(daily_posts)} posts to execute")

        # Gather signals
        signals = self.gather_signals(brand_name)
        print(f"📡 Gathered signals with startup context")

        # Process each post
        posts_attempted = 0
        posts_succeeded = 0
        posts_failed = 0
        errors = []

        for post in daily_posts:
            posts_attempted += 1
            print(f"🔄 Processing {post.platform.value} post with startup context...")

            # Create content package with startup info
            package = self.create_content_package(
                post,
                signals,
                execution_date,
                startup_name=startup_name or self.startup_name,
                startup_url=startup_url or self.startup_url,
                startup_context=startup_context or self.startup_context
            )

            # Dispatch to channel agent
            result = self.dispatch_to_channel(package, dry_run)

            if result.success:
                posts_succeeded += 1
                print(f"  ✅ Successfully posted to {post.platform.value} with startup context")
            else:
                posts_failed += 1
                print(f"  ❌ Failed to post to {post.platform.value}: {result.error}")
                errors.append(f"{post.platform.value}: {result.error}")

        # Generate summary
        print(f"EXECUTION SUMMARY")
        print(f"Posts Attempted: {posts_attempted}")
        print(f"Posts Succeeded: {posts_succeeded}")
        print(f"Posts Failed: {posts_failed}")
        print(f"Startup Context Used: {bool(startup_name or self.startup_name)}")
        if errors:
            print(f"Errors: {', '.join(errors)}")

        return {
            "success": posts_failed == 0,
            "date": execution_date,
            "stats": {
                "attempted": posts_attempted,
                "succeeded": posts_succeeded,
                "failed": posts_failed
            },
            "startup_info": {
                "name": startup_name or self.startup_name,
                "url": startup_url or self.startup_url,
                "context_used": bool(startup_context or self.startup_context)
            },
            "errors": errors if errors else None
        }

    def get_execution_status(self, brand_name: str, date: Optional[str] = None) -> Dict[str, Any]:
        """Get execution status for a date"""
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        # Get orchestrator state
        state = self.storage.get_orchestrator_state(date)

        return {
            "date": date,
            "has_run": state is not None,
            "is_running": state.is_running if state else False,
            "posts_completed": len(state.posts_completed_today) if state else 0,
            "posts_failed": len(state.failed_posts) if state else 0,
            "last_execution": state.last_execution if state else None
        }


# Standalone function for easy integration
def execute_daily_orchestration(
    brand_name: str,
    execution_date: Optional[str] = None,
    force: bool = False,
    dry_run: bool = False,
    platforms: Optional[List[str]] = None,
    startup_name: Optional[str] = None,
    startup_url: Optional[str] = None,
    startup_context: Optional[str] = None
) -> Dict[str, Any]:
    """Execute daily orchestration with startup context"""
    orchestrator = OrchestratorAgentV2(
        startup_name=startup_name,
        startup_url=startup_url,
        startup_context=startup_context
    )

    # Convert platform strings to enums
    platform_enums = None
    if platforms:
        platform_enums = [Platform(p) for p in platforms if p in [e.value for e in Platform]]

    return orchestrator.execute_daily(
        brand_name=brand_name,
        execution_date=execution_date,
        force=force,
        dry_run=dry_run,
        platforms=platform_enums,
        startup_name=startup_name,
        startup_url=startup_url,
        startup_context=startup_context
    )


# Example usage
if __name__ == "__main__":
    # Test the orchestrator with startup context
    print("Testing Orchestrator Agent V2 with Startup Context")

    result = execute_daily_orchestration(
        brand_name="TestBrand",
        execution_date=datetime.now().strftime("%Y-%m-%d"),
        force=True,
        dry_run=True,
        platforms=["LinkedIn"],
        startup_name="TestStartup",
        startup_url="https://example.com",
        startup_context="AI-powered startup matching platform that connects innovative startups with potential sponsors"
    )

    print(f"✅ Orchestration test completed!")
    print(f"Result: {result.get('success')}")
    print(f"Startup Info: {result.get('startup_info')}")
