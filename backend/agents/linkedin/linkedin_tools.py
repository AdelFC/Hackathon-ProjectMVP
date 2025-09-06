"""
Custom tools for LinkedIn posting
— Cleaned up version using shared image utility
"""

from langchain_core.tools import tool
from typing import Optional, Dict
import requests
import json
import os
from datetime import datetime

# ---------- LinkedIn posting tool ----------
@tool
def post_to_linkedin(post_content: str, image_base64: Optional[str] = None, access_token: Optional[str] = None) -> Dict:
    """Post text (and optional base64 image) to LinkedIn via API or simulate locally when no token is set."""
    try:
        if not access_token:
            access_token = os.getenv("LINKEDIN_ACCESS_TOKEN")

        if not access_token:
            # Simulation mode when no LinkedIn token is available
            print("\n" + "="*50)
            print("SIMULATED LINKEDIN POST")
            print("="*50)
            print(f"\nContent:\n{post_content}")
            if image_base64:
                print(f"\nImage attached: Yes (base64 length: {len(image_base64)})")
            print("\n" + "="*50)

            # Save simulated post
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            post_dir = "backend/agents/linkedin/posts"
            os.makedirs(post_dir, exist_ok=True)
            post_file = os.path.join(post_dir, f"post_{timestamp}.json")

            with open(post_file, 'w') as f:
                json.dump({
                    "timestamp": timestamp,
                    "content": post_content,
                    "has_image": bool(image_base64),
                    "status": "simulated"
                }, f, indent=2)

            return {
                "success": True,
                "message": "Post simulated successfully (no LinkedIn token)",
                "post_id": f"simulated_{timestamp}",
                "file_saved": post_file
            }

        # Real LinkedIn API posting
        url = "https://api.linkedin.com/v2/ugcPosts"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }

        # Get person ID from environment or use placeholder
        person_id = os.getenv("LINKEDIN_PERSON_ID", "YOUR_PERSON_ID")

        post_data = {
            "author": f"urn:li:person:{person_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": post_content},
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
        }

        response = requests.post(url, headers=headers, json=post_data, timeout=30)

        if response.status_code == 201:
            return {
                "success": True,
                "message": "Posted successfully to LinkedIn",
                "post_id": response.json().get("id"),
                "response": response.json()
            }
        else:
            return {
                "success": False,
                "message": f"Failed to post: {response.status_code}",
                "error": response.text
            }

    except Exception as e:
        return {
            "success": False,
            "message": f"Error posting to LinkedIn: {str(e)}"
        }


# ---------- Analytics and optimization tools ----------
@tool
def analyze_best_posting_time(timezone: str = "UTC") -> Dict:
    """Return recommended posting times for LinkedIn in the given timezone."""
    best_times = {
        "Tuesday": ["08:00", "10:00", "12:00", "17:00"],
        "Wednesday": ["08:00", "09:00", "12:00", "17:00"],
        "Thursday": ["08:00", "10:00", "12:00", "17:00"],
        "Monday": ["10:00", "12:00"],
        "Friday": ["09:00", "11:00"],
        "Saturday": ["10:00"],
        "Sunday": ["19:00"]
    }

    current_day = datetime.now().strftime("%A")

    return {
        "current_day": current_day,
        "best_times_today": best_times.get(current_day, ["12:00"]),
        "best_days": ["Tuesday", "Wednesday", "Thursday"],
        "weekly_schedule": best_times,
        "timezone": timezone,
        "recommendation": f"Best time to post today ({current_day}): {best_times.get(current_day, ['12:00'])[0]} {timezone}"
    }


@tool
def get_trending_hashtags(industry: str = "tech") -> list:
    """Return up to 10 trending LinkedIn hashtags for the specified industry."""
    hashtags_db = {
        "tech": [
            "#TechInnovation", "#AI", "#MachineLearning", "#StartupLife", "#TechTrends",
            "#DigitalTransformation", "#CloudComputing", "#Cybersecurity", "#DataScience", "#SaaS"
        ],
        "marketing": [
            "#MarketingStrategy", "#DigitalMarketing", "#ContentMarketing", "#SEO",
            "#SocialMediaMarketing", "#BrandStrategy", "#MarketingTips", "#GrowthHacking",
            "#MarketingAutomation", "#ContentCreation"
        ],
        "finance": [
            "#FinTech", "#Investment", "#FinancialPlanning", "#Cryptocurrency",
            "#WealthManagement", "#Banking", "#FinancialLiteracy", "#Blockchain",
            "#InsurTech", "#DigitalBanking"
        ],
        "startup": [
            "#StartupLife", "#Entrepreneurship", "#StartupGrowth", "#Founders",
            "#VentureCapital", "#Innovation", "#StartupCommunity", "#ScaleUp",
            "#StartupFunding", "#TechStartup"
        ],
        "general": [
            "#Leadership", "#ProfessionalDevelopment", "#CareerGrowth", "#Networking",
            "#WorkLifeBalance", "#Productivity", "#Success", "#Motivation",
            "#BusinessGrowth", "#Innovation"
        ]
    }

    # Get industry-specific hashtags
    industry_hashtags = hashtags_db.get(industry.lower(), hashtags_db["general"])

    # Always include some startup hashtags for MeetSponsors
    startup_hashtags = hashtags_db["startup"]

    # Combine and deduplicate
    combined_hashtags = list(set(industry_hashtags[:7] + startup_hashtags[:3]))

    return combined_hashtags[:10]


@tool
def save_linkedin_post(post_content: str, image_path: Optional[str] = None) -> str:
    """Persist post content/metadata to disk and return the saved JSON path."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    save_dir = "backend/agents/linkedin/saved_posts"
    os.makedirs(save_dir, exist_ok=True)

    filename = os.path.join(save_dir, f"linkedin_post_{timestamp}.json")

    post_data = {
        "timestamp": timestamp,
        "content": post_content,
        "image_path": image_path,
        "character_count": len(post_content),
        "word_count": len(post_content.split()),
        "created_at": datetime.now().isoformat(),
        "hashtags": [tag for tag in post_content.split() if tag.startswith("#")]
    }

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(post_data, f, indent=2, ensure_ascii=False)

    print(f"[LinkedIn Tools] Post saved to: {filename}")
    return filename
