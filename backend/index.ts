// SPDX-License-Identifier: GPL-3.0-or-later

import "dotenv/config";
import express, { Express } from "express";
import { IClientOptions } from "mqtt";

import { rootRoutes } from "./routes/root";
import { deviceRoutes } from "./routes/devices";
import { groupRoutes } from "./routes/groups";

import { logger } from "./logger";
import { Zigbee2MqttService } from "./mqtt_service";

const app: Express = express();
const port: string | undefined = process.env.PORT;
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
};

const mqttService = new Zigbee2MqttService(mqttEndpoint, mqttOptions);

app.use(rootRoutes);
app.use(deviceRoutes);
app.use(groupRoutes);

app.listen(port, () => {
  logger(logLevel, "Express", `Server listening on ${port}.`);
});
