"""
Centralized logging configuration for the Social CM Orchestrator Suite
"""

import logging
import sys
import os
from datetime import datetime
from pathlib import Path
import json
from typing import Any, Dict, Optional

# Create logs directory if it doesn't exist
# Check if running in Docker or if volumes directory exists
if os.environ.get('LOGS_PATH'):
    LOGS_DIR = Path(os.environ['LOGS_PATH'])
elif Path("volumes/logs").exists():
    LOGS_DIR = Path("volumes/logs")
else:
    LOGS_DIR = Path(__file__).parent.parent / "logs"

LOGS_DIR.mkdir(parents=True, exist_ok=True)

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging in files only"""

    def format(self, record):
        log_obj = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "message": record.getMessage(),
        }

        # Add extra fields if present
        if hasattr(record, 'extra_data'):
            log_obj['data'] = record.extra_data

        # Add exception info if present
        if record.exc_info:
            log_obj['exception'] = self.formatException(record.exc_info)

        return json.dumps(log_obj)

class SilentConsoleHandler(logging.Handler):
    """A handler that doesn't output anything to console - we use print statements with emojis instead"""
    def emit(self, record):
        pass  # Don't output anything to console

def setup_logger(
    name: str,
    level: str = "INFO",
    log_to_file: bool = True,
    log_to_console: bool = False  # Default to False to avoid duplicate console output
) -> logging.Logger:
    """
    Set up a logger that logs to files only (console uses print statements with emojis)

    Args:
        name: Logger name (usually __name__)
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Whether to log to file
        log_to_console: Whether to log to console (default False to avoid duplicates)

    Returns:
        Configured logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))

    # Remove existing handlers to avoid duplicates
    logger.handlers = []

    # Add silent console handler to prevent propagation
    if not log_to_console:
        logger.addHandler(SilentConsoleHandler())

    # File handler with JSON format
    if log_to_file:
        # Create separate log files for different components
        log_file = LOGS_DIR / f"{name.replace('.', '_')}_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)

        # JSON formatter for file
        json_formatter = JSONFormatter()
        file_handler.setFormatter(json_formatter)
        logger.addHandler(file_handler)

        # Also create a combined log file
        combined_log = LOGS_DIR / f"orchestrator_suite_{datetime.now().strftime('%Y%m%d')}.log"
        combined_handler = logging.FileHandler(combined_log, encoding='utf-8')
        combined_handler.setLevel(logging.INFO)
        combined_handler.setFormatter(json_formatter)
        logger.addHandler(combined_handler)

    # Prevent propagation to root logger
    logger.propagate = False

    return logger

def log_with_context(logger: logging.Logger, level: str, message: str, **context):
    """
    Log a message with additional context data (to file only)

    Args:
        logger: Logger instance
        level: Log level
        message: Log message
        **context: Additional context data
    """
    extra = {'extra_data': context} if context else {}
    log_method = getattr(logger, level.lower())
    log_method(message, extra=extra)

# Create a default logger for the package
default_logger = setup_logger("orchestrator_suite", "INFO")

def log_function_entry(logger: logging.Logger):
    """Decorator to log function entry and exit (to file only)"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger.debug(f"Entering {func.__name__}")
            try:
                result = func(*args, **kwargs)
                logger.debug(f"Exiting {func.__name__} successfully")
                return result
            except Exception as e:
                logger.error(f"Error in {func.__name__}: {str(e)}", exc_info=True)
                raise
        return wrapper
    return decorator

def log_api_request(logger: logging.Logger):
    """Decorator to log API requests (to file only)"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            request_id = datetime.now().strftime("%Y%m%d%H%M%S%f")
            logger.info(f"API Request [{request_id}] - {func.__name__}")
            try:
                result = await func(*args, **kwargs)
                logger.info(f"API Response [{request_id}] - Success")
                return result
            except Exception as e:
                logger.error(f"API Error [{request_id}] - {str(e)}", exc_info=True)
                raise
        return wrapper
    return decorator

# Utility function for performance logging
class PerformanceLogger:
    """Context manager for logging performance metrics (to file only)"""

    def __init__(self, logger: logging.Logger, operation: str):
        self.logger = logger
        self.operation = operation
        self.start_time = None

    def __enter__(self):
        self.start_time = datetime.now()
        self.logger.debug(f"Starting operation: {self.operation}")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = (datetime.now() - self.start_time).total_seconds()
        if exc_type:
            self.logger.error(f"Operation failed: {self.operation} (duration: {duration:.2f}s)", exc_info=True)
        else:
            self.logger.info(f"Operation completed: {self.operation} (duration: {duration:.2f}s)")
