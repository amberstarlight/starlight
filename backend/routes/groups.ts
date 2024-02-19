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
  router.post("/", async (req: Request, res: Response) => {
    const groupName = req.body.name;
    const groupExists = await zigbee2mqttService.getGroupId(groupName);

    if (groupExists) {
      return res.status(400).json({
        error: "Group already exists.",
      });
    }

    zigbee2mqttService.addGroup(groupName).then((data) => {
      if (data.status === "error") {
        return res.status(503).json({
          error: data.error,
        });
      } else {
        return res.status(200).json({
          data: data.data,
        });
      }
    });
  });

  // delete a group
  router.delete("/", async (req: Request, res: Response) => {
    const groupId = req.body.id;

    zigbee2mqttService
      .getGroup(parseInt(groupId))
      .then((group) => {
        if (group === undefined) throw new Error("Group does not exist.");

        zigbee2mqttService.deleteGroup(groupId, true);

        res.status(200).json({
          message: `Successfully deleted group '${group.group.friendly_name}'.`,
        });
      })
      .catch((err) => {
        res.status(404).json({
          error: err.message,
        });
      });
  });

  // get data about an existing group
  router.get("/:groupId", async (req: Request, res: Response) => {
    const groupId = req.params.groupId;

    zigbee2mqttService
      .getGroup(parseInt(groupId))
      .then((group) => {
        if (group === undefined) throw new Error("Group does not exist.");
        res.status(200).json({
          data: group,
        });
      })
      .catch((err) => {
        res.status(404).json({
          error: err.message,
        });
      });
  });

  // update an existing group's name
  router.put("/:groupId", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    if (group === undefined) {
      return res.status(404).json({ error: "Group not found." });
    }

    if (group.group.friendly_name === req.body.name) {
      return res.status(400).json({
        error: "Rename request must be different to the group's current name.",
      });
    }

    // group.rename(req.body.name).then(data => console.log(data));

    res.status(200).json({
      data: "",
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

  // get an existing group's state
  router.get("/:groupId/state", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    if (group === undefined) {
      return res.status(404).json({ error: "Group not found." });
    }

    const state = await group.getValue(req.query.setting?.toString());

    res.status(200).json({
      data: state,
    });
  });

  // update an existing group's state
  router.post("/:groupId/state", async (req: Request, res: Response) => {
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

  return router;
}
