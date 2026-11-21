export interface LogEntry {
  timestamp: string;
  level: "INFO" | "ERROR" | "WARN" | "DEBUG";
  message: string;
  data?: Record<string, any>;
}

class Logger {
  private log(entry: LogEntry): void {
    // Output JSON to stdout
    console.log(JSON.stringify(entry));
  }

  info(message: string, data?: Record<string, any>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message,
      data,
    });
  }

  error(message: string, data?: Record<string, any>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message,
      data,
    });
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "WARN",
      message,
      data,
    });
  }

  debug(message: string, data?: Record<string, any>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "DEBUG",
      message,
      data,
    });
  }

  payment(
    message: string,
    paymentId: string,
    userId: number,
    data?: Record<string, any>,
  ): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message,
      data: {
        ...data,
        paymentId,
        userId,
      },
    });
  }

  user(message: string, userId: number, data?: Record<string, any>): void {
    this.log({
      timestamp: new Date().toISOString(),
      level: "INFO",
      message,
      data: {
        ...data,
        userId,
      },
    });
  }
}

export const logger = new Logger();
