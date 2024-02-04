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
    const group = await zigbee2mqttService.getGroup(req.params.name);

    if (group === undefined) {
      return res.status(404).json({ error: "Group not found." });
    }

    res.status(200).json(group);
  });

  return router;
}
