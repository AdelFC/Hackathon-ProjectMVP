# Strategy Agent Startup Parameters Implementation

## Overview
Successfully updated the strategy agent and related components to accept `startup_name` and `startup_url` parameters, removing all hardcoded references to "MeetSponsors" and making the system dynamic.

## Changes Implemented

### 1. Strategy Agent V2 (`backend/agents/strategy_agent_v2.py`)

#### Function Signature Updates:
- **`create_monthly_strategy()`**: Added `startup_name` and `startup_url` parameters
- **`create_monthly_plan()`**: Added `startup_name` parameter
- **`create_ai_generated_plan()`**: Added `startup_name` parameter
- **`generate_daily_posts()`**: Added `startup_name` parameter

#### Key Changes:
- **Validation**: Added required validation for `startup_name` - throws `ValueError` if not provided
- **Landing Page Analysis**: Automatically analyzes `startup_url` if provided using `extract_landing_page_info()`
- **Dynamic Content**: Replaced hardcoded "MeetSponsors" references with dynamic startup name
- **Topic Generation**: Updated topic templates to use `startup_name` or fallback to `brand_name`

#### Content Generation Improvements:
```python
# Before (hardcoded)
topic = topic_template.format(
    industry="startup ecosystem",
    process="sponsor matching",
    # ... hardcoded values
)

# After (dynamic)
company_name = startup_name or brand_name
topic = topic_template.format(
    industry=f"{company_name} ecosystem",
    process="business growth",
    # ... dynamic values based on startup
)
```

### 2. Main API (`backend/main_v2.py`)

#### Strategy Generation Endpoint:
- Updated `/strategy/generate` to pass `startup_name` and `startup_url` to `create_monthly_strategy()`
- Added logging for startup parameters
- Enhanced error handling for missing startup_name

#### Test Endpoints:
- Updated `/test/create-sample-strategy` to accept startup parameters
- Updated `/test/dry-run-orchestration` to use startup parameters
- Removed hardcoded "MeetSponsors" references

### 3. Orchestrator Agent V2 (`backend/agents/orchestrator_agent_v2.py`)

#### Already Updated:
- Constructor accepts `startup_name` and `startup_url`
- Passes startup info to LinkedIn agent
- `execute_daily_orchestration()` function supports startup parameters
- Content packages include startup information

#### Example Usage Fixed:
- Updated test code to use required `startup_name` parameter
- Added proper error handling examples

### 4. Data Models (`backend/agents/models.py`)

#### Updated Models:
- **`StrategyRequest`**: Added `startup_name` and `startup_url` fields
- **`OrchestratorRequest`**: Added `startup_name` and `startup_url` fields
- **`MonthlyPlan`**: Added `startup_name` and `startup_url` fields
- **`DailyContentPackage`**: Added `startup_name` and `startup_url` fields

## Error Handling

### Required Parameter Validation:
```python
if not startup_name or startup_name.strip() == "":
    raise ValueError("startup_name is required and cannot be empty")
```

### Landing Page Analysis:
```python
if startup_url:
    try:
        landing_page_info = extract_landing_page_info(startup_url)
        additional_context += f"\n\nLanding Page Analysis:\n{landing_page_info}"
    except Exception as e:
        print(f"⚠️ Could not analyze landing page: {e}")
```

## API Usage Examples

### Strategy Generation:
```bash
curl -X POST "http://localhost:8000/strategy/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_name": "MyBrand",
    "startup_name": "MyStartup",
    "startup_url": "https://mystartup.com",
    "positioning": "Innovative platform",
    "target_audience": "Tech startups",
    "value_props": ["AI-driven", "Efficient"],
    "start_date": "2024-01-01",
    "duration_days": 30,
    "language": "fr-FR",
    "tone": "professional",
    "cta_targets": ["demo", "newsletter"]
  }'
```

### Daily Orchestration:
```bash
curl -X POST "http://localhost:8000/orchestrator/daily" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "MyBrand",
    "startup_name": "MyStartup",
    "startup_url": "https://mystartup.com",
    "execute_date": "2024-01-15",
    "dry_run": true
  }'
```

## Benefits

1. **Dynamic Content Generation**: Each startup gets personalized content based on their name and landing page
2. **Landing Page Analysis**: Automatic extraction of startup information for better content relevance
3. **Multi-tenant Support**: Multiple startups can use the same system with their own branding
4. **Error Prevention**: Required validation prevents empty or missing startup names
5. **Backward Compatibility**: All parameters are optional in models, existing code continues to work

## Testing

### Successful Case:
```python
plan = create_monthly_strategy(
    brand_name="TestBrand",
    startup_name="TestStartup",  # Required
    startup_url="https://example.com",  # Optional
    # ... other parameters
)
```

### Error Case:
```python
try:
    plan = create_monthly_strategy(
        brand_name="TestBrand",
        # startup_name missing - will raise ValueError
    )
except ValueError as e:
    print(f"Error: {e}")  # "startup_name is required and cannot be empty"
```

## Migration Notes

### For Existing Code:
- All existing API calls need to include `startup_name` parameter
- `startup_url` is optional but recommended for better content
- Frontend forms have been updated to collect these values

### For New Implementations:
- Always provide `startup_name` when calling strategy generation
- Consider providing `startup_url` for landing page analysis
- Use the new dynamic content generation capabilities

## Next Steps

1. **Testing**: Verify all endpoints work with new parameters
2. **Documentation**: Update API documentation with new required fields
3. **Monitoring**: Monitor landing page analysis success rates
4. **Content Quality**: Review generated content quality with dynamic startup names
