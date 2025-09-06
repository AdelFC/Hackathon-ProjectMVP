from dotenv import load_dotenv
import os
import requests
from bs4 import BeautifulSoup
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from typing import Optional, Dict
import re

load_dotenv()

class LandingPageAnalyzer:
    def __init__(self):
        """Initialize the Landing Page Analyzer with LLM"""
        self.llm = ChatOpenAI(
            api_key=os.getenv("BLACKBOX_API_KEY"),
            base_url="https://api.blackbox.ai/v1",
            model=os.getenv("BLACKBOX_MODEL", "blackboxai/openai/gpt-4o"),
            temperature=0.3,
        )

        self.analysis_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert at analyzing landing pages and extracting key business information.
            Analyze the provided webpage content and extract the following information in a structured format:

            1. Company/Product Name
            2. Main Value Proposition
            3. Target Audience
            4. Key Features/Services (list the main ones)
            5. Pricing Information (if available)
            6. Call-to-Action (main CTAs on the page)
            7. Contact Information (email, phone, social media links if present)
            8. Unique Selling Points
            9. Customer Testimonials or Social Proof (if present)
            10. Business Model (if discernible)

            Provide a comprehensive but concise analysis. If any information is not available, indicate "Not found" for that section.
            Format the output in a clear, readable structure."""),
            ("human", "Analyze this landing page content:\n\n{content}")
        ])

    def fetch_webpage_content(self, url: str) -> Optional[str]:
        """
        Fetch and extract text content from a webpage

        Args:
            url: The URL of the landing page to analyze

        Returns:
            Extracted text content or None if failed
        """
        try:
            # Add headers to avoid being blocked
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }

            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()

            # Parse HTML content
            soup = BeautifulSoup(response.text, 'html.parser')

            # Remove script and style elements
            for script in soup(["script", "style"]):
                script.decompose()

            # Extract text
            text = soup.get_text()

            # Clean up text
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)

            # Also extract meta tags for additional context
            meta_description = ""
            meta_desc_tag = soup.find("meta", attrs={"name": "description"})
            if meta_desc_tag and meta_desc_tag.get("content"):
                meta_description = f"Meta Description: {meta_desc_tag['content']}\n"

            # Extract title
            title = ""
            if soup.title:
                title = f"Page Title: {soup.title.string}\n"

            # Combine all information
            full_content = f"{title}{meta_description}\nPage Content:\n{text}"

            # Limit content length to avoid token limits
            if len(full_content) > 15000:
                full_content = full_content[:15000] + "... [Content truncated]"

            return full_content

        except requests.RequestException as e:
            print(f"Error fetching webpage: {e}")
            return None
        except Exception as e:
            print(f"Error processing webpage content: {e}")
            return None

    def analyze_landing_page(self, url: str) -> Dict[str, str]:
        """
        Main function to analyze a landing page and extract useful information

        Args:
            url: The URL of the landing page to analyze

        Returns:
            Dictionary containing the analysis results or error message
        """
        # Validate URL
        if not url or not url.startswith(('http://', 'https://')):
            return {
                "error": "Invalid URL. Please provide a valid URL starting with http:// or https://",
                "status": "failed"
            }

        # Fetch webpage content
        content = self.fetch_webpage_content(url)

        if not content:
            return {
                "error": "Failed to fetch webpage content. Please check the URL and try again.",
                "status": "failed"
            }

        try:
            # Analyze content using LLM
            chain = self.analysis_prompt | self.llm
            response = chain.invoke({"content": content})

            return {
                "url": url,
                "status": "success",
                "analysis": response.content,
                "raw_content_length": len(content)
            }

        except Exception as e:
            print(f"Error during LLM analysis: {e}")
            return {
                "error": f"Failed to analyze webpage content: {str(e)}",
                "status": "failed"
            }

# Standalone function for easy integration
def extract_landing_page_info(url: str) -> str:
    """
    Extract useful information from a landing page URL

    Args:
        url: The URL of the landing page to analyze

    Returns:
        String containing the extracted information or error message
    """
    analyzer = LandingPageAnalyzer()
    result = analyzer.analyze_landing_page(url)

    if result["status"] == "success":
        return result["analysis"]
    else:
        return f"Error: {result.get('error', 'Unknown error occurred')}"

