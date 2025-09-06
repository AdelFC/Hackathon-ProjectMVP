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

    def __init__(self):
        """Initialize the Facebook Agent"""
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
            ("system", """You are a Facebook content specialist creating engaging posts.

            Facebook Best Practices:
            1. Keep posts between 40-80 characters for highest engagement
            2. Use emojis strategically to increase engagement
            3. Ask questions to encourage comments
            4. Include clear CTAs
            5. Post visual content when possible
            6. Use 1-2 hashtags maximum
            7. Write in a conversational, friendly tone

            Content Requirements:
            - Adapt content to Facebook's audience (broader, more casual)
            - Focus on community building and engagement
            - Include emotional hooks
            - Make content shareable

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

            # Prepare the query
            query = f"""Create a Facebook post about: {base_content.topic}

            Key Message: {base_content.key_message}
            Content Pillar: {base_content.pillar.value}
            Hook: {base_content.variation.hook}
            CTA: {base_content.variation.cta}
            Tone: {base_content.tone}

            Requirements:
            - Keep it engaging and shareable
            - Include emojis where appropriate
            - Ask a question to encourage engagement
            - Maximum 2 hashtags
            - Include the call to action naturally
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
def invoke_facebook_agent(content_package: Dict) -> Dict:
    """
    Invoke the Facebook agent to create and post content

    Args:
        content_package: Content package dictionary

    Returns:
        Result of post creation and posting
    """
    agent = FacebookAgent()

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
