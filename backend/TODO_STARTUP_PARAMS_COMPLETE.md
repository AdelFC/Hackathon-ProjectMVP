# TODO: Modify Backend to Accept Startup URL and Name as Arguments

## Progress Tracking

### 1. Update Models ✅
- [x] Add startup_name and startup_url to StrategyRequest model
- [x] Add startup_name and startup_url to OrchestratorRequest model
- [x] Add startup_name and startup_url to MonthlyPlan model
- [x] Add startup_name and startup_url to DailyContentPackage model

### 2. Update LinkedIn Agent ✅
- [x] Remove hardcoded STARTUP_NAME and STARTUP_URL constants
- [x] Modify LinkedinAgent.__init__() to accept startup parameters
- [x] Update create_viral_post() method to use instance variables
- [x] Modify invoke_linkedin_agent() to accept both parameters
- [x] Update create_linkedin_viral_post() function

### 3. Update Orchestrator Agent ✅
- [x] Modify OrchestratorAgentV2.__init__() to accept startup configuration
- [x] Update channel agents initialization
- [x] Modify dispatch_to_channel() method
- [x] Update create_content_package() method
- [x] Update execute_daily() method

### 4. Update Main API ✅
- [x] Update API endpoints to accept startup parameters
- [x] Pass parameters through to agents
- [x] Update test endpoints with startup parameters

### 5. Update Other Agents (Optional - for consistency)
- [ ] Update Facebook agent
- [ ] Update Twitter agent

### 6. Testing
- [ ] Test strategy generation with startup parameters
- [ ] Test daily orchestration with startup parameters
- [ ] Test individual agent invocation

## Summary of Changes

### API Changes
The following endpoints now accept `startup_name` and `startup_url` parameters:

1. **POST /strategy/generate**
   - Body parameters: `startup_name` (optional), `startup_url` (optional)

2. **POST /orchestrator/daily**
   - Body parameters: `startup_name` (optional), `startup_url` (optional)

3. **POST /orchestrator/retry/{date}/{platform}**
   - Query parameters: `startup_name` (optional), `startup_url` (optional)

4. **POST /test/create-sample-strategy**
   - Query parameters: `startup_name` (default: "Meetsponsors"), `startup_url` (default: "https://meetsponsors.com/")

5. **POST /test/dry-run-orchestration**
   - Query parameters: `startup_name` (default: "Meetsponsors"), `startup_url` (default: "https://meetsponsors.com/")

### Usage Examples

#### Strategy Generation with Startup Info
```bash
curl -X POST "http://localhost:8000/strategy/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_name": "MyBrand",
    "positioning": "Innovative solution",
    "target_audience": "Startups",
    "value_props": ["Innovation", "Efficiency"],
    "start_date": "2024-01-01",
    "cta_targets": ["demo", "newsletter"],
    "startup_name": "MyStartup",
    "startup_url": "https://mystartup.com"
  }'
```

#### Daily Orchestration with Startup Info
```bash
curl -X POST "http://localhost:8000/orchestrator/daily" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "MyBrand",
    "startup_name": "MyStartup",
    "startup_url": "https://mystartup.com"
  }'
```

#### Test Endpoints with Custom Startup
```bash
# Create sample strategy
curl -X POST "http://localhost:8000/test/create-sample-strategy?startup_name=MyStartup&startup_url=https://mystartup.com"

# Dry run orchestration
curl -X POST "http://localhost:8000/test/dry-run-orchestration?startup_name=MyStartup&startup_url=https://mystartup.com"
```

### Implementation Notes

1. **Backward Compatibility**: All startup parameters are optional, ensuring backward compatibility with existing code.

2. **Default Values**: When not provided:
   - `startup_name` defaults to "Your Startup" in LinkedIn agent
   - `startup_url` defaults to None (no landing page analysis)

3. **Parameter Flow**:
   - API endpoints → Orchestrator → Channel Agents (LinkedIn)
   - Strategy generation stores startup info in the MonthlyPlan

4. **Storage**: Startup information is stored with the MonthlyPlan for persistence across executions.

## Files Modified

1. **backend/agents/models.py**
   - Added startup_name and startup_url fields to StrategyRequest, OrchestratorRequest, MonthlyPlan, and DailyContentPackage

2. **backend/agents/linkedin/linkedin_agent.py**
   - Removed hardcoded constants
   - Modified class to accept startup parameters
   - Updated all methods to use instance/parameter values

3. **backend/agents/orchestrator_agent_v2.py**
   - Modified to accept and pass startup parameters
   - Updated channel agent initialization
   - Modified content package creation

4. **backend/main_v2.py**
   - Updated all relevant endpoints
   - Added startup parameters to request handling
   - Modified agent initialization

## Next Steps

1. **Testing**: Run the test endpoints to verify the implementation works correctly
2. **Frontend Integration**: Update frontend forms to include startup_name and startup_url fields
3. **Documentation**: Update API documentation with the new parameters
4. **Facebook/Twitter Agents**: Consider updating these agents for consistency (optional)
