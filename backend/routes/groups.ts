// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";

const router = express.Router();

export default function groupsRouter(
  zigbee2mqttService: Zigbee2MqttService,
): Router {
  router.get("/groups", async (_req: Request, res: Response) => {
    const groups = await zigbee2mqttService.getGroups();

    res.status(200).json({
      data: groups,
    });
  });

  router.get("/groups/:groupId", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    if (group === undefined) {
      return res.status(404).json({ error: "Group not found." });
    }

    res.status(200).json({
      data: group,
    });
  });

  router.post("/groups/:groupId", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    if (group === undefined) {
      return res.status(404).json({ error: "Group not found." });
    }

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

    group.setValue(req.body.setting, req.body.value);

    return res.status(200).json({
      data: req.params.groupId,
    });
  });

  router.post("/groups/:groupId/add", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );
    const device = await zigbee2mqttService.getDevice(req.body.device);

    if (group === undefined) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (device === undefined) {
      return res.status(404).json({ error: "Device not found." });
    }

    group.addDevice(device.device.friendly_name);

    return res.status(200).json({
      data: group,
    });
  });

  router.post(
    "/groups/:groupId/remove",
    async (req: Request, res: Response) => {
      const group = await zigbee2mqttService.getGroup(
        parseInt(req.params.groupId),
      );
      const device = await zigbee2mqttService.getDevice(req.body.device);

      if (group === undefined) {
        return res.status(404).json({ error: "Group not found." });
      }

      if (device === undefined) {
        return res.status(404).json({ error: "Device not found." });
      }

      group.removeDevice(device.device.friendly_name);

      return res.status(200).json({
        data: group,
      });
    },
  );

  return router;
}
