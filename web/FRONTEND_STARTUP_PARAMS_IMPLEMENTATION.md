# Frontend Implementation: Startup URL and Name Parameters

## Overview
Successfully updated the frontend to support the new `startup_name` and `startup_url` parameters that were added to the backend API.

## Changes Implemented

### 1. API Service (`web/src/services/api.ts`)
- **Updated Interfaces:**
  - Added `startup_name` and `startup_url` to `StrategyRequest` interface
  - Added `startup_name` and `startup_url` to `OrchestratorRequest` interface

- **Updated Methods:**
  - Modified `createSampleStrategy()` to accept startup parameters as query params
  - Modified `dryRunOrchestration()` to accept startup parameters as query params
  - Added new `retryPostWithStartup()` method for retrying posts with startup params

### 2. Project Store (`web/src/stores/projectStore.ts`)
- **Updated `BrandIdentity` Interface:**
  ```typescript
  interface BrandIdentity {
    // ... existing fields ...
    startupName?: string;
    startupUrl?: string;
  }
  ```

### 3. Brand Form Component (`web/src/components/forms/BrandForm.tsx`)
- **Added New Form Fields:**
  - "Nom de la startup" (Startup Name) - optional text field
  - "URL de la startup" (Startup URL) - optional URL field with validation

- **Updated Form Schema:**
  - Added validation for `startupName` (optional string)
  - Added validation for `startupUrl` (optional URL with format validation)

- **Updated Form State:**
  - Form now saves `startupName` and `startupUrl` to the project store

### 4. Setup Connected Page (`web/src/pages/SetupConnected.tsx`)
- **Added Form Fields in Step 2 (Brand):**
  - Added startup name input field
  - Added startup URL input field

- **Updated Strategy Generation:**
  - Now passes `startup_name` and `startup_url` when calling `generateStrategy()`

- **Form Data Structure:**
  ```typescript
  interface FormData {
    // ... existing fields ...
    startupName: string;
    startupUrl: string;
  }
  ```

### 5. Strategy Connected Page (`web/src/pages/StrategyConnected.tsx`)
- **Updated Strategy Generation:**
  - `handleGenerateStrategy()` now includes startup parameters from brand identity

- **Updated Orchestration Calls:**
  - `handlePublishToday()` now includes startup parameters
  - `handleDryRun()` now includes startup parameters

## User Flow

1. **Setup Flow:**
   - User enters brand information including optional startup name and URL
   - These values are saved to the project store
   - When generating strategy, the startup params are sent to the backend

2. **Strategy Management:**
   - When generating a new strategy, startup params are pulled from brand identity
   - When running orchestration (publish/dry run), startup params are included

3. **Content Generation:**
   - Backend uses startup_name in content generation
   - Backend analyzes startup_url landing page for personalized content

## Benefits

1. **Personalized Content:** Each brand can have its own startup identity for content generation
2. **Landing Page Analysis:** The system can analyze the startup's landing page for better content
3. **Multi-tenant Support:** Different startups can use the same system with their own branding
4. **Backward Compatibility:** All fields are optional, existing setups continue to work

## Testing Checklist

- [ ] Brand Form saves startup fields correctly
- [ ] Setup flow passes startup params to strategy generation
- [ ] Strategy page includes startup params in all API calls
- [ ] Orchestration includes startup params
- [ ] Content generated reflects the startup name
- [ ] Landing page analysis works with provided URL

## API Calls with New Parameters

### Strategy Generation
```javascript
await generateStrategy({
  brand_name: "MyBrand",
  // ... other params ...
  startup_name: "MyStartup",
  startup_url: "https://mystartup.com"
})
```

### Orchestration
```javascript
await runOrchestration({
  company_name: "MyBrand",
  execute_date: "2024-01-15",
  dry_run: false,
  startup_name: "MyStartup",
  startup_url: "https://mystartup.com"
})
```

## Next Steps

1. **Testing:** Verify all flows work with the new parameters
2. **Validation:** Ensure URL validation works correctly
3. **UI Polish:** Consider adding tooltips to explain the fields
4. **Documentation:** Update user documentation with the new fields
