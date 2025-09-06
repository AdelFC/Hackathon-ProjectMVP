from dotenv import load_dotenv
import os
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.messages import HumanMessage, SystemMessage
import json
import base64
from pathlib import Path
from datetime import datetime

# Import custom modules
from landing_page_analyzer import extract_landing_page_info
from .linkedin_strategies import get_viral_strategy_prompt, get_post_template
from .linkedin_tools import (
    post_to_linkedin,
    analyze_best_posting_time,
    get_trending_hashtags,
    save_linkedin_post
)
from ..image_utils import generate_and_incorporate_image

load_dotenv()

class LinkedinPostResponse(BaseModel):
    """Response model for LinkedIn post generation"""
    post_content: str = Field(description="The viral LinkedIn post content")
    hashtags: List[str] = Field(description="List of relevant hashtags")
    image_description: str = Field(description="Description for the image to generate")
    post_type: str = Field(description="Type of post (transformation, lessons_learned, controversial, case_study, storytelling)")
    estimated_engagement: str = Field(description="Estimated engagement level (high, medium, low)")

class LinkedinAgent:
    """LinkedIn Agent for creating viral posts with images and posting them"""

    def __init__(self, startup_name: Optional[str] = None, startup_url: Optional[str] = None):
        """Initialize the LinkedIn Agent with LLM and tools

        Args:
            startup_name: Name of the startup for content generation
            startup_url: URL of the startup's landing page for analysis
        """
        # Set default values if not provided
        self.startup_name = startup_name or "Your Startup"
        self.startup_url = startup_url
        self.llm = ChatOpenAI(
            api_key=os.getenv("BLACKBOX_API_KEY"),
            base_url="https://api.blackbox.ai/v1",
            model=os.getenv("BLACKBOX_MODEL", "blackboxai/openai/gpt-4o"),
            temperature=0.7,  # Higher temperature for more creative posts
        )

        # Get viral strategies
        self.viral_strategies = get_viral_strategy_prompt()

        # Parser for structured output
        self.parser = PydanticOutputParser(pydantic_object=LinkedinPostResponse)

        # Create the main prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert LinkedIn content strategist and community manager for {startup_name}.
            Your goal is to create viral LinkedIn posts that drive engagement and grow the community.

            You have access to proven viral strategies and must create posts that:
            1. Hook readers in the first 2 lines
            2. Tell compelling stories
            3. Provide valuable insights
            4. Drive engagement through questions and CTAs
            5. Use appropriate hashtags

            Viral Strategies to Apply:
            {viral_strategies}

            Startup Information:
            {startup_info}

            Current Context:
            - Best posting time: {best_posting_time}
            - Trending hashtags: {trending_hashtags}

            Create a LinkedIn post that will go viral. The post should be between 1500-2500 characters for maximum value and comprehensive insights.

            {format_instructions}"""),
            MessagesPlaceholder("chat_history", optional=True),
            ("human", "{query}"),
            MessagesPlaceholder("agent_scratchpad", optional=True),
        ])

        # Tools for the agent
        self.tools = [
            post_to_linkedin,
            analyze_best_posting_time,
            get_trending_hashtags,
            save_linkedin_post
        ]

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
            max_iterations=5
        )

    def create_viral_post(
        self,
        topic: str,
        post_type: str = "transformation",
        startup_info: Optional[str] = None,
        use_template: bool = True,
        startup_name: Optional[str] = None,
        startup_url: Optional[str] = None
    ) -> Dict:
        """
        Create a viral LinkedIn post with image

        Args:
            topic: The topic or theme for the post
            post_type: Type of post template to use
            startup_info: Information about the startup
            use_template: Whether to use a template
            startup_name: Override startup name for this post
            startup_url: Override startup URL for this post

        Returns:
            Dictionary with post content, image, and metadata
        """
        try:
            # Use provided startup info or instance defaults
            current_startup_name = startup_name or self.startup_name
            current_startup_url = startup_url or self.startup_url

            # Get startup information if not provided
            if not startup_info and current_startup_url:
                print(f"Fetching startup information from {current_startup_url}...")
                startup_info = extract_landing_page_info(current_startup_url)
            elif not startup_info:
                startup_info = f"Information about {current_startup_name}"

            # Get best posting time
            posting_time = analyze_best_posting_time.invoke({"timezone": "UTC"})

            # Get trending hashtags
            hashtags = get_trending_hashtags.invoke({"industry": "startup"})

            # Get post template if requested
            template = get_post_template(post_type) if use_template else ""

            # Prepare the query
            query = f"""Create a viral LinkedIn post about: {topic}

            Post Type: {post_type}
            {"Use this template structure: " + template if template else ""}

            Requirements:
            - Hook readers immediately
            - Include a personal story or case study
            - Provide actionable insights
            - End with an engaging question
            - Optimize for LinkedIn algorithm
            """

            # Generate the post
            response = self.agent_executor.invoke({
                "query": query,
                "startup_name": current_startup_name,
                "startup_info": startup_info,
                "viral_strategies": self.viral_strategies,
                "best_posting_time": posting_time.get("recommendation", ""),
                "trending_hashtags": ", ".join(hashtags[:5]),
                "format_instructions": self.parser.get_format_instructions(),
                "chat_history": []
            })

            # Parse the response
            try:
                structured_response = self.parser.parse(response.get("output", ""))
            except:
                # Fallback to creating a structured response manually
                structured_response = LinkedinPostResponse(
                    post_content=response.get("output", ""),
                    hashtags=hashtags[:5],
                    image_description=f"Professional image about {topic} for {current_startup_name}",
                    post_type=post_type,
                    estimated_engagement="medium"
                )

            # Generate image and incorporate into post content using shared utility
            print("\nGenerating image and incorporating into post...")
            enhanced_post_content = generate_and_incorporate_image(
                post_content=structured_response.post_content,
                image_prompt=structured_response.image_description,
                style="professional",
                platform="linkedin"
            )

            # Save the post
            saved_path = save_linkedin_post.invoke({
                "post_content": enhanced_post_content,
                "image_path": f"generated_image_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            })

            # Prepare final response
            result = {
                "success": True,
                "post_content": enhanced_post_content,
                "original_content": structured_response.post_content,
                "hashtags": structured_response.hashtags,
                "post_type": structured_response.post_type,
                "estimated_engagement": structured_response.estimated_engagement,
                "best_posting_time": posting_time.get("recommendation", ""),
                "saved_path": saved_path,
                "character_count": len(enhanced_post_content)
            }

            return result

        except Exception as e:
            print(f"Error creating viral post: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def post_to_linkedin_platform(
        self,
        post_content: str,
        schedule_time: Optional[str] = None
    ) -> Dict:
        """
        Post content to LinkedIn platform

        Args:
            post_content: The content to post (with image URL already incorporated)
            schedule_time: Optional time to schedule the post

        Returns:
            Dictionary with posting result
        """
        try:
            # Post to LinkedIn (image URL is already in the content)
            result = post_to_linkedin.invoke({
                "post_content": post_content,
                "image_base64": None  # No longer using base64 images
            })

            return result

        except Exception as e:
            print(f"Error posting to LinkedIn: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    def create_and_post(
        self,
        topic: str,
        post_type: str = "transformation",
        auto_post: bool = False,
        startup_name: Optional[str] = None,
        startup_url: Optional[str] = None
    ) -> Dict:
        """
        Create a viral post and optionally post it to LinkedIn

        Args:
            topic: The topic for the post
            post_type: Type of post to create
            auto_post: Whether to automatically post to LinkedIn
            startup_name: Override startup name for this post
            startup_url: Override startup URL for this post

        Returns:
            Dictionary with complete results
        """
        # Create the viral post
        post_result = self.create_viral_post(
            topic,
            post_type,
            startup_name=startup_name,
            startup_url=startup_url
        )

        if not post_result.get("success"):
            return post_result

        # Add hashtags to the post content
        final_content = post_result["post_content"] + "\n\n" + " ".join(post_result["hashtags"])

        # Post to LinkedIn if requested
        if auto_post:
            posting_result = self.post_to_linkedin_platform(final_content)
            post_result["posting_result"] = posting_result

        # Display results
        print("\n" + "="*60)
        print("LINKEDIN POST CREATED SUCCESSFULLY")
        print("="*60)
        print(f"\nPost Type: {post_result['post_type']}")
        print(f"Character Count: {post_result['character_count']}")
        print(f"Estimated Engagement: {post_result['estimated_engagement']}")
        print(f"Best Posting Time: {post_result['best_posting_time']}")
        print(f"\nContent:\n{final_content}")
        print(f"\nSaved to: {post_result['saved_path']}")

        if auto_post and post_result.get("posting_result", {}).get("success"):
            print(f"\n✅ Posted to LinkedIn successfully!")
            print(f"Post ID: {post_result['posting_result'].get('post_id')}")

        print("="*60)

        return post_result


# Standalone function for easy integration
def create_linkedin_viral_post(
    topic: str,
    post_type: str = "transformation",
    auto_post: bool = False,
    startup_name: Optional[str] = None,
    startup_url: Optional[str] = None
) -> Dict:
    """
    Create a viral LinkedIn post

    Args:
        topic: Topic for the post
        post_type: Type of post (transformation, lessons_learned, controversial, case_study, storytelling)
        auto_post: Whether to automatically post to LinkedIn
        startup_name: Name of the startup for content generation
        startup_url: URL of the startup's landing page for analysis

    Returns:
        Dictionary with post content and metadata
    """
    agent = LinkedinAgent(startup_name=startup_name, startup_url=startup_url)
    return agent.create_and_post(topic, post_type, auto_post)


# Tool for integration with other agents
@tool
def invoke_linkedin_agent(
    query: str,
    startup_name: Optional[str] = None,
    startup_url: Optional[str] = None
) -> Dict:
    """
    Invoke the LinkedIn agent to create a viral post

    Args:
        query: The topic or request for the post
        startup_name: Name of the startup for content generation
        startup_url: Optional URL to analyze for startup information

    Returns:
        Dictionary with the created post and metadata
    """
    # Extract startup info if URL provided
    startup_info = None
    if startup_url:
        startup_info = extract_landing_page_info(startup_url)

    # Create the agent with startup configuration
    agent = LinkedinAgent(startup_name=startup_name, startup_url=startup_url)

    # Determine post type from query
    post_type = "transformation"  # Default
    if "lesson" in query.lower():
        post_type = "lessons_learned"
    elif "controversial" in query.lower() or "unpopular" in query.lower():
        post_type = "controversial"
    elif "case study" in query.lower() or "result" in query.lower():
        post_type = "case_study"
    elif "story" in query.lower():
        post_type = "storytelling"

    # Create the post
    result = agent.create_viral_post(
        topic=query,
        post_type=post_type,
        startup_info=startup_info,
        startup_name=startup_name,
        startup_url=startup_url
    )

    return result


# Example usage
if __name__ == "__main__":
    # Test the LinkedIn agent with custom startup info
    result = create_linkedin_viral_post(
        topic="How AI is transforming startup fundraising and sponsor matching",
        post_type="transformation",
        auto_post=False,  # Set to True to actually post
        startup_name="Meetsponsors",
        startup_url="https://meetsponsors.com/"
    )

    print(f"\nPost created: {result.get('success')}")


