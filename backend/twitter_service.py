"""
Twitter/X API Service for posting content
"""

import os
import json
import hashlib
import hmac
import base64
import time
import urllib.parse
from typing import Optional, Dict, Any
import requests
from datetime import datetime
import secrets

# Twitter API credentials from environment variables
X_API_KEY = os.getenv("X_API_KEY", "")
X_KEY_SECRET = os.getenv("X_KEY_SECRET", "")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN", "")
X_ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET", "")


class TwitterService:
    """Service for posting to Twitter/X"""
    
    def __init__(self):
        self.api_key = X_API_KEY
        self.api_secret = X_KEY_SECRET
        self.access_token = X_ACCESS_TOKEN
        self.access_token_secret = X_ACCESS_TOKEN_SECRET
        
        if not all([self.api_key, self.api_secret, self.access_token, self.access_token_secret]):
            raise ValueError("Twitter API credentials not configured. Please set X_API_KEY, X_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET environment variables.")
    
    def _generate_oauth_signature(self, method: str, url: str, params: Dict[str, str]) -> str:
        """Generate OAuth 1.0a signature"""
        # Encode parameters
        encoded_params = "&".join([f"{urllib.parse.quote(k)}={urllib.parse.quote(str(v))}" for k, v in sorted(params.items())])
        
        # Create signature base string
        signature_base = f"{method.upper()}&{urllib.parse.quote(url)}&{urllib.parse.quote(encoded_params)}"
        
        # Create signing key
        signing_key = f"{urllib.parse.quote(self.api_secret)}&{urllib.parse.quote(self.access_token_secret)}"
        
        # Generate signature
        signature = hmac.new(
            signing_key.encode('utf-8'),
            signature_base.encode('utf-8'),
            hashlib.sha1
        ).digest()
        
        return base64.b64encode(signature).decode('utf-8')
    
    def _get_oauth_header(self, method: str, url: str, oauth_params: Optional[Dict] = None) -> str:
        """Generate OAuth authorization header"""
        # OAuth parameters
        oauth = {
            "oauth_consumer_key": self.api_key,
            "oauth_nonce": secrets.token_hex(16),
            "oauth_signature_method": "HMAC-SHA1",
            "oauth_timestamp": str(int(time.time())),
            "oauth_token": self.access_token,
            "oauth_version": "1.0"
        }
        
        # Merge with any additional parameters for signature
        all_params = {**oauth}
        if oauth_params:
            all_params.update(oauth_params)
        
        # Generate signature
        oauth["oauth_signature"] = self._generate_oauth_signature(method, url, all_params)
        
        # Build header
        header_parts = [f'{k}="{urllib.parse.quote(str(v))}"' for k, v in sorted(oauth.items())]
        return f"OAuth {', '.join(header_parts)}"
    
    def post_tweet(self, text: str, image_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Post a tweet to Twitter/X
        
        Args:
            text: The tweet text
            image_path: Optional path to an image file
            
        Returns:
            Response from Twitter API
        """
        url = "https://api.twitter.com/2/tweets"
        
        payload = {"text": text}
        
        # If image provided, upload it first
        if image_path and os.path.exists(image_path):
            try:
                media_id = self._upload_media(image_path)
                payload["media"] = {"media_ids": [media_id]}
            except Exception as e:
                print(f"Failed to upload image: {e}. Posting without image.")
        
        headers = {
            "Authorization": self._get_oauth_header("POST", url),
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            raise Exception(f"Failed to post tweet: {response.status_code} - {response.text}")
    
    def _upload_media(self, image_path: str) -> str:
        """
        Upload media to Twitter
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Media ID string
        """
        url = "https://upload.twitter.com/1.1/media/upload.json"
        
        with open(image_path, 'rb') as f:
            files = {'media': f}
            
            headers = {
                "Authorization": self._get_oauth_header("POST", url)
            }
            
            response = requests.post(url, headers=headers, files=files)
            
            if response.status_code == 200:
                return response.json()["media_id_string"]
            else:
                raise Exception(f"Failed to upload media: {response.status_code} - {response.text}")


# Singleton instance
_twitter_service = None

def get_twitter_service() -> TwitterService:
    """Get or create Twitter service instance"""
    global _twitter_service
    if _twitter_service is None:
        try:
            _twitter_service = TwitterService()
        except ValueError as e:
            print(f"Twitter service not available: {e}")
            return None
    return _twitter_service