# Social CM Orchestrator Suite

A comprehensive social media content management system that automates content strategy, generation, and daily posting across LinkedIn, Facebook, and Twitter.

## 🎯 Overview

The Social CM Orchestrator Suite is an AI-powered platform that manages your social media presence with:
- **Monthly Strategy Generation**: Creates 30/31-day content calendars with 1 post per day per network
- **Daily Orchestration**: Automatically executes daily posting with idempotency and error handling
- **Multi-Platform Support**: LinkedIn, Facebook, and Twitter integration
- **Content Intelligence**: Adapts content based on performance metrics and trending topics
- **Security First**: Agent-to-agent communication only, no direct user content injection

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User/API Layer                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Strategy   │  │ Orchestrator │  │   Analytics  │      │
│  │   Agent V2   │  │   Agent V2   │  │   Endpoints  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │                  Storage Layer                      │     │
│  │  (SQLite DB + JSON Files + Image Storage)          │     │
│  └────────────────────────────────────────────────────┘     │
│                            │                                 │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │   LinkedIn   │   Facebook   │   Twitter    │            │
│  │    Agent     │    Agent     │    Agent     │            │
│  └──────────────┴──────────────┴──────────────┘            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Features

### Strategy Generation
- **Content Pillars**: Education, Social Proof, Product, Behind-the-scenes, Thought Leadership, Community
- **Variation Rules**: Automated variation of angles, hooks, CTAs, and formats
- **Editorial Guidelines**: Tone of voice, do's and don'ts, brand voice attributes
- **Platform Optimization**: Platform-specific content adaptation

### Daily Orchestration
- **Idempotency**: Never posts duplicate content
- **Signal Injection**: Incorporates trending topics and yesterday's performance
- **Fallback Mechanisms**: Automatic error handling and retry logic
- **Dry Run Mode**: Test execution without actual posting

### Analytics & Monitoring
- **Performance Tracking**: Impressions, engagements, click-through rates
- **Platform Breakdown**: Per-platform performance metrics
- **Historical Data**: 90-day data retention with cleanup options

## 🚀 Quick Start

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Hackathon-MVP/backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

### Running the API

Start the main API server:
```bash
python main_v2.py
```

The API will be available at `http://localhost:3131`

### Running Tests

Execute the comprehensive test suite:
```bash
python test_orchestrator_suite.py
```

## 📚 API Documentation

### Strategy Endpoints

#### Generate Monthly Strategy
```http
POST /strategy/generate
Content-Type: application/json

{
  "brand_name": "YourBrand",
  "positioning": "Your brand positioning",
  "target_audience": "Your target audience",
  "value_props": ["Prop 1", "Prop 2", "Prop 3"],
  "start_date": "2024-01-01",
  "duration_days": 30,
  "language": "fr-FR",
  "tone": "professional",
  "cta_targets": ["demo", "newsletter", "free_trial"]
}
```

#### Get Active Strategy
```http
GET /strategy/active/{brand_name}
```

#### Get Daily Posts
```http
GET /strategy/posts/{brand_name}/{date}
```

### Orchestrator Endpoints

#### Execute Daily Posting
```http
POST /orchestrator/daily
Content-Type: application/json

{
  "execute_date": "2024-01-15",
  "force_execution": false,
  "dry_run": false,
  "platforms": ["LinkedIn", "Facebook", "Twitter"]
}
```

#### Get Execution Status
```http
GET /orchestrator/status?date=2024-01-15
```

#### Retry Failed Post
```http
POST /orchestrator/retry/{date}/{platform}
```

### Analytics Endpoints

#### Get Performance Analytics
```http
POST /analytics/performance
Content-Type: application/json

{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "platforms": ["LinkedIn"],
  "metrics": ["impressions", "engagements"]
}
```

#### Get Yesterday's Performance
```http
GET /analytics/yesterday/{brand_name}
```

