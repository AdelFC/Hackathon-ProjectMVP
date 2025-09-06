# TODO: Social CM Orchestrator Suite Implementation

## Priority Tasks

### Phase 1: Core Models and Storage
- [x] Create shared models (backend/agents/models.py)
  - [x] MonthlyPlan model with JSON schema
  - [x] DailyContentPackage model
  - [x] PostContent model
  - [x] ContentPillar enum
  - [x] EngagementMetrics model
- [x] Create storage system (backend/agents/storage.py)
  - [x] Track posted content for idempotency
  - [x] Store monthly strategies
  - [x] Track performance metrics
  - [x] Store generated images

### Phase 2: Refactor StrategyAgent
- [x] Update to produce monthly calendar JSON (30/31 days)
- [x] Implement 4+ content pillars (education, social proof, product, behind-the-scenes)
- [x] Add variation rules (angles, hooks, CTAs, formats)
- [x] Add tone of voice guidelines
- [x] Generate 1 post/day/network structure

### Phase 3: Refactor OrchestratorAgent
- [x] Implement daily execution logic (called 1x/day via API)
- [x] Add idempotency checks (re-executable without double posting)
- [x] Add fallback mechanisms for network failures
- [x] Implement security: no user prompts to ChannelAgents
- [x] Add signal injection (recent news, yesterday's performance)
- [x] Resolve dependencies (assets, links)

### Phase 4: Update API Endpoints
- [x] Add /strategy/generate endpoint
- [x] Add /orchestrator/daily endpoint
- [x] Add /posts/manual endpoint
- [x] Add /analytics/performance endpoint

## Configuration
- **Networks**: LinkedIn, Facebook, Twitter
- **Cadence**: 1 post per network per day (3 posts/day total)
- **Horizon**: 1 month planning
- **Language**: Configurable (default: fr-FR)
- **Security**: Agent-to-agent interactions only

## Progress Log
- [Started: Date] - Initial implementation
