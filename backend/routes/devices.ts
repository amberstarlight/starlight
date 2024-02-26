// SPDX-License-Identifier: AGPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";
import { ApiError } from "./api";

const router = express.Router();

export function deviceRouter(zigbee2mqttService: Zigbee2MqttService): Router {
  // get data about all existing devices
  router.get("/", async (_req: Request, res: Response) => {
    const devices = await zigbee2mqttService.getDevices();
    res.json({
      status: 200,
      devices: devices,
    });
  });

  // get data about an existing device
  router.get("/:deviceId", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    res.status(200).json(device);
  });

  // rename an existing device
  router.put("/:deviceId", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);
    const newName = req.body.name;

    if (device === undefined) {
      return res.status(404).json({
        error: ApiError.DeviceNotFound,
      });
    }

    if (device.device.friendly_name === newName) {
      return res.status(400).json({
        error: ApiError.NameInUse,
      });
    }

    const response = await zigbee2mqttService.renameDevice(
      device.device.ieee_address,
      newName,
    );

    if (response.status === "error") {
      return res.status(503).json({
        error: response.error,
      });
    }

    return res.status(200).json({
      data: response.data,
    });
  });

  // delete a device from the network
  router.delete("/:deviceId", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    const response = await zigbee2mqttService.deleteDevice(
      device.device.ieee_address,
    );

    if (response.status === "error") {
      return res.status(503).json({
        error: response.error,
      });
    }

    return res.status(200).json({
      data: response.data,
    });
  });

  // get an existing device's state
  router.get("/:deviceId/state", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    const state = await device.getValue(req.query.setting?.toString());

    if (state === undefined) {
      return res.status(503).json({
        error: ApiError.StateDataMissing,
      });
    }

    res.status(200).json({
      data: state,
    });
  });

  // update an existing device's state
  router.post("/:deviceId/state", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (typeof req.body.setting !== "string") {
      return res.status(400).json({
        error: ApiError.SettingPropertyMalformed,
      });
    }

    if (!req.body.value || req.body.value === undefined) {
      return res.status(400).json({
        error: ApiError.ValueNotProvided,
      });
    }

    if (device === undefined)
      return res.status(404).json({
        error: ApiError.DeviceNotFound,
      });

    device.setValue(req.body.setting, req.body.value);

    return res.status(200).json({
      data: req.params.deviceId,
    });
  });

  return router;
}
