from dotenv import load_dotenv
import os
from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import PydanticOutputParser
from langchain.agents import AgentExecutor
from langchain.agents import create_tool_calling_agent, AgentExecutor
from tools import search_tool, wiki_tool, save_tool
import json
import base64
from pathlib import Path
from landing_page_analyzer import extract_landing_page_info


# from db import db

SUPPORTED_PLATFORMS = ["Facebook", "LinkedIn", "Twitter"]

STARTUP_NAME =  "Meetsponsors"
STARTUP_LANDING_PAGE = "https://meetsponsors.com/"

load_dotenv()

class ResearchResponse(BaseModel):
    response: str

parser = PydanticOutputParser(pydantic_object=ResearchResponse)

# ---------- LLM (example: Blackbox via OpenAI-compatible API) ----------
llm = ChatOpenAI(
    api_key=os.getenv("BLACKBOX_API_KEY"),
    base_url="https://api.blackbox.ai/v1",
    model=os.getenv("BLACKBOX_MODEL", "blackboxai/openai/gpt-4o"),
    temperature=0.2,
)

# ---------- Prompt with format instructions ----------
prompt = ChatPromptTemplate.from_messages(
    [
        ("system",
         """
         You are a community manager for {STARTUP_NAME}, you have to elaborate a plan in order to grow the community.
         <community_name> is present on the following platforms: {SUPPORTED_PLATFORMS}.
         Each platform has its own characteristics and audience, you will be able to dispatch posts tasks to other AI agents, each one specialized in the social network.
         According to the information about the community, you have to create a structured plan with tasks to be executed by specialized agents.
         You have to produce a structured plan with the following sections:
         Here are the the startup : {about_startup}\n
         Produce a valid JSON object that matches this schema:\n{format_instructions}
         """),
        MessagesPlaceholder("chat_history"),
        ("human", "{query}"),
        MessagesPlaceholder("agent_scratchpad"),
    ]
).partial(format_instructions=parser.get_format_instructions())

# ---------- Agent ----------
tools = [search_tool, wiki_tool, save_tool]
agent = create_tool_calling_agent(llm=llm, prompt=prompt, tools=tools)
main_agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

def main_agent(query: str, chat_history: List = None) -> ResearchResponse:
    """Main agent function to process the query and return a structured response"""
    if chat_history is None:
        chat_history = []

    page_info = extract_landing_page_info(STARTUP_LANDING_PAGE)

    # Pass all required variables to the prompt
    raw_response = main_agent_executor.invoke({
        "query": query,
        "STARTUP_NAME": STARTUP_NAME,
        "SUPPORTED_PLATFORMS": ", ".join(SUPPORTED_PLATFORMS),
        "chat_history": chat_history,
        "about_startup": page_info # Assuming this function is defined in landing_page_analyzer.py
    })

    try:
        # Parse the output from the agent
        output = raw_response.get("output", "")
        structured_response = parser.parse(output)
        return structured_response
    except Exception as e:
        print(f"Error parsing response: {e}")
        # Return a default response if parsing fails
        return ResearchResponse(response=output if output else "Error processing request")
