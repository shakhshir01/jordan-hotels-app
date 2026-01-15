/**
 * Monitoring and Logging Service
 * Tracks errors, performance metrics, and user analytics
 */

/**
 * Log Levels
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4,
};

/**
 * Logger Service
 */
class Logger {
  constructor(options = {}) {
    this.minLevel = options.minLevel || LogLevel.INFO;
    // `logToConsole` can be either a boolean flag or a custom function.
    this.consoleEnabled = options.logToConsole !== false;
    this.logToConsole = typeof options.logToConsole === 'function' ? options.logToConsole : undefined;
    this.logToServer = options.logToServer !== false;
    this.serverUrl = options.serverUrl || '/api/logs';
    this.appName = options.appName || 'VisitJo';
    this.userId = options.userId || null;
    this.sessionId = this.generateSessionId();
    this.logs = [];
    this.maxLogsBeforeSend = options.maxLogsBeforeSend || 10;
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log message
   */
  log(level, message, metadata = {}) {
    if (level < this.minLevel) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: this.getLevelName(level),
      message,
      metadata,
      sessionId: this.sessionId,
      userId: this.userId,
      url: typeof window !== 'undefined' ? window.location.href : null,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    };

    // Log to console in development
    if (this.consoleEnabled) {
      if (typeof this.logToConsole === 'function') {
        this.logToConsole(level, message, metadata);
      } else {
        // default console logging
        const style = this.getConsoleStyle(level);
        const logFn = this.getConsoleFunction(level);
        logFn(`[%c${this.appName}] ${this.getLevelName(level)}`, style, message, metadata);
      }
    }

    // Store log entry
    this.logs.push(logEntry);

    // Send to server if batch limit reached
    if (this.logs.length >= this.maxLogsBeforeSend) {
      this.sendLogsToServer();
    }
  }

  /**
   * Get log level name
   */
  getLevelName(level) {
    for (const [name, value] of Object.entries(LogLevel)) {
      if (value === level) return name;
    }
    return 'UNKNOWN';
  }

  /**
   * Log to console helper
   */
  logToConsole(level, message, metadata) {
    const style = this.getConsoleStyle(level);
    const logFn = this.getConsoleFunction(level);

    logFn(
      `%c[${this.appName}] ${this.getLevelName(level)}`,
      style,
      message,
      metadata
    );
  }

  /**
   * Get console style based on level
   */
  getConsoleStyle(level) {
    const styles = {
      [LogLevel.DEBUG]: 'color: #888; font-size: 12px;',
      [LogLevel.INFO]: 'color: #0066cc; font-size: 12px;',
      [LogLevel.WARN]: 'color: #ff9900; font-size: 12px;',
      [LogLevel.ERROR]: 'color: #cc0000; font-size: 12px;',
      [LogLevel.CRITICAL]: 'color: #cc0000; font-weight: bold; font-size: 14px;',
    };
    return styles[level] || '';
  }

  /**
   * Get appropriate console function
   */
  getConsoleFunction(level) {
    if (level === LogLevel.WARN) return console.warn;
    if (level >= LogLevel.ERROR) return console.error;
    if (level === LogLevel.DEBUG) return console.debug;
    return console.log;
  }

