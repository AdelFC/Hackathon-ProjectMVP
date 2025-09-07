"""
Twitter Agent for Social CM Orchestrator Suite
This agent handles Twitter-specific content generation and posting
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

class TwitterPostResponse(BaseModel):
    """Response model for Twitter post generation"""
    tweet_content: str = Field(description="The main tweet content (max 280 chars)")
    hashtags: List[str] = Field(description="List of relevant hashtags")
    mentions: List[str] = Field(description="Accounts to mention if relevant")
    media_description: str = Field(description="Description for media to attach")
    tweet_type: str = Field(description="Type of tweet (single, thread, reply, quote)")
    estimated_engagement: str = Field(description="Estimated engagement level (high, medium, low)")

class TwitterAgent:
    """Twitter Agent for creating and posting content"""

    def __init__(self, startup_name: Optional[str] = None, startup_url: Optional[str] = None, startup_context: Optional[str] = None):
        """Initialize the Twitter Agent

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
        self.parser = PydanticOutputParser(pydantic_object=TwitterPostResponse)

        # Twitter-specific prompt
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a Twitter content specialist creating comprehensive, value-packed tweets and threads.

            Twitter Best Practices for Longer Content:
            1. Use FULL 280 characters per tweet for maximum value
            2. Create detailed threads (3-7 tweets) for complex topics
            3. Include 2-3 relevant hashtags
            4. Use line breaks and formatting for readability
            5. Add emojis strategically for visual appeal
            6. Create compelling hooks that demand attention
            7. End with strong CTAs or thought-provoking questions
            8. Pack each tweet with actionable insights

            Content Requirements:
            - Prioritize VALUE and DEPTH over brevity
            - Create comprehensive educational threads
            - Use storytelling to engage readers
            - Include specific examples and data points
            - Make content highly shareable and quotable
            - Build anticipation between thread tweets

            Thread Strategy:
            - Tweet 1: Hook + preview of what's coming
            - Tweets 2-6: Detailed insights, examples, stories
            - Final tweet: Key takeaway + strong CTA
            - Each tweet should be 250-280 characters (use full space)
            - Connect tweets with "🧵" or numbered format

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
        Create a Twitter post/thread from content package

        Args:
            content_package: Daily content package from orchestrator

        Returns:
            Generated post
        """
        try:
            # Extract base content
            base_content = content_package.base_content
            signals = content_package.signals

            # Always create threads for comprehensive content (except for very simple topics)
            needs_thread = True  # Default to creating threads for more value

            # Prepare the query for comprehensive content with startup context
            startup_info = f"Startup: {self.startup_name}"
            if self.startup_context:
                startup_info += f"\nStartup Context: {self.startup_context}"
            if self.startup_url:
                startup_info += f"\nWebsite: {self.startup_url}"

            print(f"\n[Twitter Agent] Startup Info:\n{startup_info}\n")

            query = f"""Create a comprehensive Twitter thread about: {base_content.topic}

            {startup_info}

            Key Message: {base_content.key_message}
            Content Pillar: {base_content.pillar.value}
            Hook: {base_content.variation.hook}
            CTA: {base_content.variation.cta}
            Tone: {base_content.tone}

            Requirements:
            - Create a detailed thread (4-6 tweets minimum) specifically for {self.startup_name}
            - Use FULL 250-280 characters per tweet for maximum value
            - Include specific examples, insights, or actionable tips relevant to {self.startup_name}
            - Tell a compelling story that connects to the startup's context and mission
            - Include 2-3 relevant hashtags in the final tweet only
            - Make each tweet valuable on its own while building the narrative
            - Use engaging formatting with emojis and line breaks
            - Connect tweets with clear flow and anticipation
            - End with a strong CTA that encourages engagement with {self.startup_name}
            - Incorporate insights from the startup context to make content highly relevant
            """

            # Add trending topics if available
            if signals and signals.trending_topics:
                # Filter for Twitter-relevant hashtags
                twitter_trends = [t for t in signals.trending_topics if t.startswith("#")]
                if twitter_trends:
                    query += f"\nIncorporate these trending hashtags if relevant: {', '.join(twitter_trends[:2])}"

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
                tweet_text = f"{base_content.variation.hook}\n\n{base_content.key_message[:100]}...\n\n{base_content.variation.cta}"
                if len(tweet_text) > 250:  # Leave room for hashtags
                    tweet_text = tweet_text[:250] + "..."

                structured_response = TwitterPostResponse(
                    tweet_content=tweet_text,
                    thread_tweets=[],
                    hashtags=["#Innovation", "#Growth", "#Business"],
                    mentions=[],
                    media_description=f"Visual for: {base_content.topic}",
                    tweet_type="single",
                    estimated_engagement="medium"
                )

            # Process main tweet content (use full character limit)
            main_content = structured_response.tweet_content

            # Format comprehensive thread
            if structured_response.thread_tweets:
                # Create a comprehensive thread with proper formatting
                thread_content = f"1/ {main_content}\n\n"

                # Add all thread tweets with proper numbering
                for i, tweet in enumerate(structured_response.thread_tweets, 2):
                    thread_content += f"{i}/ {tweet}\n\n"

                # Add hashtags only to the final tweet
                hashtag_text = " ".join(structured_response.hashtags[:3])
                thread_content += f"🧵 {hashtag_text}"

                full_content = thread_content
            else:
                # Single tweet with hashtags
                hashtag_text = " ".join(structured_response.hashtags[:3])
                full_content = f"{main_content}\n\n{hashtag_text}"
            # Generate and incorporate image if needed
            if base_content.image_required:
                try:
                    enhanced_content = generate_and_incorporate_image(
                        post_content=full_content,
                        image_prompt=structured_response.media_description,
                        style="modern",
                        platform="twitter"
                    )
                    full_content = enhanced_content
                except Exception as e:
                    print(f"[Twitter Agent] Image generation failed: {e}")
                    # Continue without image

            # Create generated post
            generated_post = GeneratedPost(
                platform=Platform.TWITTER,
                content=full_content,
                hashtags=structured_response.hashtags,
                character_count=len(full_content),
                image_url=None,  # Image URL is now incorporated in content
                metadata={
                    "tweet_type": structured_response.tweet_type,
                    "thread_count": len(structured_response.thread_tweets) + 1,
                    "estimated_engagement": structured_response.estimated_engagement,
                    "mentions": structured_response.mentions,
                    "pillar": base_content.pillar.value,
                    "image_generated": base_content.image_required
                }
            )

            return generated_post

        except Exception as e:
            print(f"Error creating Twitter post: {e}")
            # Return a basic tweet as fallback
            basic_tweet = f"{base_content.topic[:200]}\n\n{base_content.variation.cta}"
            if len(basic_tweet) > 250:
                basic_tweet = basic_tweet[:250] + "..."
            basic_tweet += " #Business"

            return GeneratedPost(
                platform=Platform.TWITTER,
                content=basic_tweet,
                hashtags=["#Business"],
                character_count=len(basic_tweet),
                metadata={"error": str(e)}
            )

    def post_to_twitter(self, post: GeneratedPost) -> PostingResult:
        """
        Post content to Twitter

        Args:
            post: Generated post to publish

        Returns:
            Posting result
        """
        try:
            # In production, this would use Twitter API v2
            # For now, simulate posting
            print(f"\n🐦 Posting to Twitter:")
            print(f"Content: {post.content}")
            print(f"Character count: {post.character_count}")

            thread_count = post.metadata.get("thread_count", 1) if post.metadata else 1
            if thread_count > 1:
                print(f"Thread: {thread_count} tweets")

            # Simulate successful posting
            return PostingResult(
                success=True,
                platform=Platform.TWITTER,
                post_id=f"tw_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                post_url=f"https://twitter.com/status/simulated_{datetime.now().strftime('%Y%m%d')}",
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            return PostingResult(
                success=False,
                platform=Platform.TWITTER,
                error=str(e),
                timestamp=datetime.now().isoformat()
            )

    def create_and_post(self, content_package: DailyContentPackage) -> Dict:
        """
        Create and post Twitter content

        Args:
            content_package: Content package from orchestrator

        Returns:
            Complete result with post and posting status
        """
        # Create the post
        generated_post = self.create_post(content_package)

        # Post to Twitter
        posting_result = self.post_to_twitter(generated_post)

        return {
            "generated_post": generated_post.dict(),
            "posting_result": posting_result.dict(),
            "success": posting_result.success
        }


# Tool for integration
@tool
def invoke_twitter_agent(content_package: Dict, startup_name: Optional[str] = None, startup_url: Optional[str] = None, startup_context: Optional[str] = None) -> Dict:
    """
    Invoke the Twitter agent to create and post content

    Args:
        content_package: Content package dictionary
        startup_name: Name of the startup
        startup_url: URL of the startup website
        startup_context: Analyzed context from the startup's landing page

    Returns:
        Result of post creation and posting
    """
    agent = TwitterAgent(
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
        platform=Platform.TWITTER,
        pillar=ContentPillar.EDUCATION,
        topic="AI is revolutionizing how startups find sponsors",
        key_message="Learn how machine learning matches startups with perfect sponsors in seconds",
        variation=ContentVariation(
            angle="transformation",
            hook="🚀 What if finding sponsors took seconds, not months?",
            cta="Join the waitlist →",
            format=PostFormat.TEXT
        ),
        tone="professional yet engaging",
        hashtags=None,  # Will be generated by LLM
        image_required=False
    )

    test_package = DailyContentPackage(
        date="2024-01-15",
        platform=Platform.TWITTER,
        base_content=test_post,
        signals=SignalData(
            trending_topics=["#AIStartup", "#FundingFriday", "#TechInnovation"],
            news_items=["VC funding reaches all-time high"]
        ),
        posting_time="12:00",
        max_retries=3
    )

    # Test the agent
    agent = TwitterAgent()
    result = agent.create_and_post(test_package)

    print(f"\n✅ Twitter agent test completed!")
    print(f"Success: {result['success']}")
