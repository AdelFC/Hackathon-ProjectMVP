# Logging Guide for Social CM Orchestrator Suite

## Overview

The Social CM Orchestrator Suite now includes comprehensive logging throughout the backend to track what happens at each step of the execution process. This guide explains how the logging system works and how to use it effectively.

## Logging Configuration

### Logger Setup

The logging system is configured in `agents/logger_config.py` and provides:

1. **Dual Output**: Logs are written to both console (for real-time monitoring) and files (for persistence)
2. **Structured Logging**: JSON format for file logs, making them easy to parse and analyze
3. **Context-Rich Logging**: Additional metadata can be attached to log entries
4. **Performance Tracking**: Built-in performance logging for measuring operation durations

### Log Levels

- **DEBUG**: Detailed information for debugging (function entry/exit, variable values)
- **INFO**: General informational messages (successful operations, state changes)
- **WARNING**: Warning messages (skipped operations, non-critical issues)
- **ERROR**: Error messages with stack traces (failures, exceptions)
- **CRITICAL**: Critical failures that may cause system shutdown

## Log Files Location

All log files are stored in the `backend/logs/` directory:

```
backend/logs/
├── orchestrator_suite_YYYYMMDD.log     # Combined log for all components
├── agents_orchestrator_agent_v2_YYYYMMDD.log  # Orchestrator-specific logs
├── api_main_YYYYMMDD.log              # API endpoint logs
└── agents_strategy_agent_v2_YYYYMMDD.log     # Strategy agent logs
```

## Key Logging Points

### 1. Orchestrator Agent (`agents/orchestrator_agent_v2.py`)

The orchestrator logs at these key points:

```python
# Initialization
logger.info("Initializing OrchestratorAgentV2")

# Daily Execution Start
logger.info(f"Starting daily execution for {brand_name} on {execution_date}")

# Signal Gathering
logger.info(f"Gathering signals for brand: {brand_name}")

# Post Processing
logger.info(f"Processing post {posts_attempted}/{len(daily_posts)} for {post.platform.value}")

# Channel Dispatch
logger.info(f"Dispatching content to {package.platform.value}")

# Success/Failure
logger.info(f"Successfully posted to {post.platform.value}")
logger.error(f"Failed to post to {post.platform.value}: {result.error}")

# Execution Summary
logger.info(f"Execution completed - Attempted: {posts_attempted}, Succeeded: {posts_succeeded}, Failed: {posts_failed}")
```

### 2. API Endpoints (`main_v2.py`)

API endpoints log:

```python
# Request received
logger.info(f"Strategy generation requested for brand: {request.brand_name}")

# Operation success
logger.info(f"Strategy generated successfully for {request.brand_name}")

# Operation failure
logger.error(f"Failed to generate strategy for {request.brand_name}: {str(e)}", exc_info=True)
```

### 3. Performance Logging

Performance is tracked using context managers:

```python
with PerformanceLogger(logger, "Fetching active monthly plan"):
    plan = self.storage.get_active_plan(brand_name)
# Automatically logs: "Operation completed: Fetching active monthly plan (duration: X.XXs)"
```

## Viewing Logs

### Real-time Console Output

When running the application, you'll see formatted console output:

```
2024-01-15 10:30:45 | INFO     | agents.orchestrator_agent_v2.execute_daily:375 | Starting daily execution for TestBrand on 2024-01-15
2024-01-15 10:30:45 | DEBUG    | agents.orchestrator_agent_v2.gather_signals:132 | Yesterday's performance retrieved: {'date': '2024-01-14', ...}
2024-01-15 10:30:46 | INFO     | agents.orchestrator_agent_v2.dispatch_to_channel:256 | Dispatching content to LinkedIn
```

### JSON Log Files

Log files contain structured JSON for easy parsing:

```json
{
  "timestamp": "2024-01-15T10:30:45.123456",
  "level": "INFO",
  "logger": "agents.orchestrator_agent_v2",
  "module": "orchestrator_agent_v2",
  "function": "execute_daily",
  "line": 375,
  "message": "Starting daily execution for TestBrand on 2024-01-15",
  "data": {
    "brand": "TestBrand",
    "date": "2024-01-15",
    "force": false,
    "dry_run": true,
    "platforms": ["LinkedIn", "Facebook", "Twitter"]
  }
}
```

