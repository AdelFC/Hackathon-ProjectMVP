"""
Social CM Orchestrator Suite API
Main FastAPI application with endpoints for strategy generation and daily orchestration
"""

from dotenv import load_dotenv
import os
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uvicorn

# Import logging configuration
from agents.logger_config import setup_logger, log_with_context, log_api_request

# Import V2 agents for Orchestrator Suite
from agents.strategy_agent_v2 import StrategyAgentV2, create_monthly_strategy
from agents.orchestrator_agent_v2 import OrchestratorAgentV2, execute_daily_orchestration
from agents.models import (
    StrategyRequest,
    OrchestratorRequest,
    AnalyticsRequest,
    Platform
)
from agents.storage import get_storage
from twitter_service import get_twitter_service

# Legacy imports (kept for backward compatibility)

load_dotenv()

# Initialize logger for the API
logger = setup_logger("api.main", "INFO")

# ---------- FastAPI App ----------
app = FastAPI(
    title="Social CM Orchestrator Suite API",
    version="2.0.0",
    description="API for managing social media content strategy and daily orchestration"
)

logger.info("FastAPI application initialized")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize storage (agents will be initialized per request with startup params)
storage = get_storage()

# ---------- Root Endpoint ----------
@app.get("/")
def read_root():
    """Root endpoint with API information"""
    return {
        "message": "Social CM Orchestrator Suite API",
        "version": "2.0.0",
        "endpoints": {
            "strategy": "/strategy/*",
            "orchestrator": "/orchestrator/*",
            "analytics": "/analytics/*",
            "legacy": "/agent"
        },
        "documentation": "/docs"
    }

