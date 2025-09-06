"""
Strategy Agent V2 - Refactored for Social CM Orchestrator Suite
This agent creates monthly editorial plans with structured JSON output
"""

from dotenv import load_dotenv
import os
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.tools import tool
from datetime import datetime, timedelta
import json
import random

# Import models and storage
from agents.models import (
    Platform,
    ContentPillar,
    PostFormat,
    CTAType,
    PostVariation,
    DailyPost,
    EditorialGuidelines,
    MonthlyCalendar,
    MonthlyPlan
)
from agents.storage import get_storage
from landing_page_analyzer import extract_landing_page_info

load_dotenv()

class StrategyAgentV2:
    """Strategy Agent for creating monthly editorial plans"""

    def __init__(self):
        """Initialize the Strategy Agent V2"""
        self.llm = ChatOpenAI(
            api_key=os.getenv("BLACKBOX_API_KEY"),
            base_url="https://api.blackbox.ai/v1",
            model=os.getenv("BLACKBOX_MODEL", "blackboxai/openai/gpt-4o"),
            temperature=0.7,
        )

        # Storage manager
        self.storage = get_storage()

        # Parser for structured output
        self.parser = PydanticOutputParser(pydantic_object=MonthlyPlan)

        # Strategy prompt template
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert Social Media Strategy Manager creating monthly editorial calendars.

            Your role is to create a comprehensive monthly content plan that:
            1. Covers exactly 30/31 days with 1 post per day per network (LinkedIn, Facebook, Twitter)
            2. Balances content across 4+ editorial pillars
            3. Varies angles, hooks, CTAs, and formats for engagement
            4. Maintains brand consistency and tone of voice
            5. Optimizes for each platform's best practices

            Brand Information:
            - Name: {brand_name}
            - Positioning: {positioning}
            - Target Audience: {target_audience}
            - Value Propositions: {value_props}
            - Language: {language}
            - Tone: {tone}

            Requirements:
            - Generate {total_days} days of content
            - 3 posts per day (1 per platform: LinkedIn, Facebook, Twitter)
            - Use all content pillars: education, social_proof, product, behind_the_scenes, thought_leadership, community
            - Vary post formats: text, image, video, carousel, poll, article
            - Rotate CTAs: {cta_targets}
            - Include trending topics and seasonal events

            Current Date: {current_date}
            Campaign Start: {start_date}
            Campaign End: {end_date}

            {format_instructions}"""),
            MessagesPlaceholder("chat_history", optional=True),
            ("human", "{query}"),
            MessagesPlaceholder("agent_scratchpad", optional=True),
        ])

        # Tools for the strategy agent
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

    def generate_content_variations(self) -> Dict[str, List[str]]:
        """Generate variation rules for content"""
        return {
            "angles": [
                "problem-solving",
                "inspirational",
                "educational",
                "controversial",
                "data-driven",
                "storytelling",
                "how-to",
                "behind-the-scenes"
            ],
            "hooks": [
                "question",
                "statistic",
                "story",
                "quote",
                "challenge",
                "announcement",
                "tip",
                "myth-busting"
            ],
            "formats": [
                "short text",
                "long-form",
                "listicle",
                "case study",
                "interview",
                "infographic",
                "video script",
                "carousel"
            ]
        }

    def generate_daily_posts(
        self,
        brand_name: str,
        start_date: datetime,
        total_days: int,
        content_pillars: List[ContentPillar],
        cta_types: List[CTAType]
    ) -> List[DailyPost]:
        """
        Generate daily posts for the calendar

        Args:
            brand_name: Brand name
            start_date: Start date
            total_days: Number of days
            content_pillars: Available content pillars
            cta_types: Available CTA types

        Returns:
            List of daily posts
        """
        posts = []
        platforms = [Platform.LINKEDIN, Platform.FACEBOOK, Platform.TWITTER]
        formats = list(PostFormat)
        variations = self.generate_content_variations()

        # Topics pool based on pillars
        topic_templates = {
            ContentPillar.EDUCATION: [
                "5 key insights about {industry}",
                "How to optimize your {process}",
                "Understanding {concept} in 2024",
                "The complete guide to {topic}"
            ],
            ContentPillar.SOCIAL_PROOF: [
                "Client success story: {achievement}",
                "Case study: {result}",
                "Testimonial spotlight: {client}",
                "Our impact: {metric}"
            ],
            ContentPillar.PRODUCT: [
                "New feature announcement: {feature}",
                "Product update: {improvement}",
                "How our solution helps {problem}",
                "Behind our technology: {aspect}"
            ],
            ContentPillar.BEHIND_THE_SCENES: [
                "Team spotlight: {role}",
                "A day in the life at {brand_name}",
                "Our company culture: {value}",
                "Building {brand_name}: {story}"
            ],
            ContentPillar.THOUGHT_LEADERSHIP: [
                "The future of {industry}",
                "Why {trend} matters now",
                "Our CEO's perspective on {topic}",
                "Industry insights: {analysis}"
            ],
            ContentPillar.COMMUNITY: [
                "Community highlight: {member}",
                "Join our {event}",
                "User-generated content: {theme}",
                "Community challenge: {activity}"
            ]
        }

        for day in range(total_days):
            current_date = start_date + timedelta(days=day)
            date_str = current_date.strftime("%Y-%m-%d")

            # Generate one post per platform for this day
            for platform in platforms:
                # Rotate through content pillars
                pillar = content_pillars[day % len(content_pillars)]

                # Select topic template
                templates = topic_templates[pillar]
                topic_template = random.choice(templates)

                # Generate specific topic
                topic = topic_template.format(
                    industry="startup ecosystem",
                    process="sponsor matching",
                    concept="AI-driven partnerships",
                    topic="sponsor acquisition",
                    achievement="300% ROI increase",
                    result="10x faster matching",
                    client="TechStartup Inc",
                    metric="1000+ successful matches",
                    feature="AI matching algorithm",
                    improvement="faster processing",
                    problem="finding sponsors",
                    aspect="machine learning",
                    role="Data Scientist",
                    brand_name=brand_name,
                    value="innovation",
                    story="our journey",
                    trend="AI automation",
                    analysis="market dynamics",
                    member="startup founder",
                    event="webinar series",
                    theme="success stories",
                    activity="pitch practice"
                )

                # Create variation
                variation = PostVariation(
                    angle=random.choice(variations["angles"]),
                    hook_style=random.choice(variations["hooks"]),
                    cta_type=random.choice(cta_types),
                    format=random.choice(formats)
                )

                # Platform-specific adjustments
                if platform == Platform.TWITTER:
                    # Twitter prefers shorter, punchier content
                    key_message = f"Quick insight: {topic[:50]}"
                    hashtags_count = 3
                elif platform == Platform.LINKEDIN:
                    # LinkedIn favors professional, detailed content
                    key_message = f"Professional perspective on {topic}"
                    hashtags_count = 5
                else:  # Facebook
                    # Facebook works well with engaging, community-focused content
                    key_message = f"Let's discuss: {topic}"
                    hashtags_count = 4

                # Create daily post
                post = DailyPost(
                    date=date_str,
                    platform=platform,
                    pillar=pillar,
                    topic=topic,
                    key_message=key_message,
                    variation=variation,
                    hashtags_count=hashtags_count,
                    image_required=(variation.format in [PostFormat.IMAGE, PostFormat.CAROUSEL, PostFormat.VIDEO]),
                    dependencies=None
                )

                posts.append(post)

        return posts

    def create_monthly_plan(
        self,
        brand_name: str,
        positioning: str,
        target_audience: str,
        value_props: List[str],
        start_date: str,
        duration_days: int = 30,
        language: str = "fr-FR",
        tone: str = "professional",
        cta_targets: List[str] = None
    ) -> MonthlyPlan:
        """
        Create a complete monthly plan

        Args:
            brand_name: Brand name
            positioning: Brand positioning
            target_audience: Target audience description
            value_props: Value propositions
            start_date: Start date (YYYY-MM-DD)
            duration_days: Campaign duration
            language: Content language
            tone: Tone of voice
            cta_targets: CTA targets

        Returns:
            Complete monthly plan
        """
        try:
            # Parse dates
            start_dt = datetime.strptime(start_date, "%Y-%m-%d")
            end_dt = start_dt + timedelta(days=duration_days - 1)
            end_date = end_dt.strftime("%Y-%m-%d")

            # Convert CTA targets to enum
            if not cta_targets:
                cta_targets = ["demo", "newsletter", "free_trial", "contact"]
            cta_types = [CTAType(target.lower().replace(" ", "_")) for target in cta_targets
                        if target.lower().replace(" ", "_") in [e.value for e in CTAType]]

            # Define content pillars
            content_pillars = [
                ContentPillar.EDUCATION,
                ContentPillar.SOCIAL_PROOF,
                ContentPillar.PRODUCT,
                ContentPillar.BEHIND_THE_SCENES,
                ContentPillar.THOUGHT_LEADERSHIP,
                ContentPillar.COMMUNITY
            ]

            # Generate editorial guidelines
            editorial_guidelines = EditorialGuidelines(
                tone=tone,
                do_list=[
                    "Use data and statistics to support claims",
                    "Include clear calls-to-action",
                    "Engage with questions and polls",
                    "Share authentic stories and experiences",
                    "Provide actionable insights",
                    "Use platform-appropriate hashtags",
                    "Include visuals when possible"
                ],
                dont_list=[
                    "Make unverified claims",
                    "Use excessive jargon",
                    "Post without proofreading",
                    "Ignore platform best practices",
                    "Spam with promotional content only",
                    "Use controversial or offensive language",
                    "Share confidential information"
                ],
                language=language,
                brand_voice_attributes=[
                    "professional",
                    "innovative",
                    "trustworthy",
                    "approachable",
                    "results-oriented"
                ]
            )

            # Generate daily posts
            posts = self.generate_daily_posts(
                brand_name=brand_name,
                start_date=start_dt,
                total_days=duration_days,
                content_pillars=content_pillars,
                cta_types=cta_types if cta_types else list(CTAType)
            )

            # Calculate posts per platform
            posts_per_platform = {}
            for platform in Platform:
                posts_per_platform[platform.value] = len([p for p in posts if p.platform == platform])

            # Create monthly calendar
            calendar = MonthlyCalendar(
                start_date=start_date,
                end_date=end_date,
                posts=posts,
                total_posts=len(posts),
                posts_per_platform=posts_per_platform
            )

            # Generate variation rules
            variation_rules = self.generate_content_variations()

            # Create complete monthly plan
            plan = MonthlyPlan(
                campaign_name=f"{brand_name} - {start_date} Campaign",
                brand_name=brand_name,
                positioning=positioning,
                target_audience=target_audience,
                value_propositions=value_props,
                content_pillars=content_pillars,
                editorial_guidelines=editorial_guidelines,
                calendar=calendar,
                variation_rules=variation_rules,
                cta_targets=cta_types,
                created_at=datetime.now().isoformat(),
                version="1.0"
            )

            # Save the plan
            plan_id = self.storage.save_monthly_plan(plan)
            print(f"\n✅ Monthly plan created and saved with ID: {plan_id}")

            return plan

        except Exception as e:
            print(f"Error creating monthly plan: {e}")
            raise

    def create_ai_generated_plan(
        self,
        brand_name: str,
        positioning: str,
        target_audience: str,
        value_props: List[str],
        start_date: str,
        duration_days: int = 30,
        language: str = "fr-FR",
        tone: str = "professional",
        cta_targets: List[str] = None,
        additional_context: str = ""
    ) -> MonthlyPlan:
        """
        Create a monthly plan with AI-generated content

        This method uses the LLM to generate more creative and contextual content
        """
        try:
            # First create the base plan structure
            base_plan = self.create_monthly_plan(
                brand_name=brand_name,
                positioning=positioning,
                target_audience=target_audience,
                value_props=value_props,
                start_date=start_date,
                duration_days=duration_days,
                language=language,
                tone=tone,
                cta_targets=cta_targets
            )

            # Prepare query for AI enhancement
            query = f"""Create a detailed monthly content calendar for {brand_name}.

            Context: {additional_context}

            The calendar should include specific, engaging topics for each day that:
            1. Align with the brand positioning: {positioning}
            2. Appeal to the target audience: {target_audience}
            3. Highlight value propositions: {', '.join(value_props)}
            4. Maintain a {tone} tone in {language}

            Focus on creating diverse, engaging content that drives {', '.join(cta_targets or ['engagement'])}.
            """

            # Generate enhanced content using AI
            response = self.agent_executor.invoke({
                "query": query,
                "brand_name": brand_name,
                "positioning": positioning,
                "target_audience": target_audience,
                "value_props": ", ".join(value_props),
                "language": language,
                "tone": tone,
                "cta_targets": ", ".join(cta_targets or []),
                "total_days": duration_days,
                "current_date": datetime.now().strftime("%Y-%m-%d"),
                "start_date": start_date,
                "end_date": (datetime.strptime(start_date, "%Y-%m-%d") + timedelta(days=duration_days-1)).strftime("%Y-%m-%d"),
                "format_instructions": self.parser.get_format_instructions(),
                "chat_history": []
            })

            # Try to parse the AI response
            try:
                enhanced_plan = self.parser.parse(response.get("output", ""))
                # Save the enhanced plan
                plan_id = self.storage.save_monthly_plan(enhanced_plan)
                print(f"\n✅ AI-enhanced monthly plan created and saved with ID: {plan_id}")
                return enhanced_plan
            except:
                # If parsing fails, return the base plan
                print("⚠️ Could not parse AI response, returning base plan")
                return base_plan

        except Exception as e:
            print(f"Error creating AI-generated plan: {e}")
            # Fallback to base plan
            return self.create_monthly_plan(
                brand_name=brand_name,
                positioning=positioning,
                target_audience=target_audience,
                value_props=value_props,
                start_date=start_date,
                duration_days=duration_days,
                language=language,
                tone=tone,
                cta_targets=cta_targets
            )

    def get_active_plan(self, brand_name: str) -> Optional[MonthlyPlan]:
        """
        Get the active plan for a brand

        Args:
            brand_name: Brand name

        Returns:
            Active monthly plan or None
        """
        return self.storage.get_active_plan(brand_name)

    def display_plan_summary(self, plan: MonthlyPlan):
        """Display a summary of the monthly plan"""
        print("\n" + "="*60)
        print("MONTHLY EDITORIAL PLAN SUMMARY")
        print("="*60)
        print(f"Campaign: {plan.campaign_name}")
        print(f"Brand: {plan.brand_name}")
        print(f"Period: {plan.calendar.start_date} to {plan.calendar.end_date}")
        print(f"Total Posts: {plan.calendar.total_posts}")
        print(f"\nPosts per Platform:")
        for platform, count in plan.calendar.posts_per_platform.items():
            print(f"  - {platform}: {count} posts")
        print(f"\nContent Pillars: {', '.join([p.value for p in plan.content_pillars])}")
        print(f"Language: {plan.editorial_guidelines.language}")
        print(f"Tone: {plan.editorial_guidelines.tone}")
        print(f"\nCTA Targets: {', '.join([cta.value for cta in plan.cta_targets])}")
        print("="*60)

        # Show first 3 days as example
        print("\nSample Content (First 3 Days):")
        print("-"*60)

        sample_days = {}
        for post in plan.calendar.posts[:9]:  # First 9 posts = 3 days
            if post.date not in sample_days:
                sample_days[post.date] = []
            sample_days[post.date].append(post)

        for date, posts in sorted(sample_days.items())[:3]:
            print(f"\n📅 {date}:")
            for post in posts:
                print(f"  • {post.platform.value}: {post.topic[:50]}...")
                print(f"    Pillar: {post.pillar.value} | Format: {post.variation.format.value}")


# Standalone function for easy integration
def create_monthly_strategy(
    brand_name: str,
    positioning: str,
    target_audience: str,
    value_props: List[str],
    start_date: str,
    duration_days: int = 30,
    language: str = "fr-FR",
    tone: str = "professional",
    cta_targets: List[str] = None,
    use_ai: bool = False,
    additional_context: str = ""
) -> MonthlyPlan:
    """
    Create a monthly editorial strategy

    Args:
        brand_name: Brand name
        positioning: Brand positioning
        target_audience: Target audience
        value_props: Value propositions
        start_date: Start date (YYYY-MM-DD)
        duration_days: Campaign duration
        language: Content language
        tone: Tone of voice
        cta_targets: CTA targets
        use_ai: Whether to use AI for enhanced content generation
        additional_context: Additional context for AI

    Returns:
        Monthly plan
    """
    agent = StrategyAgentV2()

    if use_ai:
        plan = agent.create_ai_generated_plan(
            brand_name=brand_name,
            positioning=positioning,
            target_audience=target_audience,
            value_props=value_props,
            start_date=start_date,
            duration_days=duration_days,
            language=language,
            tone=tone,
            cta_targets=cta_targets,
            additional_context=additional_context
        )
    else:
        plan = agent.create_monthly_plan(
            brand_name=brand_name,
            positioning=positioning,
            target_audience=target_audience,
            value_props=value_props,
            start_date=start_date,
            duration_days=duration_days,
            language=language,
            tone=tone,
            cta_targets=cta_targets
        )

    # Display summary
    agent.display_plan_summary(plan)

    return plan


# Tool for integration with orchestrator
@tool
def invoke_strategy_agent_v2(
    brand_name: str,
    positioning: str,
    target_audience: str,
    value_props: str,  # Comma-separated string
    start_date: str,
    duration_days: int = 30,
    language: str = "fr-FR"
) -> Dict:
    """
    Invoke the strategy agent to create a monthly plan

    Args:
        brand_name: Brand name
        positioning: Brand positioning
        target_audience: Target audience
        value_props: Comma-separated value propositions
        start_date: Start date (YYYY-MM-DD)
        duration_days: Campaign duration
        language: Content language

    Returns:
        Dictionary with the monthly plan
    """
    try:
        # Parse value props
        value_props_list = [v.strip() for v in value_props.split(",")]

        # Create plan
        plan = create_monthly_strategy(
            brand_name=brand_name,
            positioning=positioning,
            target_audience=target_audience,
            value_props=value_props_list,
            start_date=start_date,
            duration_days=duration_days,
            language=language,
            tone="professional",
            cta_targets=["demo", "newsletter", "free_trial"],
            use_ai=False
        )

        return {
            "success": True,
            "plan": plan.dict(),
            "plan_id": f"plan_{brand_name}_{start_date}",
            "message": f"Created {duration_days}-day editorial plan for {brand_name}"
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# Example usage
if __name__ == "__main__":
    # Test the strategy agent
    plan = create_monthly_strategy(
        brand_name="MeetSponsors",
        positioning="AI-powered platform connecting startups with sponsors",
        target_audience="Startups seeking funding and sponsors looking for innovation",
        value_props=[
            "AI-driven matching algorithm",
            "Verified sponsor network",
            "Streamlined communication",
            "Data-driven insights"
        ],
        start_date="2024-02-01",
        duration_days=30,
        language="fr-FR",
        tone="professional yet approachable",
        cta_targets=["demo", "newsletter", "discord", "free_trial"],
        use_ai=False
    )

    print(f"\n✅ Strategy created successfully!")
    print(f"Total posts planned: {plan.calendar.total_posts}")