## 🔧 Configuration

### Content Pillars
The system uses 6 content pillars by default:
- **Education**: How-to guides, tutorials, insights
- **Social Proof**: Testimonials, case studies, success stories
- **Product**: Features, updates, announcements
- **Behind-the-scenes**: Team culture, company values
- **Thought Leadership**: Industry insights, predictions
- **Community**: User highlights, events, challenges

### Posting Schedule
Default optimal posting times:
- **LinkedIn**: 09:00
- **Facebook**: 14:00
- **Twitter**: 12:00

### Storage Configuration
Data is stored in:
- `backend/data/orchestrator/strategies/` - Monthly strategies
- `backend/data/orchestrator/posts/` - Posted content records
- `backend/data/orchestrator/metrics/` - Performance metrics
- `backend/data/orchestrator/images/` - Generated images
- `backend/data/orchestrator/orchestrator.db` - SQLite database

## 🔒 Security

### Agent-to-Agent Communication
- ChannelAgents only accept content from StrategyAgent/OrchestratorAgent
- No direct user content injection to posting agents
- All content validated before posting

### Idempotency
- Content hash tracking prevents duplicate posts
- Date/platform unique constraints
- Retry logic with maximum attempts

## 🧪 Testing

### Test Coverage
The test suite covers:
1. Strategy Generation
2. Storage Operations
3. Orchestrator Dry Run
4. Performance Metrics
5. Multi-day Execution
6. Error Handling

### Sample Test Commands
```bash
# Run all tests
python test_orchestrator_suite.py

# Test strategy generation only
python -c "from test_orchestrator_suite import test_strategy_generation; test_strategy_generation()"

# Test orchestrator dry run
python -c "from test_orchestrator_suite import test_orchestrator_dry_run; test_orchestrator_dry_run()"
```

## 📊 Monitoring

### Health Check
```http
GET /health
```

### System Metrics
```http
GET /metrics
```

## 🛠️ Development

### Adding a New Platform

1. Create platform agent in `backend/agents/{platform}/`:
```python
class PlatformAgent:
    def create_post(self, content_package: DailyContentPackage) -> PostingResult:
        # Implementation
        pass
```

2. Register in `orchestrator_agent_v2.py`:
```python
self.channel_agents = {
    Platform.NEWPLATFORM: NewPlatformAgent(),
    # ...
}
```

3. Add platform to models:
```python
class Platform(str, Enum):
    NEWPLATFORM = "NewPlatform"
```

### Custom Content Pillars

Edit `strategy_agent_v2.py`:
```python
content_pillars = [
    ContentPillar.CUSTOM_PILLAR_1,
    ContentPillar.CUSTOM_PILLAR_2,
    # ...
]
```

## 📝 License

[Your License Here]

## 🤝 Contributing

[Contributing Guidelines]

## 📞 Support

[Support Information]

---

## 🎉 Success Metrics

When fully operational, the system will:
- Generate 90 posts per month (30 days × 3 platforms)
- Maintain 99.9% posting reliability
- Achieve < 1% duplicate content rate
- Process daily orchestration in < 60 seconds
- Store 90 days of historical data

## 🚦 Status Codes

- ✅ **200**: Success
- ⚠️ **400**: Bad Request
- 🔒 **401**: Unauthorized
- 🚫 **404**: Not Found
- ❌ **500**: Internal Server Error
- 🔧 **501**: Not Implemented

## 📈 Roadmap

- [ ] Instagram integration
- [ ] TikTok integration
- [ ] AI-powered image generation
- [ ] Advanced sentiment analysis
- [ ] Competitor tracking
- [ ] A/B testing framework
- [ ] Real-time performance dashboard
- [ ] Multi-language support expansion
- [ ] Webhook notifications
- [ ] Backup and restore functionality

---

**Version**: 2.0.0
**Last Updated**: 2024
**Maintained By**: Social CM Orchestrator Team
