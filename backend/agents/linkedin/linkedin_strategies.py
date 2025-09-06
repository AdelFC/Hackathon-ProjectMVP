"""
LinkedIn Viral Post Strategies and Best Practices
"""

LINKEDIN_VIRAL_STRATEGIES = """
# LinkedIn Viral Post Strategies Guide

## 1. Hook Strategies (First 2 Lines)
- Start with a controversial statement or counterintuitive insight
- Use pattern interrupts: "Everyone thinks X, but actually Y"
- Ask provocative questions that challenge common beliefs
- Share surprising statistics or data points
- Personal vulnerability: "I failed at..." or "I was wrong about..."
- Use numbers: "3 lessons from losing $100k"
- Create curiosity gaps: "What I learned from..."

## 2. Content Structure for Maximum Engagement
- Use short paragraphs (1-2 lines max)
- Add line breaks between thoughts for easy scanning
- Use emojis strategically (but not excessively) 🎯
- Include a clear CTA at the end
- Format: Hook → Story → Insight → CTA
- Optimal length: 1500-2500 characters for comprehensive value and insights

## 3. Storytelling Frameworks
- Before/After transformation stories
- Failure to success narratives
- David vs Goliath (underdog stories)
- Behind-the-scenes revelations
- Lessons learned format
- Case studies with specific results

## 4. Engagement Triggers
- Ask questions at the end to encourage comments
- Create polls when appropriate
- Tag relevant people (but not excessively)
- Respond to early comments quickly (first hour is crucial)
- Use "Agree?" or "Thoughts?" to prompt responses

## 5. Best Posting Times
- Tuesday to Thursday: 7-9 AM, 12-1 PM, 5-6 PM (local time)
- Avoid Mondays and Fridays
- Test different times for your specific audience

## 6. Hashtag Strategy
- Use 3-5 highly relevant hashtags
- Mix popular and niche hashtags
- Place hashtags at the end of the post
- Research trending hashtags in your industry

## 7. Visual Content Rules
- Posts with images get 2x more engagement
- Native video gets 5x more engagement
- Carousel posts (PDFs) get 3x more clicks
- Infographics perform exceptionally well
- Keep text on images minimal and readable

## 8. Topics That Go Viral on LinkedIn
- Career pivots and transformations
- Hiring/firing stories with lessons
- Industry predictions and trends
- Contrarian takes on popular beliefs
- Personal vulnerability and growth
- Success metrics and case studies
- Tool and resource recommendations
- Leadership lessons
- Remote work insights
- AI and technology impacts

## 9. Psychological Triggers
- FOMO (Fear of Missing Out)
- Social proof (testimonials, numbers)
- Authority (expertise demonstration)
- Reciprocity (giving value first)
- Scarcity (limited opportunities)
- Unity (shared experiences)

## 10. Call-to-Action Examples
- "What's your experience with this?"
- "Share your thoughts below 👇"
- "Repost if you agree ♻️"
- "Follow for more insights on [topic]"
- "What would you add to this list?"
- "Tag someone who needs to see this"
"""

LINKEDIN_POST_TEMPLATES = {
    "transformation": """
{hook_statement}

{time_period} ago, I was {starting_point}.

Today, I'm {current_state}.

Here's what changed everything:

{key_insight_1}

{key_insight_2}

{key_insight_3}

The biggest lesson?
→ {main_takeaway}

{cta_question}

#hashtag1 #hashtag2 #hashtag3
""",

    "lessons_learned": """
{number} lessons from {experience}:

1. {lesson_1}
   → {explanation_1}

2. {lesson_2}
   → {explanation_2}

3. {lesson_3}
   → {explanation_3}

{optional_additional_lessons}

The bottom line:
{key_message}

What would you add to this list?

#hashtag1 #hashtag2 #hashtag3
""",

    "controversial": """
Unpopular opinion:

{controversial_statement}

Here's why:

{reason_1}

{reason_2}

{reason_3}

I know this goes against {common_belief}, but {evidence_or_experience}.

{supporting_data_or_story}

Am I wrong here?

Let me know your thoughts 👇

#hashtag1 #hashtag2 #hashtag3
""",

    "case_study": """
How {company/person} achieved {specific_result} in {timeframe}:

The Challenge:
• {challenge_point_1}
• {challenge_point_2}

The Strategy:
{strategy_explanation}

The Results:
📈 {metric_1}
📊 {metric_2}
🎯 {metric_3}

Key Takeaway:
{main_lesson}

{cta_implementation}

#hashtag1 #hashtag2 #hashtag3
""",

    "storytelling": """
{attention_grabbing_opening}

{setup_context}

Then {turning_point}.

{what_happened_next}

{climax_or_revelation}

{resolution}

The lesson?
{key_insight}

{relatable_question}

#hashtag1 #hashtag2 #hashtag3
"""
}

def get_viral_strategy_prompt():
    """Returns the complete viral strategy guide for the LinkedIn agent"""
    return LINKEDIN_VIRAL_STRATEGIES

def get_post_template(template_type: str = "transformation"):
    """Returns a specific post template"""
    return LINKEDIN_POST_TEMPLATES.get(template_type, LINKEDIN_POST_TEMPLATES["transformation"])
