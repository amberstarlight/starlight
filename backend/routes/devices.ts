// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Request, Response } from "express";
import { devices, getDeviceById } from "../mqtt_service";

const router = express.Router();

router.get("/devices", (_req: Request, res: Response) => {
  res.json({
    status: 200,
    devices: devices,
  });
});

router.get("/devices/:deviceId", (req: Request, res: Response) => {
  let response = getDeviceById(req.params.deviceId);

  if (response instanceof Error) {
    res.status(404).json({ error: response.message });
  } else {
    res.status(200).json(response);
  }
});

router.post("/devices/:deviceId", (req: Request, res: Response) => {
  // deal with the request
  res.json({
    status: 200,
    device: req.params.deviceId,
    // will return the result
  });
});

export { router as deviceRoutes };
