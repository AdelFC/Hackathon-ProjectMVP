"""
Shared utility for image URL generation using Blackbox AI
Used by Twitter, Facebook, and LinkedIn agents
"""

import os
import requests
import json
from typing import Optional, Dict, Any
from datetime import datetime


def generate_image_url(prompt: str, style: str = "professional", platform: str = "general") -> str:
    """
    Generate an image URL using Blackbox AI and return the URL to be incorporated into post text.

    Args:
        prompt: Content/theme or image description for the image
        style: Visual style preset (professional|modern|minimalist|colorful)
        platform: Target platform (linkedin|twitter|facebook|general)

    Returns:
        str: Image URL that can be incorporated into post text

    Raises:
        ValueError: If BLACKBOX_API_KEY is not set
        RuntimeError: If image generation fails
    """

    API_KEY = os.getenv("BLACKBOX_API_KEY")
    if not API_KEY:
        raise ValueError("BLACKBOX_API_KEY environment variable is required")
    API_URL = "https://api.blackbox.ai/v1/chat/completions"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    # Style snippets for prompt composition based on platform
    style_snippets = {
        "professional": "professional business graphic, clean corporate design, modern office aesthetic, professional style",
        "modern": "modern minimalist design, contemporary business style, sleek and sophisticated, tech-forward aesthetic",
        "minimalist": "minimalist design, clean white background, elegant typography, high negative space, simple and impactful",
        "colorful": "vibrant colorful design, energetic business graphics, dynamic shapes and gradients, eye-catching visuals"
    }

    # Platform-specific image requirements
    platform_specs = {
        "linkedin": "LinkedIn post image, landscape orientation 1200x627 pixels, B2B professional audience",
        "twitter": "Twitter post image, square or landscape format 1200x675 pixels, social media optimized",
        "facebook": "Facebook post image, landscape format 1200x630 pixels, engaging social content",
        "general": "Social media post image, versatile format suitable for multiple platforms"
    }

    # Compose detailed prompt for image generation
    enhanced_prompt = (
        f"Create a high-quality {platform_specs.get(platform, platform_specs['general'])}. "
        f"Style: {style_snippets.get(style, style_snippets['professional'])}. "
        f"Theme and content: {prompt}. "
        f"Brand identity: Include 'MeetSponsors' branding subtly and professionally. "
        f"Footer: Add 'meetsponsors.com' website in small, elegant text at the bottom. "
        f"Requirements: Clean design, high quality rendering, crisp typography, professional appearance, "
        f"suitable for business audience, visually balanced composition, corporate-friendly aesthetic."
    )

    # Correct payload format for image generation API
    data = {
        "model": "blackboxai/black-forest-labs/flux-pro",
        "messages": [
            {
                "role": "user",
                "content": enhanced_prompt
            }
        ]
    }

    print(f"[Blackbox AI] Generating image for {platform} with style: {style}")
    print(f"[Blackbox AI] Using model: {data['model']}")
    print(f"[Blackbox AI] Prompt excerpt: {enhanced_prompt[:150]}...")

    try:
        # Make API request with extended timeout for image generation
        response = requests.post(API_URL, headers=headers, json=data, timeout=120)

        # Handle response
        if response.status_code != 200:
            error_msg = f"Blackbox API error {response.status_code}: {response.text}"
            print(f"[Blackbox AI] Error: {error_msg}")
            raise RuntimeError(error_msg)

        # Parse response - correct format for image generation API
        resp_data = response.json()
        print(f"[Blackbox AI] Response structure: {list(resp_data.keys()) if isinstance(resp_data, dict) else type(resp_data)}")

        print(f"[Blackbox AI] Full response: {resp_data}...")
        print("==========================================")

        # Extract image URL from response
        if "choices" in resp_data and resp_data["choices"]:
            image_url = resp_data["choices"][0]["message"]["content"]

            # Validate that we got a URL
            if image_url and ("http" in image_url or "https" in image_url):
                print(f"[Blackbox AI] Image URL generated successfully: {image_url}")
                return image_url
            else:
                print(f"[Blackbox AI] Invalid URL received: {image_url}")
                raise RuntimeError(f"Invalid image URL received: {image_url}")
        else:
            print(f"[Blackbox AI] Unexpected response format: {resp_data}")
            raise RuntimeError("No image URL found in API response")

    except Exception as e:
        error_msg = f"Failed to generate image URL with Blackbox AI: {str(e)}"
        print(f"[Blackbox AI] Critical error: {error_msg}")
        raise RuntimeError(error_msg)


def incorporate_image_into_post(post_content: str, image_url: str, platform: str = "general") -> str:
    """
    Incorporate the generated image URL into the post content based on platform conventions.

    Args:
        post_content: Original post text content
        image_url: Generated image URL
        platform: Target platform (linkedin|twitter|facebook|general)

    Returns:
        str: Post content with image URL incorporated
    """

    # Platform-specific image incorporation strategies
    if platform.lower() == "twitter":
        # Twitter: Add image URL at the end with a line break
        return f"{post_content}\n\n🖼️ {image_url}"

    elif platform.lower() == "linkedin":
        # LinkedIn: Add image URL with professional context
        return f"{post_content}\n\n📸 Visual: {image_url}"

    elif platform.lower() == "facebook":
        # Facebook: Add image URL with engaging context
        return f"{post_content}\n\n🎨 Check out this image: {image_url}"

    else:
        # General: Simple append
        return f"{post_content}\n\nImage: {image_url}"


def generate_and_incorporate_image(post_content: str, image_prompt: str, style: str = "professional", platform: str = "general") -> str:
    """
    Complete workflow: Generate image URL and incorporate it into post content.

    Args:
        post_content: Original post text content
        image_prompt: Prompt for image generation
        style: Visual style preset
        platform: Target platform

    Returns:
        str: Complete post content with incorporated image URL

    Raises:
        RuntimeError: If image generation fails
    """

    try:
        # Generate image URL
        image_url = generate_image_url(image_prompt, style, platform)

        # Incorporate into post content
        enhanced_post = incorporate_image_into_post(post_content, image_url, platform)

        print(f"[Image Utils] Successfully generated and incorporated image for {platform}")
        return enhanced_post

    except Exception as e:
        print(f"[Image Utils] Failed to generate and incorporate image: {str(e)}")
        # Return original content if image generation fails
        return post_content


def log_image_generation(platform: str, prompt: str, image_url: str, success: bool = True) -> None:
    """
    Log image generation activity for monitoring and debugging.

    Args:
        platform: Target platform
        prompt: Image generation prompt used
        image_url: Generated image URL (if successful)
        success: Whether generation was successful
    """

    timestamp = datetime.now().isoformat()
    log_entry = {
        "timestamp": timestamp,
        "platform": platform,
        "prompt": prompt[:100] + "..." if len(prompt) > 100 else prompt,
        "image_url": image_url if success else None,
        "success": success
    }

    # Log to console for now (can be extended to file logging)
    print(f"[Image Generation Log] {json.dumps(log_entry, indent=2)}")
