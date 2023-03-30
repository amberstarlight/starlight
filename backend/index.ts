// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Express, Request, Response } from "express";
import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const mqttEndpoint = process.env.MQTT_ENDPOINT || "mqtt://localhost:1884";
const mqttOptions = {
  reconnectPeriod: 10000,
};

app.get("/", (req: Request, res: Response) => {
  res.json({
    status: 200,
    message: "OK",
  });
});

app.get("/devices", (req: Request, res: Response) => {
  res.json({
    status: 200,
    devices: "", // will a list of all devices, without specific state information
  });
});

app.get("/devices/:deviceId", (req: Request, res: Response) => {
  res.json({
    status: 200,
    device: req.params.deviceId,
    // will return a device's full info
  });
});

const client = mqtt.connect(mqttEndpoint, mqttOptions);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
