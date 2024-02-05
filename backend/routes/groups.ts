// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";

const router = express.Router();

export default function groupsRouter(
  zigbee2mqttService: Zigbee2MqttService,
): Router {
  router.get("/groups", async (_req: Request, res: Response) => {
    const groups = await zigbee2mqttService.getGroups();

    res.json({
      status: 200,
      groups: groups,
    });
  });

  router.get("/groups/:groupName", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(req.params.groupName);

    if (group === undefined) {
      return res.status(404).json({ error: "Group not found." });
    }

    res.status(200).json(group);
  });

  router.post("/groups/:groupName", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(req.params.groupName);

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

    return res.json({
      status: 200,
      group: req.params.groupName,
    });
  });

  router.post("/groups/:groupName/add", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(req.params.groupName);

    if (group === undefined) {
      return res.status(404).json({ error: "Group not found." });
    }
  });

  return router;
}
