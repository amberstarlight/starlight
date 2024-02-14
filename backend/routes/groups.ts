// SPDX-License-Identifier: AGPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";

const router = express.Router();

export function groupsRouter(zigbee2mqttService: Zigbee2MqttService): Router {
  // get data about all existing groups
  router.get("/", async (_req: Request, res: Response) => {
    const groups = await zigbee2mqttService.getGroups();

    res.status(200).json({
      data: groups,
    });
  });

  // create a group
  router.post("/", (req: Request, res: Response) => {
    const groupName = req.body.name;
    zigbee2mqttService.addGroup(groupName);

    res.status(202).json({
      data: groupName,
    });
  });

  // delete a group
  router.delete("/", async (req: Request, res: Response) => {
    const groupName = req.body.name;
    zigbee2mqttService.deleteGroup(groupName, true);

    res.status(200).json({
      message: `Successfully deleted group '${groupName}'.`,
    });
  });

  // get data about an existing group
  router.get("/:groupId", async (req: Request, res: Response) => {
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

  // update an existing group's state
  router.post("/:groupId", async (req: Request, res: Response) => {
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

  // add a device to an existing group
  router.post("/:groupId/add", async (req: Request, res: Response) => {
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

  // remove a device from an existing group
  router.post("/:groupId/remove", async (req: Request, res: Response) => {
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
  });

  return router;
}