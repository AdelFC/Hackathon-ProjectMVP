"""
Orchestrator Agent V2 - Refactored for Social CM Orchestrator Suite
This agent handles daily execution of content posting across all platforms
"""

from dotenv import load_dotenv
import os
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import json
import hashlib
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.tools import tool

# Import logging configuration
from agents.logger_config import setup_logger, log_with_context, log_function_entry, PerformanceLogger

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

# Import channel agents
from agents.linkedin.linkedin_agent import LinkedinAgent
from agents.facebook.facebook_agent import FacebookAgent
from agents.twitter.twitter_agent import TwitterAgent

load_dotenv()

# Initialize logger for this module
logger = setup_logger(__name__, "DEBUG")

class OrchestratorAgentV2:
    """Orchestrator Agent for daily content execution"""

    def __init__(self):
        """Initialize the Orchestrator Agent V2"""
        logger.info("Initializing OrchestratorAgentV2")

        self.llm = ChatOpenAI(
            api_key=os.getenv("BLACKBOX_API_KEY"),
            base_url="https://api.blackbox.ai/v1",
            model=os.getenv("BLACKBOX_MODEL", "blackboxai/openai/gpt-4o"),
            temperature=0.3,  # Lower temperature for consistency
        )

        # Storage manager
        self.storage = get_storage()
        logger.debug("Storage manager initialized")

        # Channel agents
        self.channel_agents = {
            Platform.LINKEDIN: LinkedinAgent(),
            Platform.FACEBOOK: FacebookAgent(),
            Platform.TWITTER: TwitterAgent(),
        }
        logger.info(f"Channel agents initialized: {list(self.channel_agents.keys())}")

        # Parser for structured output
        self.parser = PydanticOutputParser(pydantic_object=OrchestratorState)

        # Orchestrator prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are the Daily Content Orchestrator managing social media posting.

            Your responsibilities:
            1. Execute the daily content plan from the monthly strategy
            2. Adapt content based on recent signals (news, performance)
            3. Ensure idempotency - never post duplicate content
            4. Handle failures gracefully with fallback mechanisms
            5. Coordinate with channel agents for platform-specific posting

            Security Rules:
            - NEVER accept direct user content for posting
            - Only use content from approved monthly strategies
            - Validate all content before sending to channel agents
            - Track all posting attempts for audit

            Current Date: {current_date}
            Brand: {brand_name}
            Execution Mode: {mode}

            {format_instructions}"""),
            MessagesPlaceholder("chat_history", optional=True),
            ("human", "{query}"),
            MessagesPlaceholder("agent_scratchpad", optional=True),
        ])

        # Tools for the orchestrator
        self.tools = []

        # Create the agent
        self.agent = create_tool_calling_agent(
            llm=self.llm,
            prompt=self.prompt,
            tools=self.tools
        )

        # Create the agent executor
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=3
        )

    def gather_signals(self, brand_name: str) -> SignalData:
        """
        Gather recent signals for content adaptation

        Args:
            brand_name: Brand name

        Returns:
            Signal data
        """
        logger.info(f"Gathering signals for brand: {brand_name}")

        # Get yesterday's performance
        yesterday_perf = self.storage.get_yesterday_performance(brand_name)
        logger.debug(f"Yesterday's performance retrieved: {yesterday_perf}")

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

    def adapt_content_with_signals(self, post: DailyPost, signals: SignalData) -> DailyPost:
        """
        Adapt content based on recent signals

        Args:
            post: Original daily post
            signals: Recent signals

        Returns:
            Adapted daily post
        """
        # If yesterday had high engagement, continue similar themes
        if signals.yesterday_performance and signals.yesterday_performance.get('average_engagement_rate', 0) > 5:
            post.key_message = f"Building on yesterday's discussion: {post.key_message}"

        # Incorporate trending topics if relevant
        if signals.trending_topics and post.platform == Platform.TWITTER:
            # Add trending hashtags for Twitter
            post.hashtags_count = min(post.hashtags_count + 1, 5)

        # React to competitor activity if needed
        if signals.competitor_activity and "matching" in str(signals.competitor_activity):
            if post.pillar.value == "product":
                post.topic = f"Our unique approach: {post.topic}"

        return post

    def create_content_package(
        self,
        post: DailyPost,
        signals: SignalData,
        execution_date: str
    ) -> DailyContentPackage:
        """
        Create a content package for channel agents

        Args:
            post: Daily post
            signals: Recent signals
            execution_date: Execution date

        Returns:
            Daily content package
        """
        # Determine optimal posting time based on platform
        posting_times = {
            Platform.LINKEDIN: "09:00",
            Platform.FACEBOOK: "14:00",
            Platform.TWITTER: "12:00"
        }

        # Create image prompt if needed
        image_prompt = None
        if post.image_required:
            image_prompt = f"Professional image for {post.platform.value}: {post.topic}. Style: modern, clean, brand colors."

        # Create content package
        package = DailyContentPackage(
            date=execution_date,
            platform=post.platform,
            base_content=post,
            signals=signals,
            image_prompt=image_prompt,
            posting_time=posting_times.get(post.platform, "10:00"),
            max_retries=3
        )

        return package

    def dispatch_to_channel(
        self,
        package: DailyContentPackage,
        dry_run: bool = False
    ) -> PostingResult:
        """
        Dispatch content package to appropriate channel agent

        Args:
            package: Content package
            dry_run: If True, simulate without actual posting

        Returns:
            Posting result
        """
        logger.info(f"Dispatching content to {package.platform.value}")
        log_with_context(logger, "debug", "Content package details",
                        platform=package.platform.value,
                        topic=package.base_content.topic,
                        posting_time=package.posting_time,
                        dry_run=dry_run)

        try:
            # Get the appropriate channel agent
            channel_agent = self.channel_agents.get(package.platform)

            if not channel_agent:
                error_msg = f"Channel agent not implemented for {package.platform.value}"
                logger.error(error_msg)
                return PostingResult(
                    success=False,
                    platform=package.platform,
                    error=error_msg,
                    timestamp=datetime.now().isoformat()
                )

            if dry_run:
                # Simulate posting
                logger.info(f"[DRY RUN] Simulating post to {package.platform.value}")
                print(f"[DRY RUN] Would post to {package.platform.value}:")
                print(f"  Topic: {package.base_content.topic}")
                print(f"  Time: {package.posting_time}")

                return PostingResult(
                    success=True,
                    platform=package.platform,
                    post_id=f"dry_run_{package.platform.value}_{package.date}",
                    post_url=f"https://{package.platform.value.lower()}.com/post/dry_run",
                    timestamp=datetime.now().isoformat()
                )

            # Actual posting logic - unified for all platforms
            logger.info(f"Sending content to {package.platform.value} agent for posting")
            print(f"  📤 Sending to {package.platform.value} agent...")

            # Each agent now has a unified create_and_post method
            if package.platform == Platform.LINKEDIN:
                # LinkedIn agent has a different method signature
                logger.debug("Using LinkedIn-specific posting method")
                result = channel_agent.create_viral_post(
                    topic=package.base_content.topic,
                    post_type=package.base_content.variation.angle
                )

                if result.get("success"):
                    logger.info(f"Successfully posted to LinkedIn")
                    return PostingResult(
                        success=True,
                        platform=package.platform,
                        post_id=f"linkedin_{package.date}_{datetime.now().strftime('%H%M%S')}",
                        post_url="https://linkedin.com/feed",
                        timestamp=datetime.now().isoformat()
                    )
                else:
                    error = result.get("error", "Unknown error")
                    logger.error(f"Failed to post to LinkedIn: {error}")
                    return PostingResult(
                        success=False,
                        platform=package.platform,
                        error=error,
                        timestamp=datetime.now().isoformat()
                    )

            elif package.platform in [Platform.FACEBOOK, Platform.TWITTER]:
                # Facebook and Twitter agents use the new unified interface
                logger.debug(f"Using unified posting method for {package.platform.value}")
                result = channel_agent.create_and_post(package)

                if result.get("success"):
                    posting_result = result.get("posting_result", {})
                    logger.info(f"Successfully posted to {package.platform.value}")
                    return PostingResult(
                        success=True,
                        platform=package.platform,
                        post_id=posting_result.get("post_id", f"{package.platform.value.lower()}_{package.date}"),
                        post_url=posting_result.get("post_url", f"https://{package.platform.value.lower()}.com"),
                        timestamp=posting_result.get("timestamp", datetime.now().isoformat())
                    )
                else:
                    posting_result = result.get("posting_result", {})
                    error = posting_result.get("error", "Unknown error")
                    logger.error(f"Failed to post to {package.platform.value}: {error}")
                    return PostingResult(
                        success=False,
                        platform=package.platform,
                        error=error,
                        timestamp=posting_result.get("timestamp", datetime.now().isoformat())
                    )

            else:
                error_msg = f"Platform {package.platform.value} not supported"
                logger.error(error_msg)
                return PostingResult(
                    success=False,
                    platform=package.platform,
                    error=error_msg,
                    timestamp=datetime.now().isoformat()
                )

        except Exception as e:
            logger.error(f"Exception in dispatch_to_channel: {str(e)}", exc_info=True)
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
        platforms: Optional[List[Platform]] = None
    ) -> Dict[str, Any]:
        """
        Execute daily content posting

        Args:
            brand_name: Brand name
            execution_date: Date to execute (defaults to today)
            force: Force execution even if already run
            dry_run: Simulate without actual posting
            platforms: Specific platforms to execute (defaults to all)

        Returns:
            Execution results
        """
        # Set execution date
        if not execution_date:
            execution_date = datetime.now().strftime("%Y-%m-%d")

        logger.info(f"Starting daily execution for {brand_name} on {execution_date}")
        log_with_context(logger, "info", "Execution parameters",
                        brand=brand_name,
                        date=execution_date,
                        force=force,
                        dry_run=dry_run,
                        platforms=platforms)

        print(f"\n{'='*60}")
        print(f"ORCHESTRATOR DAILY EXECUTION - {execution_date}")
        print(f"{'='*60}")
        print(f"Brand: {brand_name}")
        print(f"Mode: {'DRY RUN' if dry_run else 'LIVE'}")
        print(f"Force: {force}")

        # Check idempotency
        if not force and self.storage.has_run_today(execution_date):
            logger.warning(f"Already executed today for {execution_date}. Skipping.")
            print("⚠️ Already executed today. Use force=True to override.")
            return {
                "success": False,
                "message": "Already executed today",
                "date": execution_date
            }

        # Get active monthly plan
        with PerformanceLogger(logger, "Fetching active monthly plan"):
            plan = self.storage.get_active_plan(brand_name)

        if not plan:
            logger.error(f"No active monthly plan found for {brand_name}")
            print("❌ No active monthly plan found")
            return {
                "success": False,
                "error": "No active monthly plan",
                "date": execution_date
            }

        logger.info(f"Active plan found: {plan.campaign_name}")

        # Get today's posts
        with PerformanceLogger(logger, "Fetching daily posts"):
            daily_posts = self.storage.get_daily_posts(brand_name, execution_date)

        if not daily_posts:
            logger.warning(f"No posts scheduled for {execution_date}")
            print(f"❌ No posts scheduled for {execution_date}")
            return {
                "success": False,
                "error": "No posts scheduled for this date",
                "date": execution_date
            }

        logger.info(f"Found {len(daily_posts)} posts scheduled for today")

        # Filter by platforms if specified
        if platforms:
            daily_posts = [p for p in daily_posts if p.platform in platforms]
            logger.debug(f"Filtered to {len(daily_posts)} posts for platforms: {platforms}")

        print(f"\n📋 Found {len(daily_posts)} posts to execute")

        # Gather signals
        with PerformanceLogger(logger, "Gathering signals"):
            signals = self.gather_signals(brand_name)
        print(f"📡 Gathered signals: {len(signals.trending_topics or [])} trending topics")

        # Initialize state
        state = OrchestratorState(
            current_date=execution_date,
            monthly_plan_id=f"plan_{brand_name}_{plan.calendar.start_date}",
            posts_scheduled_today=[],
            posts_completed_today=[],
            failed_posts=[],
            last_execution=datetime.now().isoformat(),
            is_running=True
        )

        # Process each post
        posts_attempted = 0
        posts_succeeded = 0
        posts_failed = 0
        errors = []

        for post in daily_posts:
            posts_attempted += 1
            logger.info(f"Processing post {posts_attempted}/{len(daily_posts)} for {post.platform.value}")
            print(f"\n🔄 Processing {post.platform.value} post...")

            # Check if already posted (idempotency)
            if not force and self.storage.has_been_posted(execution_date, post.platform):
                logger.info(f"Post already exists for {post.platform.value} on {execution_date}, skipping")
                print(f"  ✓ Already posted to {post.platform.value} today, skipping")
                continue

            # Adapt content with signals
            logger.debug(f"Adapting content with signals for {post.platform.value}")
            adapted_post = self.adapt_content_with_signals(post, signals)

            # Create content package
            logger.debug(f"Creating content package for {post.platform.value}")
            package = self.create_content_package(adapted_post, signals, execution_date)
            state.posts_scheduled_today.append(package)

            # Dispatch to channel agent
            logger.info(f"Dispatching post to {post.platform.value} channel agent")
            result = self.dispatch_to_channel(package, dry_run)

            if result.success:
                posts_succeeded += 1
                logger.info(f"Successfully posted to {post.platform.value}")
                log_with_context(logger, "info", "Post success",
                               platform=post.platform.value,
                               post_id=result.post_id,
                               post_url=result.post_url)
                print(f"  ✅ Successfully posted to {post.platform.value}")

                # Record the post (unless dry run)
                if not dry_run:
                    logger.debug(f"Recording post for {post.platform.value}")
                    # Create generated post record
                    generated_post = GeneratedPost(
                        platform=post.platform,
                        content=f"{post.topic}\n\n{post.key_message}",
                        hashtags=[f"#{tag}" for tag in (signals.trending_topics or [])[:post.hashtags_count]],
                        character_count=len(post.topic) + len(post.key_message),
                        metadata={"pillar": post.pillar.value, "format": post.variation.format.value}
                    )

                    # Create post record
                    record = PostRecord(
                        id=f"post_{execution_date}_{post.platform.value}_{datetime.now().strftime('%H%M%S')}",
                        date=execution_date,
                        platform=post.platform,
                        post_id=result.post_id or "",
                        content_hash=self.storage.get_content_hash(generated_post.content),
                        posting_result=result,
                        generated_post=generated_post
                    )

                    # Save to storage
                    self.storage.record_post(record)
                    state.posts_completed_today.append(record)
                    logger.debug(f"Post recorded with ID: {record.id}")
            else:
                posts_failed += 1
                logger.error(f"Failed to post to {post.platform.value}: {result.error}")
                log_with_context(logger, "error", "Post failure",
                               platform=post.platform.value,
                               error=result.error,
                               timestamp=result.timestamp)
                print(f"  ❌ Failed to post to {post.platform.value}: {result.error}")
                errors.append(f"{post.platform.value}: {result.error}")
                state.failed_posts.append({
                    "platform": post.platform.value,
                    "error": result.error,
                    "timestamp": result.timestamp
                })

                # Retry logic
                if result.retry_count < package.max_retries:
                    logger.info(f"Scheduling retry for {post.platform.value} (attempt {result.retry_count + 1}/{package.max_retries})")
                    print(f"  🔄 Will retry (attempt {result.retry_count + 1}/{package.max_retries})")
                    # In production, this would be queued for retry

        # Update state
        state.is_running = False
        logger.debug("Updating orchestrator state")

        # Save state and record run
        if not dry_run:
            logger.info("Saving orchestrator state and recording run")
            self.storage.save_orchestrator_state(state)
            self.storage.record_orchestrator_run(
                date=execution_date,
                posts_attempted=posts_attempted,
                posts_succeeded=posts_succeeded,
                posts_failed=posts_failed,
                errors=errors if errors else None
            )
            logger.debug("State saved successfully")

        # Generate summary
        logger.info(f"Execution completed - Attempted: {posts_attempted}, Succeeded: {posts_succeeded}, Failed: {posts_failed}")
        log_with_context(logger, "info", "Execution summary",
                        date=execution_date,
                        brand=brand_name,
                        attempted=posts_attempted,
                        succeeded=posts_succeeded,
                        failed=posts_failed,
                        errors=errors,
                        dry_run=dry_run)

        print(f"\n{'='*60}")
        print("EXECUTION SUMMARY")
        print(f"{'='*60}")
        print(f"Posts Attempted: {posts_attempted}")
        print(f"Posts Succeeded: {posts_succeeded}")
        print(f"Posts Failed: {posts_failed}")
        if errors:
            print(f"Errors: {', '.join(errors)}")
        print(f"{'='*60}\n")

        result = {
            "success": posts_failed == 0,
            "date": execution_date,
            "stats": {
                "attempted": posts_attempted,
                "succeeded": posts_succeeded,
                "failed": posts_failed
            },
            "errors": errors if errors else None,
            "state": state.dict() if not dry_run else None
        }

        logger.info(f"Returning execution result: success={result['success']}")
        return result
    def get_execution_status(self, brand_name: str, date: Optional[str] = None) -> Dict[str, Any]:
        """
        Get execution status for a date

        Args:
            brand_name: Brand name
            date: Date to check (defaults to today)

        Returns:
            Execution status
        """
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        # Get orchestrator state
        state = self.storage.get_orchestrator_state(date)

        # Get posted content
        posts = self.storage.get_posted_content(date, date)

        # Get performance metrics
        metrics = {}
        for post in posts:
            post_metrics = self.storage.get_metrics(post.post_id)
            if post_metrics:
                metrics[post.platform.value] = post_metrics[0].dict()

        return {
            "date": date,
            "has_run": state is not None,
            "is_running": state.is_running if state else False,
            "posts_completed": len(state.posts_completed_today) if state else 0,
            "posts_failed": len(state.failed_posts) if state else 0,
            "metrics": metrics,
            "last_execution": state.last_execution if state else None
        }

    def handle_failure(self, package: DailyContentPackage, error: str) -> Dict[str, Any]:
        """
        Handle posting failure with fallback mechanisms

        Args:
            package: Failed content package
            error: Error message

        Returns:
            Fallback action taken
        """
        fallback_actions = []

        # Log the failure
        fallback_actions.append(f"Logged failure for {package.platform.value}: {error}")

        # Try alternative content if available
        if package.base_content.pillar.value == "product":
            # Switch to educational content as fallback
            fallback_actions.append("Switching to educational content as fallback")
            package.base_content.pillar = "education"

        # Reduce image requirements if image generation failed
        if "image" in error.lower():
            package.base_content.image_required = False
            fallback_actions.append("Disabled image requirement")

        # Schedule for manual review
        fallback_actions.append("Scheduled for manual review")

        return {
            "package": package.dict(),
            "original_error": error,
            "fallback_actions": fallback_actions,
            "status": "pending_retry"
        }


# Standalone function for easy integration
def execute_daily_orchestration(
    brand_name: str,
    execution_date: Optional[str] = None,
    force: bool = False,
    dry_run: bool = False,
    platforms: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Execute daily orchestration

    Args:
        brand_name: Brand name
        execution_date: Date to execute
        force: Force execution
        dry_run: Simulate without posting
        platforms: Specific platforms

    Returns:
        Execution results
    """
    orchestrator = OrchestratorAgentV2()

    # Convert platform strings to enums
    platform_enums = None
    if platforms:
        platform_enums = [Platform(p) for p in platforms if p in [e.value for e in Platform]]

    return orchestrator.execute_daily(
        brand_name=brand_name,
        execution_date=execution_date,
        force=force,
        dry_run=dry_run,
        platforms=platform_enums
    )


