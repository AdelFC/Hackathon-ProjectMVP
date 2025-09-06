# TODO: Modify Backend to Accept Startup URL and Name as Arguments

## Progress Tracking

### 1. Update Models
- [ ] Add startup_name and startup_url to StrategyRequest model
- [ ] Add startup_name and startup_url to OrchestratorRequest model
- [ ] Update any other relevant models

### 2. Update LinkedIn Agent
- [ ] Remove hardcoded STARTUP_NAME and STARTUP_URL constants
- [ ] Modify LinkedinAgent.__init__() to accept startup parameters
- [ ] Update create_viral_post() method to use instance variables
- [ ] Modify invoke_linkedin_agent() to accept both parameters
- [ ] Update create_linkedin_viral_post() function

### 3. Update Orchestrator Agent
- [ ] Modify OrchestratorAgentV2.__init__() to accept startup configuration
- [ ] Update channel agents initialization
- [ ] Modify dispatch_to_channel() method

### 4. Update Main API
- [ ] Update API endpoints to accept startup parameters
- [ ] Pass parameters through to agents

### 5. Update Other Agents (for consistency)
- [ ] Update Facebook agent
- [ ] Update Twitter agent

### 6. Testing
- [ ] Test strategy generation with startup parameters
- [ ] Test daily orchestration with startup parameters
- [ ] Test individual agent invocation
