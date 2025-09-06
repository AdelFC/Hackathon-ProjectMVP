"""
Facebook Agent for Social CM Orchestrator Suite
This agent handles Facebook-specific content generation and posting
"""

from dotenv import load_dotenv
import os
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.tools import tool

# Import models
from agents.models import (
    DailyContentPackage,
    GeneratedPost,
    PostingResult,
    Platform
)
from agents.image_utils import generate_and_incorporate_image

load_dotenv()

class FacebookPostResponse(BaseModel):
    """Response model for Facebook post generation"""
    post_content: str = Field(description="The Facebook post content")
    hashtags: List[str] = Field(description="List of relevant hashtags")
    image_description: str = Field(description="Description for the image to generate")
    post_type: str = Field(description="Type of post (status, photo, video, link)")
    estimated_reach: str = Field(description="Estimated reach level (high, medium, low)")
    call_to_action: str = Field(description="Call to action for the post")

class FacebookAgent:
    """Facebook Agent for creating and posting content"""

    def __init__(self, startup_name: Optional[str] = None, startup_url: Optional[str] = None, startup_context: Optional[str] = None):
        """Initialize the Facebook Agent

        Args:
            startup_name: Name of the startup
            startup_url: URL of the startup website
            startup_context: Analyzed context from the startup's landing page
        """
        self.startup_name = startup_name or "Your Startup"
        self.startup_url = startup_url
        self.startup_context = startup_context or ""

        self.llm = ChatOpenAI(
            api_key=os.getenv("BLACKBOX_API_KEY"),
            base_url="https://api.blackbox.ai/v1",
            model=os.getenv("BLACKBOX_MODEL", "blackboxai/openai/gpt-4o"),
            temperature=0.7,
        )

        # Parser for structured output
        self.parser = PydanticOutputParser(pydantic_object=FacebookPostResponse)

        # Facebook-specific prompt
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a Facebook content specialist creating engaging, comprehensive posts.

            Facebook Best Practices for Longer Content:
            1. Create posts between 200-500 characters for optimal engagement and value
            2. Use storytelling to connect with your audience
            3. Include specific examples and actionable insights
            4. Ask engaging questions to encourage meaningful comments
            5. Include clear, compelling CTAs
            6. Use emojis strategically to enhance readability
            7. Use 1-2 hashtags maximum (place at end)
            8. Write in a conversational, friendly tone with personality

            Content Requirements:
            - Tell compelling stories that resonate with Facebook's diverse audience
            - Focus on community building and meaningful engagement
            - Include emotional hooks and personal connections
            - Provide value through education, inspiration, or entertainment
            - Make content highly shareable with clear takeaways
            - Use formatting (line breaks, emojis) for easy reading
            - Build anticipation and encourage interaction

            {format_instructions}"""),
            MessagesPlaceholder("chat_history", optional=True),
            ("human", "{query}"),
            MessagesPlaceholder("agent_scratchpad", optional=True),
        ])

        # Tools for the agent
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

    def create_post(self, content_package: DailyContentPackage) -> GeneratedPost:
        """
        Create a Facebook post from content package

        Args:
            content_package: Daily content package from orchestrator

        Returns:
            Generated post
        """
        try:
            # Extract base content
            base_content = content_package.base_content
            signals = content_package.signals

            # Prepare the query for comprehensive content with startup context
            startup_info = f"Startup: {self.startup_name}"
            if self.startup_context:
                startup_info += f"\nStartup Context: {self.startup_context}"
            if self.startup_url:
                startup_info += f"\nWebsite: {self.startup_url}"

            query = f"""Create a comprehensive Facebook post about: {base_content.topic}

            {startup_info}

            Key Message: {base_content.key_message}
            Content Pillar: {base_content.pillar.value}
            Hook: {base_content.variation.hook}
            CTA: {base_content.variation.cta}
            Tone: {base_content.tone}

            Requirements:
            - Create a detailed post (200-500 characters) with real value specifically for {self.startup_name}
            - Tell a compelling story or share specific insights relevant to the startup's mission
            - Include concrete examples or actionable tips that connect to {self.startup_name}'s context
            - Use engaging formatting with emojis and line breaks
            - Ask a thought-provoking question to encourage meaningful engagement about the startup's domain
            - Maximum 2 hashtags (place at the end)
            - Include the call to action naturally within the narrative, directing to {self.startup_name}
            - Make it highly shareable with clear takeaways related to the startup's value proposition
            - Connect emotionally with the audience using insights from the startup context
            - Incorporate the startup's unique positioning and mission into the content
            """

            # Add trending topics if available
            if signals and signals.trending_topics:
                query += f"\nConsider these trending topics: {', '.join(signals.trending_topics[:3])}"

            # Generate the post
            response = self.agent_executor.invoke({
                "query": query,
                "format_instructions": self.parser.get_format_instructions(),
                "chat_history": []
            })

            # Parse the response
            try:
                structured_response = self.parser.parse(response.get("output", ""))
            except:
                # Fallback response
                structured_response = FacebookPostResponse(
                    post_content=f"🚀 {base_content.topic}\n\n{base_content.key_message}\n\n{base_content.variation.cta}",
                    hashtags=["#innovation", "#growth"],
                    image_description=f"Visual for: {base_content.topic}",
                    post_type="status",
                    estimated_reach="medium",
                    call_to_action=base_content.variation.cta
                )

            # Generate and incorporate image if needed
            final_content = structured_response.post_content
            if base_content.image_required:
                try:
                    enhanced_content = generate_and_incorporate_image(
                        post_content=structured_response.post_content,
                        image_prompt=structured_response.image_description,
                        style="colorful",
                        platform="facebook"
                    )
                    final_content = enhanced_content
                except Exception as e:
                    print(f"[Facebook Agent] Image generation failed: {e}")
                    # Continue without image

            # Create generated post
            generated_post = GeneratedPost(
                platform=Platform.FACEBOOK,
                content=final_content,
                hashtags=structured_response.hashtags,
                character_count=len(final_content),
                image_url=None,  # Image URL is now incorporated in content
                metadata={
                    "post_type": structured_response.post_type,
                    "estimated_reach": structured_response.estimated_reach,
                    "cta": structured_response.call_to_action,
                    "pillar": base_content.pillar.value,
                    "image_generated": base_content.image_required
                }
            )

            return generated_post

        except Exception as e:
            print(f"Error creating Facebook post: {e}")
            # Return a basic post as fallback
            return GeneratedPost(
                platform=Platform.FACEBOOK,
                content=f"{base_content.topic}\n\n{base_content.key_message}",
                hashtags=["#business"],
                character_count=len(base_content.topic) + len(base_content.key_message),
                metadata={"error": str(e)}
            )

    def post_to_facebook(self, post: GeneratedPost) -> PostingResult:
        """
        Post content to Facebook

        Args:
            post: Generated post to publish

        Returns:
            Posting result
        """
        try:
            # In production, this would use Facebook Graph API
            # For now, simulate posting
            print(f"\n📘 Posting to Facebook:")
            print(f"Content: {post.content}")
            print(f"Hashtags: {' '.join(post.hashtags)}")
            print(f"Character count: {post.character_count}")

            # Simulate successful posting
            return PostingResult(
                success=True,
                platform=Platform.FACEBOOK,
                post_id=f"fb_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                post_url=f"https://facebook.com/posts/simulated_{datetime.now().strftime('%Y%m%d')}",
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            return PostingResult(
                success=False,
                platform=Platform.FACEBOOK,
                error=str(e),
                timestamp=datetime.now().isoformat()
            )

    def create_and_post(self, content_package: DailyContentPackage) -> Dict:
        """
        Create and post Facebook content

        Args:
            content_package: Content package from orchestrator

        Returns:
            Complete result with post and posting status
        """
        # Create the post
        generated_post = self.create_post(content_package)

        # Post to Facebook
        posting_result = self.post_to_facebook(generated_post)

        return {
            "generated_post": generated_post.dict(),
            "posting_result": posting_result.dict(),
            "success": posting_result.success
        }


# Tool for integration
@tool
def invoke_facebook_agent(content_package: Dict, startup_name: Optional[str] = None, startup_url: Optional[str] = None, startup_context: Optional[str] = None) -> Dict:
    """
    Invoke the Facebook agent to create and post content

    Args:
        content_package: Content package dictionary
        startup_name: Name of the startup
        startup_url: URL of the startup website
        startup_context: Analyzed context from the startup's landing page

    Returns:
        Result of post creation and posting
    """
    agent = FacebookAgent(
        startup_name=startup_name,
        startup_url=startup_url,
        startup_context=startup_context
    )

    # Convert dict to DailyContentPackage
    package = DailyContentPackage(**content_package)

    return agent.create_and_post(package)


# Example usage
if __name__ == "__main__":
    from agents.models import DailyPost, ContentVariation, ContentPillar, PostFormat, SignalData

    # Create test content package
    test_post = DailyPost(
        date="2024-01-15",
        platform=Platform.FACEBOOK,
        pillar=ContentPillar.EDUCATION,
        topic="5 Ways AI is Transforming Business",
        key_message="Discover how AI can revolutionize your workflow",
        variation=ContentVariation(
            angle="transformation",
            hook="What if you could save 10 hours per week?",
            cta="Learn more about our AI solutions",
            format=PostFormat.CAROUSEL
        ),
        tone="friendly and engaging",
        hashtags_count=2,
        image_required=True
    )

    test_package = DailyContentPackage(
        date="2024-01-15",
        platform=Platform.FACEBOOK,
        base_content=test_post,
        signals=SignalData(
            trending_topics=["#AIInnovation", "#BusinessGrowth"],
            news_items=["AI adoption increases by 50%"]
        ),
        posting_time="14:00",
        max_retries=3
    )

    # Test the agent
    agent = FacebookAgent()
    result = agent.create_and_post(test_package)

    print(f"\n✅ Facebook agent test completed!")
    print(f"Success: {result['success']}")