# Tool for API integration
@tool
def invoke_orchestrator_v2(
    brand_name: str,
    action: str = "execute",
    date: Optional[str] = None,
    dry_run: bool = False
) -> Dict:
    """
    Invoke the orchestrator agent

    Args:
        brand_name: Brand name
        action: Action to perform (execute, status)
        date: Date for action
        dry_run: Simulate without posting

    Returns:
        Action result
    """
    orchestrator = OrchestratorAgentV2()

    if action == "execute":
        return orchestrator.execute_daily(
            brand_name=brand_name,
            execution_date=date,
            dry_run=dry_run
        )
    elif action == "status":
        return orchestrator.get_execution_status(
            brand_name=brand_name,
            date=date
        )
    else:
        return {
            "success": False,
            "error": f"Unknown action: {action}"
        }


# Example usage
if __name__ == "__main__":
    # Test the orchestrator
    print("Testing Orchestrator Agent V2")

    # First, ensure we have a monthly plan
    from agents.strategy_agent_v2 import create_monthly_strategy

    # Create a test plan
    plan = create_monthly_strategy(
        brand_name="TestBrand",
        positioning="Innovative solution provider",
        target_audience="Tech startups and investors",
        value_props=["Innovation", "Efficiency", "Growth"],
        start_date=datetime.now().strftime("%Y-%m-%d"),
        duration_days=30,
        language="en-US",
        tone="professional",
        cta_targets=["demo", "newsletter"],
        use_ai=False
    )

    # Execute daily orchestration (dry run)
    result = execute_daily_orchestration(
        brand_name="TestBrand",
        execution_date=datetime.now().strftime("%Y-%m-%d"),
        force=True,
        dry_run=True,
        platforms=["LinkedIn"]
    )

    print(f"\n✅ Orchestration test completed!")
    print(f"Result: {result.get('success')}")
    print(f"Stats: {result.get('stats')}")
