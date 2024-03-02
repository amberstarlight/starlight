// SPDX-FileCopyrightText: © 2023 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";
import { ApiError } from "./api";
import { range } from "../utils";
import { Scene } from "../types/zigbee_types";

const router = express.Router();

export function groupsRouter(zigbee2mqttService: Zigbee2MqttService): Router {
  // get data about all existing groups
  router.get("/", async (_req: Request, res: Response) => {
    const groups = await zigbee2mqttService.getGroups();

    return res.status(200).json({
      data: groups,
    });
  });

  // create a group
  router.post("/", async (req: Request, res: Response) => {
    const groupName = req.body.name;
    const groupExists = await zigbee2mqttService.getGroupId(groupName);

    if (groupExists) {
      return res.status(400).json({
        error: ApiError.NameInUse,
      });
    }

    const response = await zigbee2mqttService.addGroup(groupName);

    if (response.status === "error") {
      return res.status(503).json({
        error: response.error,
      });
    }

    return res.status(200).json({
      data: response.data,
    });
  });

  // delete a group
  router.delete("/:groupId", async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId);
    const group = await zigbee2mqttService.getGroup(groupId);

    if (group === undefined) {
      return res.status(400).json({
        error: ApiError.GroupNotFound,
      });
    }

    const response = await zigbee2mqttService.deleteGroup(group.group.id);

    if (response.status === "error") {
      return res.status(503).json({
        error: response.error,
      });
    }

    return res.status(200).json({
      data: response.data,
    });
  });

  // get data about an existing group
  router.get("/:groupId", async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId);
    const group = await zigbee2mqttService.getGroup(groupId);

    if (group === undefined) {
      return res.status(404).json({
        error: ApiError.GroupNotFound,
      });
    }

    return res.status(200).json({
      data: group.group,
    });
  });

  // update an existing group's name
  router.put("/:groupId", async (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId);
    const newName = req.body.name;

    if (newName === undefined) {
      return res.status(400).json({
        error: "New name not provided.",
      });
    }

    const group = await zigbee2mqttService.getGroup(groupId);

    if (group === undefined) {
      return res.status(404).json({
        error: ApiError.GroupNotFound,
      });
    }

    if (group.group.friendly_name === newName) {
      return res.status(400).json({
        error: ApiError.NameInUse,
      });
    }

    const response = await zigbee2mqttService.renameGroup(
      group.group.id,
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

  // add a device to an existing group
  router.post("/:groupId/add", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );
    const device = await zigbee2mqttService.getDevice(req.body.device);

    if (group === undefined) {
      return res.status(404).json({ error: ApiError.GroupNotFound });
    }

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    group.addDevice(device.device.friendly_name).then((data) => {
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

  // remove a device from an existing group
  router.post("/:groupId/remove", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    const device = await zigbee2mqttService.getDevice(req.body.device);

    if (group === undefined) {
      return res.status(404).json({ error: ApiError.GroupNotFound });
    }

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    group.removeDevice(device.device.friendly_name).then((data) => {
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

  // get an existing group's state
  router.get("/:groupId/state", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    if (group === undefined) {
      return res.status(404).json({ error: ApiError.GroupNotFound });
    }

    const state = await group.getValue(req.query.setting?.toString());

    if (state === undefined) {
      return res.status(503).json({
        error: ApiError.StateDataMissing,
      });
    }

    return res.status(200).json({
      data: state,
    });
  });

  // update an existing group's state
  router.post("/:groupId/state", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    if (group === undefined) {
      return res.status(404).json({ error: ApiError.GroupNotFound });
    }

    if (typeof req.body.setting !== "string") {
      return res.status(400).json({
        error: ApiError.SettingPropertyMalformed,
      });
    }

    if (!req.body.value || req.body.value === undefined) {
      return res.status(400).json({
        error: ApiError.ParameterMissing("value"),
      });
    }

    group.setValue(req.body.setting, req.body.value);

    return res.status(200).json({
      data: req.params.groupId,
    });
  });

  router.get("/:groupId/scenes", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    if (group === undefined) {
      return res.status(404).json({ error: ApiError.GroupNotFound });
    }

    return res.status(200).json({
      data: group.group.scenes,
    });
  });

  // create a new scene
  router.post("/:groupId/scenes", async (req: Request, res: Response) => {
    const group = await zigbee2mqttService.getGroup(
      parseInt(req.params.groupId),
    );

    if (group === undefined) {
      return res.status(404).json({ error: ApiError.GroupNotFound });
    }

    if (req.body.name === undefined) {
      return res.status(404).json({ error: ApiError.ParameterMissing("name") });
    }

    let sceneId: number = 0;
    const idRange = range(0, 255);

    if (group.group.scenes.length !== 0) {
      const usedIds = new Set(group.group.scenes.map((scene) => scene.ID));
      const feasibleIds = idRange.filter((value) => !usedIds.has(value));
      sceneId = Math.min(...feasibleIds);
    }

    const newScene: Scene = {
      ID: sceneId,
      name: req.body.name,
      transition: req.body.transition | 0,
    };

    const scene = await zigbee2mqttService.createScene(
      group.group.friendly_name,
      newScene,
    );

    return res.status(200).json({
      data: {
        id: `Next scene ID will be ${sceneId}`,
        name: req.body.name,
      },
    });
  });

  // recall a scene
  router.post(
    "/:groupId/scenes/:sceneId",
    async (req: Request, res: Response) => {},
  );

  // update a scene
  router.put(
    "/:groupId/scenes/:sceneId",
    async (req: Request, res: Response) => {},
  );

  // delete a scene
  router.delete(
    "/:groupId/scenes/:sceneId",
    async (req: Request, res: Response) => {},
  );

  return router;
}
