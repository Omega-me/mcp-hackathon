/**
 * Simple logger utility
 * Provides consistent logging across the application
 */

type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private prefix: string;

  constructor(prefix: string = "") {
    this.prefix = prefix;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const prefixStr = this.prefix ? `[${this.prefix}] ` : "";
    return `${timestamp} [${level.toUpperCase()}] ${prefixStr}${message}`;
  }

  info(message: string, ...args: unknown[]): void {
    console.log(this.formatMessage("info", message), ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage("warn", message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage("error", message), ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (process.env.DEBUG === "true") {
      console.debug(this.formatMessage("debug", message), ...args);
    }
  }
}

export const createLogger = (prefix: string): Logger => {
  return new Logger(prefix);
};

export const logger = new Logger();
