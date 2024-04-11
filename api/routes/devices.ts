// SPDX-FileCopyrightText: © 2023 Amber Cronin <software@amber.vision>
// SPDX-License-Identifier: AGPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";
import { ApiError } from "./api";
import { range } from "../utils";
import { Scene } from "../types/zigbee_types";

const router = express.Router();

export function deviceRouter(zigbee2mqttService: Zigbee2MqttService): Router {
  // get data about all existing devices
  router.get("/", async (req: Request, res: Response) => {
    const devices = await zigbee2mqttService.getDevices();
    const deviceQuery = req.query.parameter?.toString();

    if (deviceQuery !== undefined) {
      const queriedData = devices.map((device) => device.device[deviceQuery]);
      return res.status(200).json({
        data: queriedData,
      });
    }

    return res.status(200).json({
      data: devices,
    });
  });

  // get data about an existing device
  router.get("/:deviceId", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    const deviceQuery = req.query.parameter?.toString();

    if (deviceQuery !== undefined) {
      return res.status(200).json({
        data: device.device[deviceQuery],
      });
    }

    return res.status(200).json({
      data: device.device,
    });
  });

  // rename an existing device
  router.put("/:deviceId", async (req: Request, res: Response) => {
    const newName = req.body.name;

    if (newName === undefined) {
      return res.status(400).json({
        error: "New name not provided.",
      });
    }

    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

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

    return res.status(200).json({
      data: state,
    });
  });

  // update an existing device's state
  router.post("/:deviceId/state", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({
        error: ApiError.DeviceNotFound,
      });
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

    device.setValue(req.body.setting, req.body.value);

    return res.status(200).json({
      data: req.params.deviceId,
    });
  });

  router.post("/:deviceId/identify", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    // trigger an effect on a device, such that it can be uniquely identified in
    // the real world by an end user.
    device.setValue("effect", "blink");

    return res.status(200).send();
  });

  // get all scenes for a device
  router.get("/:deviceId/scenes", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    return res.status(200).json({
      data: device.device.scenes,
    });
  });

  // create a new scene
  router.post("/:deviceId/scenes", async (req: Request, res: Response) => {
    const device = await zigbee2mqttService.getDevice(req.params.deviceId);

    if (device === undefined) {
      return res.status(404).json({ error: ApiError.DeviceNotFound });
    }

    const currentSceneNames = device.device.scenes.map((scene) => scene.name);

    if (req.body.name === undefined) {
      return res.status(404).json({ error: ApiError.ParameterMissing("name") });
    }

    if (currentSceneNames.includes(req.body.name)) {
      // don't let API users overwrite scenes. updates are done through a PUT
      // to /:deviceId/scenes/:sceneId
      return res.status(404).json({ error: ApiError.NameInUse });
    }

    let sceneId: number = 0;
    const idRange = range(0, 255);

    if (device.device.scenes.length !== 0) {
      const usedIds = new Set(device.device.scenes.map((scene) => scene.id));
      const feasibleIds = idRange.filter((value) => !usedIds.has(value));
      sceneId = Math.min(...feasibleIds);
    }

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
        device.device.friendly_name,
        newScene,
      );

      zigbee2mqttService.createOrUpdateScene(device.device.friendly_name, {
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
        device.device.friendly_name,
        newScene,
      );
    }

    return res.status(200).send();
  });

  // recall a scene
  router.post(
    "/:deviceId/scenes/:sceneId",
    async (req: Request, res: Response) => {
      const device = await zigbee2mqttService.getDevice(req.params.deviceId);
      const sceneId = parseInt(req.params.sceneId);

      if (device === undefined) {
        return res.status(404).json({ error: ApiError.DeviceNotFound });
      }

      const currentSceneIds = device.device.scenes.map((scene) => scene.id);

      if (!currentSceneIds.includes(sceneId)) {
        return res.status(404).json({ error: ApiError.SceneNotFound });
      }

      zigbee2mqttService.recallScene(device.device.friendly_name, sceneId);

      return res.status(200).json({
        data: sceneId,
      });
    },
  );

  // update a scene
  router.put(
    "/:deviceId/scenes/:sceneId",
    async (req: Request, res: Response) => {
      const device = await zigbee2mqttService.getDevice(req.params.deviceId);
      const sceneId = parseInt(req.params.sceneId);

      if (device === undefined) {
        return res.status(404).json({ error: ApiError.DeviceNotFound });
      }

      const currentSceneIds = device.device.scenes.map((scene) => scene.id);

      if (!currentSceneIds.includes(sceneId)) {
        return res.status(404).json({ error: ApiError.SceneNotFound });
      }

      zigbee2mqttService.createOrUpdateScene(
        device.device.friendly_name,
        req.body,
      );

      return res.status(200).send();
    },
  );

  // delete a scene
  router.delete(
    "/:deviceId/scenes/:sceneId",
    async (req: Request, res: Response) => {
      const device = await zigbee2mqttService.getDevice(req.params.deviceId);
      const sceneId = parseInt(req.params.sceneId);

      if (device === undefined) {
        return res.status(404).json({ error: ApiError.DeviceNotFound });
      }

      const currentSceneIds = device.device.scenes.map((scene) => scene.id);

      if (!currentSceneIds.includes(sceneId)) {
        return res.status(404).json({ error: ApiError.SceneNotFound });
      }

      zigbee2mqttService.deleteScene(device.device.friendly_name, sceneId);

      return res.status(200).send();
    },
  );

  return router;
}
