// SPDX-FileCopyrightText: © 2023 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";
import { ApiError } from "./api";
import { nextUnused, range } from "../utils";
import { type Group, type Scene } from "@starlight/types";

const router = express.Router();

const groupSort = (a: Group, b: Group) => {
  return a.friendly_name.localeCompare(b.friendly_name, undefined, {
    numeric: true,
  });
};

export function groupsRouter(zigbee2mqttService: Zigbee2MqttService): Router {
  // get data about all existing groups
  router.get("/", async (_req: Request, res: Response) => {
    const groups = await zigbee2mqttService.getGroups();
    const sortedGroups = groups.sort((a, b) => groupSort(a.group, b.group));

    return res.status(200).json({
      data: sortedGroups,
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
      return res.status(500).json({
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

    const status = await group.setValue(req.body.setting, req.body.value);

    return res.status(200).json({
      data: status,
    });
  });

  // get all scenes for a group
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

    const currentSceneNames = group.group.scenes.map((scene) => scene.name);

    if (req.body.name === undefined) {
      return res.status(404).json({ error: ApiError.ParameterMissing("name") });
    }

    if (currentSceneNames.includes(req.body.name)) {
      // don't let API users overwrite scenes. updates are done through a PUT
      // to /:groupId/scenes/:sceneId
      return res.status(404).json({ error: ApiError.NameInUse });
    }

    const sceneId = nextUnused(
      group.group.scenes.map((scene) => scene.id),
      range(0, 255),
    );

    // transition on scenes can only be set with 'scene_add', so if we have the
    // property in the body we should first call createOrUpdateScene with just
    // the required properties and transition, then call it again with the other
    // properties.

    let newScene: Scene;

    if (req.body.transition !== undefined && req.body.transition > 0) {
      newScene = {
        id: sceneId,
        name: req.body.name,
        transition: req.body.transition,
      };

      zigbee2mqttService.createOrUpdateScene(
        group.group.friendly_name,
        newScene,
      );

      zigbee2mqttService.createOrUpdateScene(group.group.friendly_name, {
        id: sceneId,
        ...req.body,
      });
    } else {
      newScene = {
        id: sceneId,
        name: req.body.name,
        ...req.body,
      };

      zigbee2mqttService.createOrUpdateScene(
        group.group.friendly_name,
        newScene,
      );
    }

    return res.status(200).send();
  });

  // recall a scene
  router.post(
    "/:groupId/scenes/:sceneId",
    async (req: Request, res: Response) => {
      const group = await zigbee2mqttService.getGroup(
        parseInt(req.params.groupId),
      );
      const sceneId = parseInt(req.params.sceneId);

      if (group === undefined) {
        return res.status(404).json({ error: ApiError.GroupNotFound });
      }

      const currentSceneIds = group.group.scenes.map((scene) => scene.id);

      if (!currentSceneIds.includes(sceneId)) {
        return res.status(404).json({ error: ApiError.SceneNotFound });
      }

      zigbee2mqttService.recallScene(group.group.friendly_name, sceneId);

      return res.status(200).json({
        data: sceneId,
      });
    },
  );

  // update a scene
  router.put(
    "/:groupId/scenes/:sceneId",
    async (req: Request, res: Response) => {
      const group = await zigbee2mqttService.getGroup(
        parseInt(req.params.groupId),
      );
      const sceneId = parseInt(req.params.sceneId);

      if (group === undefined) {
        return res.status(404).json({ error: ApiError.GroupNotFound });
      }

      const currentSceneIds = group.group.scenes.map((scene) => scene.id);

      if (!currentSceneIds.includes(sceneId)) {
        return res.status(404).json({ error: ApiError.SceneNotFound });
      }

      zigbee2mqttService.createOrUpdateScene(
        group.group.friendly_name,
        req.body,
      );

      return res.status(200).send();
    },
  );

  // delete a scene
  router.delete(
    "/:groupId/scenes/:sceneId",
    async (req: Request, res: Response) => {
      const group = await zigbee2mqttService.getGroup(
        parseInt(req.params.groupId),
      );
      const sceneId = parseInt(req.params.sceneId);

      if (group === undefined) {
        return res.status(404).json({ error: ApiError.GroupNotFound });
      }

      const currentSceneIds = group.group.scenes.map(
        (scene: Scene) => scene.id,
      );

      if (!currentSceneIds.includes(sceneId)) {
        return res.status(404).json({ error: ApiError.SceneNotFound });
      }

      zigbee2mqttService.deleteScene(group.group.friendly_name, sceneId);

      return res.status(200).send();
    },
  );

  return router;
}
