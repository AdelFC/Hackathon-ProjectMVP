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
            1. Covers exactly {total_days} days with posts ONLY for selected platforms: {selected_platforms}
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
            - Custom Hashtags: {custom_hashtags}
            - Editorial Guidelines DO: {do_guidelines}
            - Editorial Guidelines DON'T: {dont_guidelines}

            Requirements:
            - Generate {total_days} days of content
            - Posts per day: {posts_per_day} (ONLY for platforms: {selected_platforms})
            - Use all content pillars: education, social_proof, product, behind_the_scenes, thought_leadership, community
            - Vary post formats: text, image, video, carousel, poll, article
            - Rotate CTAs: {cta_targets}
            - Include provided hashtags: {custom_hashtags}
            - Follow DO guidelines: {do_guidelines}
            - Avoid DON'T guidelines: {dont_guidelines}

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

    def generate_startup_focused_topics(
        self,
        landing_page_info: Optional[str],
        startup_name: str,
        pillar: ContentPillar
    ) -> List[str]:
        """
        Generate startup-focused topics based on landing page analysis

        Args:
            landing_page_info: Analyzed landing page information
            startup_name: Name of the startup
            pillar: Content pillar to focus on

        Returns:
            List of relevant topics for the startup
        """
        if not landing_page_info:
            # Fallback to generic topics if no landing page info
            return self.get_generic_topics(startup_name, pillar)

        # Extract key information from landing page analysis
        startup_topics = {
            ContentPillar.EDUCATION: [
                f"How {startup_name} solves industry challenges",
                f"Understanding the problem {startup_name} addresses",
                f"The technology behind {startup_name}",
                f"Best practices for using {startup_name}",
                f"Industry insights from {startup_name} team"
            ],
            ContentPillar.SOCIAL_PROOF: [
                f"Success stories from {startup_name} users",
                f"How {startup_name} transformed our clients' business",
                f"Real results achieved with {startup_name}",
                f"Customer testimonials about {startup_name}",
                f"Case study: {startup_name} impact measurement"
            ],
            ContentPillar.PRODUCT: [
                f"Introducing {startup_name}'s key features",
                f"What makes {startup_name} different",
                f"Behind the scenes: Building {startup_name}",
                f"New updates and improvements to {startup_name}",
                f"The vision behind {startup_name}"
            ],
            ContentPillar.BEHIND_THE_SCENES: [
                f"Meet the {startup_name} team",
                f"A day in the life at {startup_name}",
                f"Our journey building {startup_name}",
                f"The culture and values at {startup_name}",
                f"Challenges we faced creating {startup_name}"
            ],
            ContentPillar.THOUGHT_LEADERSHIP: [
                f"The future of the industry according to {startup_name}",
                f"Why we built {startup_name}: Market insights",
                f"Trends shaping {startup_name}'s industry",
                f"Our CEO's vision for {startup_name}",
                f"Industry predictions from {startup_name} experts"
            ],
            ContentPillar.COMMUNITY: [
                f"Join the {startup_name} community",
                f"User-generated content featuring {startup_name}",
                f"Community spotlight: {startup_name} power users",
                f"Events and webinars by {startup_name}",
                f"Building a community around {startup_name}"
            ]
        }

        # Try to extract specific information from landing page analysis
        if "value proposition" in landing_page_info.lower():
            # Add value proposition focused topics
            startup_topics[pillar].extend([
                f"The core value {startup_name} brings to market",
                f"Why {startup_name}'s approach is revolutionary"
            ])

        if "target audience" in landing_page_info.lower():
            # Add audience-specific topics
            startup_topics[pillar].extend([
                f"How {startup_name} serves its target market",
                f"Understanding {startup_name}'s ideal customers"
            ])

        if "pricing" in landing_page_info.lower():
            # Add pricing/business model topics
            startup_topics[pillar].extend([
                f"The business model behind {startup_name}",
                f"Value for money: {startup_name}'s pricing strategy"
            ])

        return startup_topics.get(pillar, [])

    def get_generic_topics(self, startup_name: str, pillar: ContentPillar) -> List[str]:
        """Fallback generic topics when no landing page info is available"""
        generic_topics = {
            ContentPillar.EDUCATION: [
                f"Key insights about {startup_name}'s industry",
                f"How to optimize your business with {startup_name}",
                f"Understanding innovation in {startup_name}'s space"
            ],
            ContentPillar.SOCIAL_PROOF: [
                f"Success stories from {startup_name}",
                f"Impact metrics from {startup_name}",
                f"Client testimonials for {startup_name}"
            ],
            ContentPillar.PRODUCT: [
                f"New features from {startup_name}",
                f"How {startup_name} solves problems",
                f"Behind the technology of {startup_name}"
            ],
            ContentPillar.BEHIND_THE_SCENES: [
                f"Team spotlight at {startup_name}",
                f"Company culture at {startup_name}",
                f"Building {startup_name}: Our story"
            ],
            ContentPillar.THOUGHT_LEADERSHIP: [
                f"The future according to {startup_name}",
                f"Industry insights from {startup_name}",
                f"Innovation trends in {startup_name}'s field"
            ],
            ContentPillar.COMMUNITY: [
                f"Join the {startup_name} community",
                f"User highlights from {startup_name}",
                f"Community events by {startup_name}"
            ]
        }
        return generic_topics.get(pillar, [])

    def generate_daily_posts(
        self,
        brand_name: str,
        start_date: datetime,
        total_days: int,
        content_pillars: List[ContentPillar],
        cta_types: List[CTAType],
        startup_name: Optional[str] = None,
        landing_page_info: Optional[str] = None,
        platforms: Optional[List[str]] = None
    ) -> List[DailyPost]:
        """
        Generate daily posts for the calendar with startup focus

        Args:
            brand_name: Brand name
            start_date: Start date
            total_days: Number of days
            content_pillars: Available content pillars
            cta_types: Available CTA types
            startup_name: Name of the startup for content generation
            landing_page_info: Analyzed landing page information

        Returns:
            List of daily posts
        """
        posts = []
        # Use selected platforms or default to all three
        if platforms:
            # Convert string platform names to Platform enum
            selected_platforms = []
            for p in platforms:
                p_upper = p.upper() if isinstance(p, str) else str(p).upper()
                if 'LINKEDIN' in p_upper:
                    selected_platforms.append(Platform.LINKEDIN)
                elif 'FACEBOOK' in p_upper:
                    selected_platforms.append(Platform.FACEBOOK)
                elif 'TWITTER' in p_upper:
                    selected_platforms.append(Platform.TWITTER)
            platforms = selected_platforms if selected_platforms else [Platform.LINKEDIN, Platform.FACEBOOK, Platform.TWITTER]
            print(f"🎯 Selected platforms: {[p.value for p in platforms]}")
        else:
            platforms = [Platform.LINKEDIN, Platform.FACEBOOK, Platform.TWITTER]
            print(f"📱 Using default platforms: {[p.value for p in platforms]}")
        
        formats = list(PostFormat)
        variations = self.generate_content_variations()

        for day in range(total_days):
            current_date = start_date + timedelta(days=day)
            date_str = current_date.strftime("%Y-%m-%d")

            # Generate one post per platform for this day
            for platform in platforms:
                # Rotate through content pillars
                pillar = content_pillars[day % len(content_pillars)]

                # Generate startup-focused topics based on landing page analysis
                company_name = startup_name or brand_name
                startup_topics = self.generate_startup_focused_topics(
                    landing_page_info,
                    company_name,
                    pillar
                )

                # Select a topic from startup-focused topics
                topic = random.choice(startup_topics) if startup_topics else f"Insights about {company_name}"

                # Create variation
                variation = PostVariation(
                    angle=random.choice(variations["angles"]),
                    hook_style=random.choice(variations["hooks"]),
                    cta_type=random.choice(cta_types),
                    format=random.choice(formats)
                )

                # Platform-specific adjustments with startup focus
                if platform == Platform.TWITTER:
                    # Twitter prefers shorter, punchier content
                    key_message = f"🚀 {topic[:80]}..."
                    # Let LLM choose relevant hashtags for Twitter
                    hashtags = None  # Will be chosen by LLM during content generation
                elif platform == Platform.LINKEDIN:
                    # LinkedIn favors professional, detailed content
                    key_message = f"💡 Professional insight: {topic}\n\nWhat's your experience with similar solutions?"
                    # Let LLM choose relevant hashtags for LinkedIn
                    hashtags = None  # Will be chosen by LLM during content generation
                else:  # Facebook
                    # Facebook works well with engaging, community-focused content
                    key_message = f"🌟 Let's discuss: {topic}\n\nShare your thoughts in the comments!"
                    # Let LLM choose relevant hashtags for Facebook
                    hashtags = None  # Will be chosen by LLM during content generation

                # Create daily post
                post = DailyPost(
                    date=date_str,
                    platform=platform,
                    pillar=pillar,
                    topic=topic,
                    key_message=key_message,
                    variation=variation,
                    hashtags=hashtags,  # Will be filled by LLM during content generation
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
        cta_targets: List[str] = None,
        startup_name: Optional[str] = None,
        landing_page_info: Optional[str] = None,
        platforms: Optional[List[str]] = None
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
                cta_types=cta_types if cta_types else list(CTAType),
                startup_name=startup_name,
                landing_page_info=landing_page_info,
                platforms=platforms
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
        additional_context: str = "",
        startup_name: Optional[str] = None,
        landing_page_info: Optional[str] = None,
        platforms: Optional[List[str]] = None
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
                cta_targets=cta_targets,
                startup_name=startup_name,
                landing_page_info=landing_page_info,
                platforms=platforms
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

            # Extract hashtags and guidelines from tone if present
            custom_hashtags = ""
            do_guidelines = ""
            dont_guidelines = ""
            
            # Parse tone for additional data (hashtags, do/don't)
            if "Hashtags:" in tone:
                parts = tone.split("Hashtags:")
                if len(parts) > 1:
                    hashtag_part = parts[1].split(".")[0]
                    custom_hashtags = hashtag_part.strip()
                    
            if "À faire:" in tone:
                parts = tone.split("À faire:")
                if len(parts) > 1:
                    do_part = parts[1].split(".")[0]
                    do_guidelines = do_part.strip()
                    
            if "À éviter:" in tone:
                parts = tone.split("À éviter:")
                if len(parts) > 1:
                    dont_part = parts[1].split(".")[0]
                    dont_guidelines = dont_part.strip()
            
            # Get clean tone (without additional data)
            base_tone = tone.split(".")[0] if "." in tone else tone
            
            # Determine selected platforms
            if platforms:
                selected_platforms = ", ".join(platforms)
                posts_per_day = len(platforms)
            else:
                selected_platforms = "LinkedIn, Facebook, Twitter"
                posts_per_day = 3
            
            # Generate enhanced content using AI
            response = self.agent_executor.invoke({
                "query": query,
                "brand_name": brand_name,
                "positioning": positioning,
                "target_audience": target_audience,
                "value_props": ", ".join(value_props),
                "language": language,
                "tone": base_tone,
                "custom_hashtags": custom_hashtags or "innovation, startup, tech",
                "do_guidelines": do_guidelines or "Be authentic, share value, engage audience",
                "dont_guidelines": dont_guidelines or "Avoid jargon, no spam, no controversy",
                "selected_platforms": selected_platforms,
                "posts_per_day": posts_per_day,
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
                cta_targets=cta_targets,
                startup_name=startup_name,
                landing_page_info=landing_page_info,
                platforms=platforms
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
    additional_context: str = "",
    startup_name: Optional[str] = None,
    startup_url: Optional[str] = None,
    platforms: Optional[List[str]] = None
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
        startup_name: Name of the startup for content generation (required)
        startup_url: URL of the startup's landing page for analysis

    Returns:
        Monthly plan

    Raises:
        ValueError: If startup_name is not provided
    """
    # Validate required startup_name
    if not startup_name or startup_name.strip() == "":
        raise ValueError("startup_name is required and cannot be empty")


    # Extract landing page information if URL is provided
    landing_page_info = None
    if startup_url:
        try:
            print(f"Analyzing startup landing page: {startup_url}")
            landing_page_info = extract_landing_page_info(startup_url)
            print(f"Landing page analysis result: {landing_page_info[:200]}..." if landing_page_info else "No analysis result")
            if landing_page_info:
                additional_context += f"\n\nLanding Page Analysis:\n{landing_page_info}"
                print("✅ Landing page analysis completed")
        except Exception as e:
            print(f"⚠️ Could not analyze landing page: {e}")

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
            additional_context=additional_context,
            startup_name=startup_name,
            landing_page_info=landing_page_info,
            platforms=platforms
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
            cta_targets=cta_targets,
            startup_name=startup_name,
            landing_page_info=landing_page_info,
            platforms=platforms
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
    try:
        plan = create_monthly_strategy(
            brand_name="TestBrand",
            positioning="Innovative platform connecting businesses with opportunities",
            target_audience="Businesses seeking growth and partners looking for innovation",
            value_props=[
                "AI-driven matching algorithm",
                "Verified partner network",
                "Streamlined communication",
                "Data-driven insights"
            ],
            start_date="2024-02-01",
            duration_days=30,
            language="fr-FR",
            tone="professional yet approachable",
            cta_targets=["demo", "newsletter", "discord", "free_trial"],
            use_ai=False,
            startup_name="TestStartup",  # Required parameter
            startup_url="https://example.com"  # Optional parameter
        )

        print(f"\n✅ Strategy created successfully!")
        print(f"Total posts planned: {plan.calendar.total_posts}")
    except ValueError as e:
        print(f"❌ Error: {e}")
        print("Example of missing startup_name parameter")
