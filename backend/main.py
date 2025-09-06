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
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json

# from db import db

load_dotenv()

class ResearchResponse(BaseModel):
    response: str

parser = PydanticOutputParser(pydantic_object=ResearchResponse)

# ---------- LLM (example: Blackbox via OpenAI-compatible API) ----------
llm = ChatOpenAI(
    api_key=os.getenv("BLACKBOX_API_KEY"),
    base_url="https://api.blackbox.ai/v1",
    model=os.getenv("BLACKBOX_MODEL", "blackboxai/openai/gpt-4.1-nano"),
    temperature=0.2,
)

# ---------- Prompt with format instructions ----------
prompt = ChatPromptTemplate.from_messages(
    [
        ("system",
         "You are a planner. Produce a valid JSON object that matches this schema:\n{format_instructions}"),
        MessagesPlaceholder("chat_history"),
        ("human", "{query}"),
        MessagesPlaceholder("agent_scratchpad"),
    ]
).partial(format_instructions=parser.get_format_instructions())

# ---------- Agent ----------
tools = [search_tool, wiki_tool, save_tool]
agent = create_tool_calling_agent(llm=llm, prompt=prompt, tools=[])
agent_executor = AgentExecutor(agent=agent, tools=[], verbose=True, handle_parsing_errors=True)

# ---------- FastAPI App ----------
app = FastAPI(title="AI Planning Service", description="AI agent for project planning and task generation")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ai-planning-agent"}

@app.get("/agent")
async def get_available_tools():
    """
    Get list of available tools for the agent
    """
    return {
        "tools": [
            {"name": tool.name, "description": tool.description}
            for tool in tools
        ]
    }
# ---------- Run Server ----------
if __name__ == "__main__":
    # Start the FastAPI server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3131)),
        reload=False
    )
