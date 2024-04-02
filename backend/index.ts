// SPDX-FileCopyrightText: © 2023 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import { IClientOptions } from "mqtt";

import { logger } from "./logger";
import { Zigbee2MqttService } from "./zigbee2mqttService";

import { apiRouter } from "./routes/api";
import { groupsRouter } from "./routes/groups";
import { deviceRouter } from "./routes/devices";
import { rootRouter } from "./routes/root";
import { settingRouter } from "./routes/settings";

const app: Express = express();
const port: string = process.env.PORT || "8080";
const logLevel = "info";

const mqttEndpoint: string = process.env.MQTT_ENDPOINT_HOSTNAME
  ? `mqtt://${process.env.MQTT_ENDPOINT_HOSTNAME}`
  : "mqtt://localhost";
const mqttPort: number = process.env.MQTT_ENDPOINT_PORT
  ? parseInt(process.env.MQTT_ENDPOINT_PORT)
  : 1883;

const mqttOptions: IClientOptions = {
  reconnectPeriod: 1000,
  port: mqttPort,
  clientId: `starlight-backend-${Math.random().toString(16).substring(2, 8)}`,
  connectTimeout: 10000,
};

const mqttService = new Zigbee2MqttService(mqttEndpoint, mqttOptions);

app.use(express.json());

const checkIfReady = function (
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!mqttService.ready) {
    return res.status(503).json({
      error: "Service unavailable.",
    });
  }

  next();
};

app.use(checkIfReady);
app.use(
  "/api",
  apiRouter({
    "/": rootRouter(mqttService),
    "/devices": deviceRouter(mqttService),
    "/groups": groupsRouter(mqttService),
    "/settings": settingRouter(mqttService),
  }),
);

app.listen(port, () => {
  logger(logLevel, "Express", `Server listening on ${port}.`);

  if (!mqttService.ready) {
    logger(
      logLevel,
      "MQTT",
      "Can't establish a connection to MQTT endpoint. Maybe the server is offline?",
    );
  }
});
