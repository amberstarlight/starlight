// SPDX-FileCopyrightText: © 2023 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

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
  logStack?: string,
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

  if (process.env.NODE_ENV != "production") {
    console.log(
      `[${wrappedLog.level}] ${wrappedLog.timestamp}: ${wrappedLog.message.logMessage}`,
    );
    if (wrappedLog.message.logStack) {
      console.log(
        `[${wrappedLog.level}] ${wrappedLog.timestamp}: ${wrappedLog.message.logStack}`,
      );
    }
  } else {
    console.log(JSON.stringify(wrappedLog));
  }
}

export { logger };
