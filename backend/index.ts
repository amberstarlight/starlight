// SPDX-License-Identifier: GPL-3.0-or-later

import "dotenv/config";
import express, { Express, Request, Response } from "express";
import mqtt from "mqtt";

import { deviceRoutes } from "./routes/devices";
import { groupRoutes } from "./routes/groups";

const app: Express = express();
const port = process.env.PORT;
const mqttEndpoint =
  `mqtt://${process.env.MQTT_ENDPOINT_HOSTNAME}` || "mqtt://localhost";
const mqttOptions = {
  reconnectPeriod: 1000,
  clientId: `zigbee-backend-${Math.random().toString(16).substring(2, 8)}`,
};

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: 200,
    message: "OK",
  });
});

app.use(deviceRoutes);
app.use(groupRoutes);

try {
  let client = mqtt.connect(mqttEndpoint, mqttOptions);

  client.on("connect", () => {
    console.log(`⚡️[mqtt]: MQTT connection established with ${mqttEndpoint}`);
  });
} catch (error) {
  console.error(error);
}

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