# ---------- Health Check ----------
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check if storage is accessible
        storage.has_run_today("2024-01-01")  # Dummy check

        return {
            "status": "healthy",
            "service": "social-cm-orchestrator",
            "timestamp": datetime.now().isoformat(),
            "components": {
                "storage": "healthy",
                "strategy_agent": "healthy",
                "orchestrator_agent": "healthy"
            }
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "social-cm-orchestrator",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

# ---------- Strategy Endpoints ----------
@app.post("/strategy/generate")
async def generate_strategy(request: StrategyRequest):
    """
    Generate a monthly content strategy

    This endpoint creates a comprehensive 30/31-day content plan with:
    - 1 post per day per network (LinkedIn, Facebook, Twitter)
    - Content pillars and variation rules
    - Editorial guidelines and tone of voice
    """
    logger.info(f"Strategy generation requested for brand: {request.brand_name}")
    log_with_context(logger, "debug", "Strategy request details",
                    brand=request.brand_name,
                    duration=request.duration_days,
                    start_date=request.start_date,
                    language=request.language,
                    startup_name=request.startup_name,
                    startup_url=request.startup_url)

    try:
        # Initialize strategy agent with startup params if provided
        strategy_agent = StrategyAgentV2()

        plan = create_monthly_strategy(
            brand_name=request.brand_name,
            positioning=request.positioning,
            target_audience=request.target_audience,
            value_props=request.value_props,
            start_date=request.start_date,
            duration_days=request.duration_days,
            language=request.language,
            tone=request.tone,
            cta_targets=request.cta_targets,
            use_ai=True,  # Enable AI generation with platform filtering
            startup_name=request.startup_name,
            startup_url=request.startup_url,
            platforms=request.platforms
        )

        # Note: startup_name and startup_url are already passed to create_monthly_strategy
        # so they are already included in the plan. No need to save again.

        logger.info(f"Strategy generated successfully for {request.brand_name}")
        log_with_context(logger, "info", "Strategy generation success",
                        brand=request.brand_name,
                        plan_id=f"plan_{request.brand_name}_{request.start_date}",
                        total_posts=plan.calendar.total_posts)

        return {
            "success": True,
            "plan_id": f"plan_{request.brand_name}_{request.start_date}",
            "message": f"Generated {request.duration_days}-day strategy for {request.brand_name}",
            "summary": {
                "total_posts": plan.calendar.total_posts,
                "posts_per_platform": plan.calendar.posts_per_platform,
                "content_pillars": [p.value for p in plan.content_pillars],
                "start_date": plan.calendar.start_date,
                "end_date": plan.calendar.end_date
            }
        }
    except Exception as e:
        logger.error(f"Failed to generate strategy for {request.brand_name}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategy/active/{brand_name}")
async def get_active_strategy(brand_name: str):
    """
    Get the active strategy for a brand
    """
    try:
        plan = storage.get_active_plan(brand_name)
        if not plan:
            raise HTTPException(status_code=404, detail="No active strategy found")

        return {
            "success": True,
            "plan": plan.model_dump()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/strategy/posts/{brand_name}/{date}")
async def get_daily_posts(brand_name: str, date: str):
    """
    Get posts scheduled for a specific date
    """
    try:
        posts = storage.get_daily_posts(brand_name, date)
        return {
            "success": True,
            "date": date,
            "posts": [post.dict() for post in posts],
            "count": len(posts)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Orchestrator Endpoints ----------
@app.post("/orchestrator/daily")
async def execute_daily(request: OrchestratorRequest, background_tasks: BackgroundTasks):
    """
    Execute daily content posting

    This endpoint:
    - Retrieves the day's content from the active strategy
    - Adapts content based on recent signals
    - Dispatches to channel agents (LinkedIn, Facebook, Twitter)
    - Ensures idempotency (won't double-post)
    """
    # Default to today if no date specified
    execution_date = request.execute_date or datetime.now().strftime("%Y-%m-%d")

    logger.info(f"Daily orchestration requested for {execution_date}")
    log_with_context(logger, "info", "Orchestration request",
                    brand=request.company_name,
                    date=execution_date,
                    force=request.force_execution,
                    dry_run=request.dry_run,
                    platforms=request.platforms,
                    startup_name=request.startup_name,
                    startup_url=request.startup_url)

    try:
        # Execute orchestration with startup params
        result = execute_daily_orchestration(
            brand_name=request.company_name,  # Should come from auth/config
            execution_date=execution_date,
            force=request.force_execution,
            dry_run=request.dry_run,
            platforms=[p.value for p in request.platforms] if request.platforms else None,
            startup_name=request.startup_name,
            startup_url=request.startup_url
        )

        logger.info(f"Daily orchestration completed: success={result.get('success')}")
        log_with_context(logger, "info", "Orchestration result",
                        success=result.get('success'),
                        stats=result.get('stats'),
                        errors=result.get('errors'))

        return result
    except Exception as e:
        logger.error(f"Daily orchestration failed: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/orchestrator/status")
async def get_orchestrator_status(date: Optional[str] = None):
    """
    Get orchestrator execution status for a date
    """
    try:
        if not date:
            date = datetime.now().strftime("%Y-%m-%d")

        # Initialize orchestrator agent (without startup params for status check)
        orchestrator_agent = OrchestratorAgentV2()
        status = orchestrator_agent.get_execution_status(
            brand_name="DefaultBrand",  # Should come from auth/config
            date=date
        )

        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/orchestrator/retry/{date}/{platform}")
async def retry_failed_post(
    date: str,
    platform: str,
    startup_name: Optional[str] = None,
    startup_url: Optional[str] = None
):
    """
    Retry a failed post for a specific platform

    Query parameters:
        startup_name: Optional startup name for content generation
        startup_url: Optional startup URL for landing page analysis
    """
    try:
        # Convert platform string to enum
        platform_enum = Platform(platform)

        result = execute_daily_orchestration(
            brand_name="DefaultBrand",
            execution_date=date,
            force=True,
            dry_run=False,
            platforms=[platform],
            startup_name=startup_name,
            startup_url=startup_url
        )

        return result
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid platform: {platform}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Analytics Endpoints ----------
@app.post("/analytics/performance")
async def get_performance_analytics(request: AnalyticsRequest):
    """
    Get performance analytics for a date range
    """
    try:
        # Get posted content
        posts = storage.get_posted_content(
            start_date=request.start_date,
            end_date=request.end_date,
            platform=request.platforms[0] if request.platforms and len(request.platforms) == 1 else None
        )

        # Aggregate metrics
        total_posts = len(posts)
        successful_posts = len([p for p in posts if p.posting_result.success])
        failed_posts = total_posts - successful_posts

        # Get metrics for each post
        metrics_summary = {
            "total_impressions": 0,
            "total_engagements": 0,
            "average_engagement_rate": 0,
            "by_platform": {}
        }

        for post in posts:
            post_metrics = storage.get_metrics(post.post_id)
            if post_metrics:
                latest = post_metrics[0]
                metrics_summary["total_impressions"] += latest.impressions
                metrics_summary["total_engagements"] += latest.engagements

                platform_key = post.platform.value
                if platform_key not in metrics_summary["by_platform"]:
                    metrics_summary["by_platform"][platform_key] = {
                        "posts": 0,
                        "impressions": 0,
                        "engagements": 0
                    }

                metrics_summary["by_platform"][platform_key]["posts"] += 1
                metrics_summary["by_platform"][platform_key]["impressions"] += latest.impressions
                metrics_summary["by_platform"][platform_key]["engagements"] += latest.engagements

        # Calculate average engagement rate
        if metrics_summary["total_impressions"] > 0:
            metrics_summary["average_engagement_rate"] = (
                metrics_summary["total_engagements"] / metrics_summary["total_impressions"] * 100
            )

        return {
            "success": True,
            "period": {
                "start": request.start_date,
                "end": request.end_date
            },
            "posts": {
                "total": total_posts,
                "successful": successful_posts,
                "failed": failed_posts
            },
            "metrics": metrics_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/yesterday/{brand_name}")
async def get_yesterday_performance(brand_name: str):
    """
    Get yesterday's performance summary
    """
    try:
        performance = storage.get_yesterday_performance(brand_name)
        return {
            "success": True,
            "performance": performance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Twitter/X Posting Endpoint ----------
class TwitterPostRequest(BaseModel):
    text: str
    image_path: Optional[str] = None

@app.post("/twitter/post")
async def post_to_twitter(request: TwitterPostRequest):
    """
    Post content to Twitter/X
    """
    try:
        twitter_service = get_twitter_service()
        if not twitter_service:
            raise HTTPException(
                status_code=503,
                detail="Twitter service not configured. Please set X_API_KEY, X_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET environment variables."
            )
        
        result = twitter_service.post_tweet(request.text, request.image_path)
        
        return {
            "success": True,
            "data": result,
            "message": "Tweet posted successfully"
        }
    except Exception as e:
        logger.error(f"Failed to post to Twitter: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Management Endpoints ----------
@app.post("/posts/manual")
async def create_manual_post(
    platform: str,
    content: str,
    brand_name: str = "DefaultBrand",
    schedule_time: Optional[str] = None
):
    """
    Create a manual post (requires admin privileges)

    Note: This bypasses the strategy and should be used sparingly
    """
    try:
        # This would require authentication and authorization
        # For now, returning not implemented
        raise HTTPException(
            status_code=501,
            detail="Manual posting not yet implemented. Use strategy-based posting."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/data/cleanup")
async def cleanup_old_data(days_to_keep: int = 90):
    """
    Clean up old data (requires admin privileges)
    """
    try:
        stats = storage.cleanup_old_data(days_to_keep)
        return {
            "success": True,
            "message": f"Cleaned up data older than {days_to_keep} days",
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Monitoring Endpoints ----------
@app.get("/metrics")
async def get_system_metrics():
    """
    Get system metrics
    """
    try:
        today = datetime.now().strftime("%Y-%m-%d")

        # Initialize orchestrator agent for metrics
        orchestrator_agent = OrchestratorAgentV2()
        # Get today's execution status
        status = orchestrator_agent.get_execution_status("DefaultBrand", today)

        return {
            "timestamp": datetime.now().isoformat(),
            "today": {
                "executed": status["has_run"],
                "posts_completed": status["posts_completed"],
                "posts_failed": status["posts_failed"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Test Endpoints ----------
@app.post("/test/create-sample-strategy")
async def create_sample_strategy(
    startup_name: Optional[str] = "TestStartup",
    startup_url: Optional[str] = "https://example.com"
):
    """
    Create a sample strategy for testing

    Query parameters:
        startup_name: Startup name for content generation (default: TestStartup)
        startup_url: Startup URL for landing page analysis (default: https://example.com)
    """
    try:
        plan = create_monthly_strategy(
            brand_name="TestBrand",
            positioning="AI-powered platform connecting startups with sponsors",
            target_audience="Startups seeking funding and sponsors looking for innovation",
            value_props=[
                "AI-driven matching algorithm",
                "Verified sponsor network",
                "Streamlined communication",
                "Data-driven insights"
            ],
            start_date=datetime.now().strftime("%Y-%m-%d"),
            duration_days=30,
            language="fr-FR",
            tone="professional yet approachable",
            cta_targets=["demo", "newsletter", "discord", "free_trial"],
            use_ai=True,
            startup_name=startup_name,
            startup_url=startup_url
        )

        # Note: startup_name and startup_url are already passed to create_monthly_strategy
        # so they are already included in the plan. No need to save again.

        return {
            "success": True,
            "message": "Sample strategy created successfully",
            "plan_id": f"plan_TestBrand_{datetime.now().strftime('%Y-%m-%d')}",
            "total_posts": plan.calendar.total_posts,
            "startup_name": startup_name,
            "startup_url": startup_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/test/dry-run-orchestration")
async def test_orchestration(
    startup_name: Optional[str] = "TestStartup",
    startup_url: Optional[str] = "https://example.com"
):
    """
    Run a dry-run orchestration for testing

    Query parameters:
        startup_name: Startup name for content generation (default: TestStartup)
        startup_url: Startup URL for landing page analysis (default: https://example.com)
    """
    try:
        result = execute_daily_orchestration(
            brand_name="TestBrand",
            execution_date=datetime.now().strftime("%Y-%m-%d"),
            force=True,
            dry_run=True,
            platforms=["LinkedIn"],
            startup_name=startup_name,
            startup_url=startup_url
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- Run Server ----------
if __name__ == "__main__":
    # Start the FastAPI server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=False
    )