## Analyzing Logs

### Finding Errors

To find all errors in today's logs:

```bash
grep '"level": "ERROR"' backend/logs/orchestrator_suite_$(date +%Y%m%d).log
```

### Tracking a Specific Execution

To follow a specific execution flow:

```bash
grep "2024-01-15" backend/logs/orchestrator_suite_20240115.log | grep "TestBrand"
```

### Performance Analysis

To analyze performance metrics:

```bash
grep "Operation completed" backend/logs/orchestrator_suite_$(date +%Y%m%d).log | grep "duration"
```

## Custom Logging in Your Code

### Adding Logging to New Components

```python
from agents.logger_config import setup_logger, log_with_context, PerformanceLogger

# Initialize logger for your module
logger = setup_logger(__name__, "INFO")

def your_function():
    logger.info("Starting operation")

    # Log with additional context
    log_with_context(logger, "info", "Processing item",
                    item_id="123",
                    status="pending")

    # Track performance
    with PerformanceLogger(logger, "Database query"):
        result = perform_database_query()

    logger.debug(f"Query returned {len(result)} results")
```

### Best Practices

1. **Use appropriate log levels**: DEBUG for detailed info, INFO for normal flow, ERROR for exceptions
2. **Include context**: Always include relevant IDs, dates, and status information
3. **Log at boundaries**: Log when entering/exiting major operations
4. **Avoid sensitive data**: Never log passwords, API keys, or personal information
5. **Use structured logging**: Pass data as context rather than formatting into strings

## Troubleshooting Common Issues

### Issue: Logs not appearing

**Solution**: Check that the `backend/logs/` directory exists and has write permissions:

```bash
mkdir -p backend/logs
chmod 755 backend/logs
```

### Issue: Too many DEBUG logs

**Solution**: Adjust the log level in the component initialization:

```python
logger = setup_logger(__name__, "INFO")  # Change from "DEBUG" to "INFO"
```

### Issue: Log files getting too large

**Solution**: Implement log rotation (add to `logger_config.py`):

```python
from logging.handlers import RotatingFileHandler

file_handler = RotatingFileHandler(
    log_file,
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)
```

## Monitoring Dashboard

You can create a simple monitoring dashboard by tailing the logs:

```bash
# Watch all logs in real-time
tail -f backend/logs/orchestrator_suite_$(date +%Y%m%d).log | jq '.'

# Watch only errors
tail -f backend/logs/orchestrator_suite_$(date +%Y%m%d).log | grep ERROR

# Watch specific platform
tail -f backend/logs/orchestrator_suite_$(date +%Y%m%d).log | grep LinkedIn
```

## Log Analysis Scripts

### Daily Summary Script

Create `backend/scripts/daily_log_summary.sh`:

```bash
#!/bin/bash
LOG_FILE="backend/logs/orchestrator_suite_$(date +%Y%m%d).log"

echo "=== Daily Log Summary ==="
echo "Date: $(date +%Y-%m-%d)"
echo ""

echo "Total Operations:"
grep -c '"level": "INFO"' $LOG_FILE

echo "Errors:"
grep -c '"level": "ERROR"' $LOG_FILE

echo "Posts Attempted:"
grep -c "Processing post" $LOG_FILE

echo "Posts Succeeded:"
grep -c "Successfully posted to" $LOG_FILE

echo "Posts Failed:"
grep -c "Failed to post to" $LOG_FILE

echo ""
echo "Performance Metrics:"
grep "Operation completed" $LOG_FILE | grep -o "duration: [0-9.]*s" | sort -n
```

## Integration with Monitoring Tools

The JSON log format makes it easy to integrate with monitoring tools:

- **ELK Stack**: Ship logs to Elasticsearch for analysis in Kibana
- **Datadog**: Use the Datadog agent to collect and analyze logs
- **CloudWatch**: If on AWS, stream logs to CloudWatch Logs
- **Grafana Loki**: Aggregate logs and create dashboards in Grafana

## Conclusion

The comprehensive logging system provides full visibility into the Social CM Orchestrator Suite's operations. Use the logs to:

1. Debug issues quickly
2. Monitor system health
3. Track performance metrics
4. Audit posting history
5. Analyze patterns and trends

For any questions or to report logging issues, please refer to the main documentation or create an issue in the repository.
