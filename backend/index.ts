// SPDX-License-Identifier: GPL-3.0-or-later

import "dotenv/config";
import express, { Express } from "express";
import { IClientOptions } from "mqtt";

import rootRouter from "./routes/root";
import devicesRouter from "./routes/devices";

import { logger } from "./logger";
import { Zigbee2MqttService } from "./zigbee2mqttService";

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
  clientId: `zigbee-backend-${Math.random().toString(16).substring(2, 8)}`,
  connectTimeout: 10000,
};

const mqttService = new Zigbee2MqttService(mqttEndpoint, mqttOptions);

app.use(rootRouter(mqttService));
app.use(devicesRouter(mqttService));

app.listen(port, () => {
  logger(logLevel, "Express", `Server listening on ${port}.`);
});
