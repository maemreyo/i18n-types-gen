// Define log levels as a type alias with a union of string literals
type LogLevel = 'info' | 'warn' | 'error';

// Define a type alias for an array of messages, which can be any type
type LogMessage = unknown[];

// Define a type alias for the context, which can be an object with string keys and any values
type LogContext = Record<string, unknown>;

// Define the interface for the log transport mechanism
interface LogTransport {
  log(level: LogLevel, messages: LogMessage, context?: LogContext): void;
}

// Implement the ConsoleTransport which logs to the console
class ConsoleTransport implements LogTransport {
  log(level: LogLevel, messages: LogMessage, context?: LogContext): void {
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
  private static instance: Logger;
  private logLevel: LogLevel;
  private transports: LogTransport[];

  // Use strong typing for constructor parameters and default values
  private constructor(
    logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info',
    transports: LogTransport[] = [new ConsoleTransport()],
  ) {
    this.logLevel = logLevel;
    this.transports = transports;
  }

  // Ensure Logger is a singleton
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // Method to set log level with strong typing
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // Method to add a new transport with strong typing
  public addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  // Methods to log messages with various levels, supporting multiple arguments
  public async info(...messages: LogMessage): Promise<void> {
    await this.log('info', messages);
  }

  public async warn(...messages: LogMessage): Promise<void> {
    await this.log('warn', messages);
  }

  public async error(...messages: LogMessage): Promise<void> {
    await this.log('error', messages);
  }

  // Private method to check if a message should be logged based on the current log level
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      info: 0,
      warn: 1,
      error: 2,
    };
    return levels[level] >= levels[this.logLevel];
  }

  // Private method to log messages, ensuring strong typing throughout
  private async log(
    level: LogLevel,
    messages: LogMessage,
    context?: LogContext,
  ): Promise<void> {
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
export default logger;
