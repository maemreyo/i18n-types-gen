'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// Implement the ConsoleTransport which logs to the console
class ConsoleTransport {
  log(level, messages, context) {
    const contextString = context
      ? ` | Context: ${JSON.stringify(context)}`
      : '';
    const logMessage = `[${level.toUpperCase()}]: ${messages.join(' ')}${contextString}`;
    switch (level) {
      case 'info':
        console.info(`ℹ️`, logMessage);
        break;
      case 'warn':
        console.warn(`⚠️`, logMessage);
        break;
      case 'error':
        console.error(`❌`, logMessage);
        break;
    }
  }
}
// Logger class definition
class Logger {
  // Use strong typing for constructor parameters and default values
  constructor(
    logLevel = process.env.LOG_LEVEL || 'info',
    transports = [new ConsoleTransport()],
  ) {
    this.logLevel = logLevel;
    this.transports = transports;
  }
  // Ensure Logger is a singleton
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  // Method to set log level with strong typing
  setLogLevel(level) {
    this.logLevel = level;
  }
  // Method to add a new transport with strong typing
  addTransport(transport) {
    this.transports.push(transport);
  }
  // Methods to log messages with various levels, supporting multiple arguments
  async info(...messages) {
    await this.log('info', messages);
  }
  async warn(...messages) {
    await this.log('warn', messages);
  }
  async error(...messages) {
    await this.log('error', messages);
  }
  // Private method to check if a message should be logged based on the current log level
  shouldLog(level) {
    const levels = {
      info: 0,
      warn: 1,
      error: 2,
    };
    return levels[level] >= levels[this.logLevel];
  }
  // Private method to log messages, ensuring strong typing throughout
  async log(level, messages, context) {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const finalMessages = [timestamp, ...messages];
      for (const transport of this.transports) {
        await transport.log(level, finalMessages, context);
      }
    }
  }
}
// Export the singleton logger instance
const logger = Logger.getInstance();
exports.default = logger;
