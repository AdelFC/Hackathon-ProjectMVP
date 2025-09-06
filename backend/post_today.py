#!/usr/bin/env python3
"""
Script to execute today's social media posts
"""

import sys
from datetime import datetime
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from agents.orchestrator_agent_v2 import execute_daily_orchestration
from agents.strategy_agent_v2 import create_monthly_strategy
from agents.storage import get_storage

def post_for_today(brand_name="YourBrandName", dry_run=False):
    """
    Execute today's posts for the specified brand

    Args:
        brand_name: Name of your brand
        dry_run: If True, simulates posting without actually posting
    """

    # Get today's date
    today = datetime.now().strftime("%Y-%m-%d")

    print(f"\n{'='*60}")
    print(f"POSTING FOR TODAY: {today}")
    print(f"Brand: {brand_name}")
    print(f"Mode: {'DRY RUN' if dry_run else 'LIVE POSTING'}")
    print(f"{'='*60}\n")

    # Check if there's an active strategy
    storage = get_storage()
    active_plan = storage.get_active_plan(brand_name)

    if not active_plan:
        print("❌ No active strategy found. Creating one first...")

        # Create a strategy if none exists
        plan = create_monthly_strategy(
            brand_name=brand_name,
            positioning="Your brand positioning statement",
            target_audience="Your target audience",
            value_props=[
                "Value proposition 1",
                "Value proposition 2",
                "Value proposition 3"
            ],
            start_date=today,
            duration_days=30,
            language="en-US",  # or "fr-FR" for French
            tone="professional",
            cta_targets=["demo", "newsletter", "free_trial"],
            use_ai=False
        )
        print(f"✅ Strategy created: {plan.campaign_name}")

    # Execute today's posts
    result = execute_daily_orchestration(
        brand_name=brand_name,
        execution_date=today,
        force=False,  # Set to True to force re-posting
        dry_run=dry_run,  # Set to False for actual posting
        platforms=["LinkedIn", "Facebook", "Twitter"]  # Or specify specific platforms
    )

    # Display results
    if result.get("success"):
        print(f"\n✅ Successfully executed today's posts!")
    else:
        print(f"\n⚠️ Execution completed with issues")

    print(f"\nStats:")
    print(f"  - Posts attempted: {result['stats']['attempted']}")
    print(f"  - Posts succeeded: {result['stats']['succeeded']}")
    print(f"  - Posts failed: {result['stats']['failed']}")

    if result.get("errors"):
        print(f"\nErrors encountered:")
        for error in result['errors']:
            print(f"  - {error}")

    return result

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Post today's social media content")
    parser.add_argument("--brand", default="YourBrandName", help="Brand name")
    parser.add_argument("--live", action="store_true", help="Actually post (not dry run)")
    parser.add_argument("--force", action="store_true", help="Force re-posting even if already done")

    args = parser.parse_args()

    # Execute posting
    result = post_for_today(
        brand_name=args.brand,
        dry_run=not args.live
    )

    # Exit with appropriate code
    sys.exit(0 if result.get("success") else 1)
