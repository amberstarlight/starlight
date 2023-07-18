// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Request, Response } from "express";
import { devices, getDeviceById, setDeviceSetting } from "../mqtt_service";

const router = express.Router();

router.get("/devices", (_req: Request, res: Response) => {
  res.json({
    status: 200,
    devices: devices,
  });
});

router.get("/devices/:deviceId", (req: Request, res: Response) => {
  const device = getDeviceById(req.params.deviceId);

  if (device === undefined) {
    return res.status(404).json({ error: "Device not found." });
  }

  res.status(200).json(device);
});

router.post("/devices/:deviceId", (req: Request, res: Response) => {
  if (typeof req.query.setting !== "string") {
    return res.status(400).json({
      error: "Settings must be provided as strings.",
    });
  }

  if (!req.query.value || req.query.value === undefined) {
    return res.status(400).json({
      error: "Value was not provided.",
    });
  }

  if (typeof req.query.value !== "string") {
    return res.status(400).json({
      error: "Values must be provided as strings.",
    });
  }

  setDeviceSetting(req.params.deviceId, req.query.setting, req.query.value);

  return res.json({
    status: 200,
    device: req.params.deviceId,
  });

  // TODO: get device setting to check update was successful, then return the
  // updated values to client
});

export { router as deviceRoutes };
