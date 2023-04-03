import { name } from "./package.json";

interface LogEvent {
  timestamp: string;
  service: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  message: {
    logName: string;
    logMessage: string;
    logStack?: string;
  };
}

function logger(
  logLevel: "debug" | "info" | "warn" | "error" | "fatal",
  logName: string,
  logMessage: string,
  logStack?: string
): void {
  const wrappedLog: LogEvent = {
    timestamp: new Date().toISOString(),
    service: name,
    level: logLevel,
    message: {
      logName,
      logMessage,
      logStack,
    },
  };

  console.log(JSON.stringify(wrappedLog));
}

export { logger };
