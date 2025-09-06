# TODO - Add Startup Info Everywhere for Correlated Content

## ✅ Completed
- [x] Strategy Agent V2 - supports startup_name and startup_url with landing page analysis
- [x] LinkedIn Agent - supports startup parameters
- [x] Main API - passes startup parameters
- [x] Data models - include startup fields
- [x] Frontend forms - capture startup info
- [x] **Twitter Agent** - Updated to accept startup_name, startup_url, and startup_context
- [x] **Facebook Agent** - Updated to accept startup_name, startup_url, and startup_context
- [x] **Orchestrator Agent V2** - Updated to pass startup info to all agents (Twitter, Facebook, LinkedIn)

## 🔄 In Progress
- [ ] Verify all frontend pages pass startup parameters consistently
- [ ] Test complete workflow with startup-specific content

## 📋 To Do
- [ ] Test Twitter agent with startup context
- [ ] Test Facebook agent with startup context
- [ ] Test complete orchestration workflow
- [ ] Verify content correlation with startup analysis
- [ ] Update any remaining frontend areas missing startup context

## 📝 Key Changes Made
**Backend Updates:**
1. **Twitter Agent** (`backend/agents/twitter/twitter_agent.py`)
   - Added `startup_name`, `startup_url`, `startup_context` parameters to constructor
   - Updated content generation prompts to use startup-specific context
   - Modified `invoke_twitter_agent` tool to accept startup parameters

2. **Facebook Agent** (`backend/agents/facebook/facebook_agent.py`)
   - Added `startup_name`, `startup_url`, `startup_context` parameters to constructor
   - Updated content generation prompts to use startup-specific context
   - Modified `invoke_facebook_agent` tool to accept startup parameters

3. **Orchestrator Agent V2** (`backend/agents/orchestrator_agent_v2.py`)
   - Updated channel agent initialization to pass startup context to all agents
   - Added `startup_context` parameter support throughout
   - Enhanced execution summary to show startup context usage

## 🎯 Current Status
**All backend agents now support startup context:**
- ✅ LinkedIn Agent - Uses startup_name and startup_url
- ✅ Twitter Agent - Uses startup_name, startup_url, and startup_context
- ✅ Facebook Agent - Uses startup_name, startup_url, and startup_context
- ✅ Orchestrator - Passes startup context to all channel agents

**Content Generation:**
All agents now generate content that is:
- Personalized to the specific startup name
- Informed by the startup's landing page analysis
- Correlated to the startup's unique context and mission
- Tailored to each platform while maintaining startup consistency

## 🎯 Expected Result
All generated content (Twitter, Facebook, LinkedIn) will be personalized and correlated to the specific startup based on the analyzed landing page information and startup name captured by the LLM.
