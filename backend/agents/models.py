"""
Shared models for the Social CM Orchestrator Suite
These models define the structure for communication between agents
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime, date

# Enums for content types and platforms
class Platform(str, Enum):
    """Supported social media platforms"""
    LINKEDIN = "LinkedIn"
    FACEBOOK = "Facebook"
    TWITTER = "Twitter"

class ContentPillar(str, Enum):
    """Content pillars for editorial strategy"""
    EDUCATION = "education"
    SOCIAL_PROOF = "social_proof"
    PRODUCT = "product"
    BEHIND_THE_SCENES = "behind_the_scenes"
    THOUGHT_LEADERSHIP = "thought_leadership"
    COMMUNITY = "community"

class PostFormat(str, Enum):
    """Post formats"""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    CAROUSEL = "carousel"
    POLL = "poll"
    ARTICLE = "article"
    STORY = "story"

class CTAType(str, Enum):
    """Call-to-action types"""
    DEMO = "demo"
    NEWSLETTER = "newsletter"
    DISCORD = "discord"
    FREE_TRIAL = "free_trial"
    WEBINAR = "webinar"
    DOWNLOAD = "download"
    CONTACT = "contact"

# Models for individual posts
class PostVariation(BaseModel):
    """Variation rules for posts"""
    angle: str = Field(description="Content angle (e.g., problem-solving, inspirational, educational)")
    hook_style: str = Field(description="Hook style (e.g., question, statistic, story)")
    cta_type: CTAType = Field(description="Type of call-to-action")
    format: PostFormat = Field(description="Post format")

class DailyPost(BaseModel):
    """Model for a single post in the calendar"""
    date: str = Field(description="Date in YYYY-MM-DD format")
    platform: Platform = Field(description="Target platform")
    pillar: ContentPillar = Field(description="Content pillar")
    topic: str = Field(description="Post topic")
    key_message: str = Field(description="Key message to convey")
    variation: PostVariation = Field(description="Variation rules for this post")
    hashtags_count: int = Field(default=5, description="Number of hashtags to use")
    image_required: bool = Field(default=True, description="Whether image is required")
    dependencies: Optional[List[str]] = Field(default=None, description="Required assets or links")

# Monthly strategy models
class EditorialGuidelines(BaseModel):
    """Editorial guidelines and tone of voice"""
    tone: str = Field(description="Tone of voice (e.g., professional, friendly, authoritative)")
    do_list: List[str] = Field(description="Things to do")
    dont_list: List[str] = Field(description="Things to avoid")
    language: str = Field(default="fr-FR", description="Language code")
    brand_voice_attributes: List[str] = Field(description="Brand voice attributes")

class MonthlyCalendar(BaseModel):
    """Monthly content calendar"""
    start_date: str = Field(description="Start date (YYYY-MM-DD)")
    end_date: str = Field(description="End date (YYYY-MM-DD)")
    posts: List[DailyPost] = Field(description="List of daily posts (3 per day, one per platform)")
    total_posts: int = Field(description="Total number of posts")
    posts_per_platform: Dict[str, int] = Field(description="Number of posts per platform")

class MonthlyPlan(BaseModel):
    """Complete monthly strategy output from StrategyAgent"""
    campaign_name: str = Field(description="Campaign name")
    brand_name: str = Field(description="Brand name")
    positioning: str = Field(description="Brand positioning")
    target_audience: str = Field(description="Target audience description")
    value_propositions: List[str] = Field(description="Key value propositions")
    content_pillars: List[ContentPillar] = Field(description="Content pillars for the month")
    editorial_guidelines: EditorialGuidelines = Field(description="Editorial guidelines")
    calendar: MonthlyCalendar = Field(description="Monthly content calendar")
    variation_rules: Dict[str, List[str]] = Field(description="Variation rules by category")
    cta_targets: List[CTAType] = Field(description="CTA targets for the month")
    created_at: str = Field(description="Creation timestamp")
    version: str = Field(default="1.0", description="Plan version")
    startup_name: Optional[str] = Field(default=None, description="Startup name for content generation")
    startup_url: Optional[str] = Field(default=None, description="Startup URL for landing page analysis")

# Daily execution models
class SignalData(BaseModel):
    """Recent signals for content adaptation"""
    news_items: Optional[List[str]] = Field(default=None, description="Recent news items")
    yesterday_performance: Optional[Dict[str, Any]] = Field(default=None, description="Yesterday's performance metrics")
    trending_topics: Optional[List[str]] = Field(default=None, description="Current trending topics")
    competitor_activity: Optional[List[str]] = Field(default=None, description="Notable competitor activities")

class DailyContentPackage(BaseModel):
    """Content package sent from Orchestrator to Channel Agents"""
    date: str = Field(description="Execution date")
    platform: Platform = Field(description="Target platform")
    base_content: DailyPost = Field(description="Base content from strategy")
    signals: Optional[SignalData] = Field(default=None, description="Recent signals for adaptation")
    image_prompt: Optional[str] = Field(default=None, description="Image generation prompt if needed")
    posting_time: str = Field(description="Optimal posting time")
    max_retries: int = Field(default=3, description="Maximum retry attempts")
    startup_name: Optional[str] = Field(default=None, description="Startup name for content generation")
    startup_url: Optional[str] = Field(default=None, description="Startup URL for landing page analysis")

# Channel agent output models
class GeneratedPost(BaseModel):
    """Final post generated by a Channel Agent"""
    platform: Platform = Field(description="Platform")
    content: str = Field(description="Final post content")
    hashtags: List[str] = Field(description="Hashtags")
    image_base64: Optional[str] = Field(default=None, description="Base64 encoded image")
    image_url: Optional[str] = Field(default=None, description="Image URL if uploaded")
    character_count: int = Field(description="Character count")
    estimated_reach: Optional[int] = Field(default=None, description="Estimated reach")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Platform-specific metadata")

class PostingResult(BaseModel):
    """Result of posting attempt"""
    success: bool = Field(description="Whether posting was successful")
    platform: Platform = Field(description="Platform")
    post_id: Optional[str] = Field(default=None, description="Platform post ID")
    post_url: Optional[str] = Field(default=None, description="URL of the posted content")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    timestamp: str = Field(description="Posting timestamp")
    retry_count: int = Field(default=0, description="Number of retries attempted")

# Storage and tracking models
class PostRecord(BaseModel):
    """Record of a posted content for idempotency"""
    id: str = Field(description="Unique record ID")
    date: str = Field(description="Post date")
    platform: Platform = Field(description="Platform")
    post_id: str = Field(description="Platform post ID")
    content_hash: str = Field(description="Hash of content for deduplication")
    posting_result: PostingResult = Field(description="Posting result")
    generated_post: GeneratedPost = Field(description="Generated post content")

class PerformanceMetrics(BaseModel):
    """Performance metrics for a post"""
    post_id: str = Field(description="Post ID")
    platform: Platform = Field(description="Platform")
    impressions: int = Field(default=0, description="Number of impressions")
    engagements: int = Field(default=0, description="Total engagements")
    clicks: int = Field(default=0, description="Number of clicks")
    shares: int = Field(default=0, description="Number of shares")
    comments: int = Field(default=0, description="Number of comments")
    likes: int = Field(default=0, description="Number of likes")
    engagement_rate: float = Field(default=0.0, description="Engagement rate percentage")
    measured_at: str = Field(description="Measurement timestamp")

# Orchestrator state models
class OrchestratorState(BaseModel):
    """State tracking for the orchestrator"""
    current_date: str = Field(description="Current execution date")
    monthly_plan_id: str = Field(description="Active monthly plan ID")
    posts_scheduled_today: List[DailyContentPackage] = Field(description="Today's scheduled posts")
    posts_completed_today: List[PostRecord] = Field(description="Today's completed posts")
    failed_posts: List[Dict[str, Any]] = Field(default_factory=list, description="Failed posting attempts")
    last_execution: str = Field(description="Last execution timestamp")
    is_running: bool = Field(default=False, description="Whether orchestrator is currently running")

# API request/response models
class StrategyRequest(BaseModel):
    """Request model for strategy generation"""
    brand_name: str = Field(description="Brand name")
    positioning: str = Field(description="Brand positioning")
    target_audience: str = Field(description="Target audience")
    value_props: List[str] = Field(description="Value propositions")
    start_date: str = Field(description="Campaign start date")
    duration_days: int = Field(default=30, description="Campaign duration in days")
    language: str = Field(default="fr-FR", description="Content language")
    tone: str = Field(default="professional", description="Tone of voice")
    cta_targets: List[str] = Field(description="CTA targets")
    startup_name: Optional[str] = Field(default=None, description="Startup name for content generation")
    startup_url: Optional[str] = Field(default=None, description="Startup URL for landing page analysis")

class OrchestratorRequest(BaseModel):
    """Request model for daily orchestration"""
    company_name: Optional[str] = Field(default="TestCompany", description="Company Name")
    execute_date: Optional[str] = Field(default=None, description="Date to execute (defaults to today)")
    force_execution: bool = Field(default=False, description="Force execution even if already run today")
    dry_run: bool = Field(default=False, description="Simulate execution without posting")
    platforms: Optional[List[Platform]] = Field(default=None, description="Specific platforms to execute")
    startup_name: Optional[str] = Field(default=None, description="Startup name for content generation")
    startup_url: Optional[str] = Field(default=None, description="Startup URL for landing page analysis")

class AnalyticsRequest(BaseModel):
    """Request model for analytics"""
    start_date: str = Field(description="Start date for analytics")
    end_date: str = Field(description="End date for analytics")
    platforms: Optional[List[Platform]] = Field(default=None, description="Specific platforms to analyze")
    metrics: Optional[List[str]] = Field(default=None, description="Specific metrics to retrieve")
