# TODO: Fix Orchestrator Agent Tool Invocation Issue

## Problem
The orchestrator agent is incorrectly using `.invoke()` method on tool-decorated functions, causing Pydantic validation errors.

## Tasks
- [x] Fix `delegate_to_strategy_agent` invocation in `process_request` method
- [x] Fix `delegate_to_linkedin_agent` invocation in `process_request` method
- [x] Fix other tool invocations (`get_campaign_status`, `generate_report`) if needed
- [x] Fix similar issues in `strategy_agent.py` (tool invocations within the class)
- [x] Fix calls to `invoke_strategy_agent` and `invoke_linkedin_agent` (they are also tools)
- [x] Test the fixed orchestrator agent

## Progress
- Fixed all `.invoke()` calls on tool-decorated methods in orchestrator_agent.py
- Fixed all `.invoke()` calls on tool-decorated methods in strategy_agent.py
- Fixed calls to external tool-decorated functions (`invoke_strategy_agent`, `invoke_linkedin_agent`)
- **Main issue resolved**: The orchestrator can now properly delegate to strategy and LinkedIn agents
- **Remaining issue**: The agent executors within strategy_agent.py still have issues with tool-decorated class methods
  - This is a deeper LangChain limitation with @tool decorator on class methods
  - Workaround: The orchestrator can still call these agents directly, bypassing the internal agent executor

## Result
✅ The main orchestrator error "Field required [type=missing..." has been fixed
✅ The orchestrator can now successfully delegate tasks to other agents
⚠️ Internal agent executors may still have issues with tool-decorated class methods (separate issue)
