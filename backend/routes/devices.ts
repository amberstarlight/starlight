// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";

const router = express.Router();

export default function deviceRouter(
  zigbee2mqttService: Zigbee2MqttService,
): Router {
  router.get("/devices", async (_req: Request, res: Response) => {
    const devices = await zigbee2mqttService.getDevices();
    res.json({
      status: 200,
      devices: devices,
    });
  });

  router.get("/devices/:deviceId", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({ error: "Device not found." });
    }

    res.status(200).json(device);
  });

  router.post("/devices/:deviceId", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (typeof req.body.setting !== "string") {
      return res.status(400).json({
        error: "Settings must be provided as strings.",
      });
    }

    if (!req.body.value || req.body.value === undefined) {
      return res.status(400).json({
        error: "Value was not provided.",
      });
    }

    device.setValue(req.body.setting, req.body.value);

    return res.json({
      status: 200,
      device: req.params.deviceId,
    });
  });

  return router;
}