  /**
   * Send logs to server
   */
  async sendLogsToServer() {
    if (!this.logToServer || this.logs.length === 0) return;

    let logsToSend = [];

    try {
      logsToSend = [...this.logs];
      this.logs = [];

      await fetch(this.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          app: this.appName,
        }),
      });
    } catch (error) {
      console.error('Failed to send logs to server:', error);
      // Re-add logs if sending failed
      this.logs = this.logs.concat(logsToSend);
    }
  }

  /**
   * Convenience methods
   */
  debug(message, metadata) {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  info(message, metadata) {
    this.log(LogLevel.INFO, message, metadata);
  }

  warn(message, metadata) {
    this.log(LogLevel.WARN, message, metadata);
  }

  error(message, metadata) {
    this.log(LogLevel.ERROR, message, metadata);
  }

  critical(message, metadata) {
    this.log(LogLevel.CRITICAL, message, metadata);
  }

  /**
   * Flush all remaining logs
   */
  async flush() {
    await this.sendLogsToServer();
  }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
  constructor(logger) {
    this.logger = logger;
    this.marks = new Map();
    this.measurements = [];
  }

  /**
   * Start measuring performance
   */
  startMeasure(name) {
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring performance and log
   */
  endMeasure(name) {
    const startTime = this.marks.get(name);
    if (!startTime) {
      this.logger.warn(`Measure '${name}' was never started`);
      return;
    }

    const duration = performance.now() - startTime;
    const measurement = { name, duration, timestamp: new Date().toISOString() };

    this.measurements.push(measurement);
    this.marks.delete(name);

    // Log slow operations
    if (duration > 1000) {
      this.logger.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, {
        duration,
      });
    }

    return duration;
  }

  /**
   * Get average duration for operation
   */
  getAverageDuration(name) {
    const filtered = this.measurements.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }

  /**
   * Get all measurements
   */
  getAllMeasurements() {
    return [...this.measurements];
  }

  /**
   * Clear measurements
   */
  clearMeasurements() {
    this.measurements = [];
  }
}

/**
 * Error Handler
 */
class ErrorHandler {
  constructor(logger) {
    this.logger = logger;
    this.errorHandlers = new Map();
  }

  /**
   * Register error handler
   */
  registerHandler(errorType, handler) {
    this.errorHandlers.set(errorType, handler);
  }

  /**
   * Handle error
   */
  handleError(error, context = {}) {
    const errorType = error.constructor.name;
    const handler = this.errorHandlers.get(errorType);

    this.logger.error(`Error: ${error.message}`, {
      errorType,
      stack: error.stack,
      context,
    });

    if (handler) {
      return handler(error, context);
    }

    // Default error handling
    return {
      message: 'An unexpected error occurred',
      logged: true,
    };
  }

  /**
   * Handle fetch errors
   */
  handleFetchError(error, context = {}) {
    this.logger.error(`Fetch error: ${error.message}`, {
      ...context,
      status: error.status,
    });
  }

  /**
   * Handle validation errors
   */
  handleValidationError(error, context = {}) {
    this.logger.warn(`Validation error: ${error.message}`, {
      ...context,
      fields: error.fields,
    });
  }
}

/**
 * Global Logger Instance
 */
export const logger = new Logger({
  minLevel: LogLevel.DEBUG,
  logToConsole: true,
  logToServer: true,
  appName: 'VisitJo',
});

/**
 * Global Performance Monitor Instance
 */
export const performanceMonitor = new PerformanceMonitor(logger);

/**
 * Global Error Handler Instance
 */
export const errorHandler = new ErrorHandler(logger);

/**
 * Setup error listeners
 */
export const setupErrorListeners = () => {
  // Global error handler
  window.addEventListener('error', (event) => {
    // Handle chunk load errors (lazy loading failures after deployment)
    const msg = event.message || '';
    if (/Loading chunk [\d]+ failed/.test(msg) || /Failed to fetch dynamically imported module/.test(msg)) {
      const key = 'chunk_load_error_reload';
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();

      // Reload once every 10 seconds max to prevent infinite loops
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(key, now.toString());
        window.location.reload();
        return;
      }
    }

    errorHandler.handleError(event.error, {
      message: 'Uncaught error',
      filename: event.filename,
      lineno: event.lineno,
    });
  });

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(event.reason, {
      message: 'Unhandled promise rejection',
    });
  });
};

export { Logger, PerformanceMonitor, ErrorHandler, LogLevel };

export default {
  logger,
  performanceMonitor,
  errorHandler,
  setupErrorListeners,
  Logger,
  PerformanceMonitor,
  ErrorHandler,
  LogLevel,
};
