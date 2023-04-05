// SPDX-License-Identifier: GPL-3.0-or-later

import "dotenv/config";
import express, { Express } from "express";
import { IClientOptions } from "mqtt";

import { rootRoutes } from "./routes/root";
import { deviceRoutes } from "./routes/devices";
import { groupRoutes } from "./routes/groups";

import { logger } from "./logger";
import { init } from "./mqtt_service";

const app: Express = express();
const port: string | undefined = process.env.PORT;
const logLevel = "info";

const mqttEndpoint: string =
  `mqtt://${process.env.MQTT_ENDPOINT_HOSTNAME}` || "mqtt://localhost";

const mqttOptions: IClientOptions = {
  reconnectPeriod: 1000,
  clientId: `zigbee-backend-${Math.random().toString(16).substring(2, 8)}`,
};

app.use(rootRoutes);
app.use(deviceRoutes);
app.use(groupRoutes);

init(mqttEndpoint, mqttOptions).then(
  () => {
    logger(logLevel, "MQTT", `Connection established with ${mqttEndpoint}`);

    app.listen(port, () => {
      logger(logLevel, "Express", `Server listening on ${port}.`);
    });
  },
  (error) => {
    logger(logLevel, error.name, error.message, error.stack);
  }
);
