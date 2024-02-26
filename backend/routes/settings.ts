// SPDX-License-Identifier: AGPL-3.0-or-later

import express, { Request, Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";
import { ApiError } from "./api";

const router = express.Router();

export function settingRouter(zigbee2mqttService: Zigbee2MqttService): Router {
  // handle device joining
  router.post("/permit_join", async (req: Request, res: Response) => {
    const state = req.body.state;
    const device = req.body.deviceId;
    const time = req.body.time;

    if (state === undefined) {
      return res.status(404).json({
        error: ApiError.ParameterMissing("state"),
      });
    }

    const response = await zigbee2mqttService.permitJoining(
      state,
      device,
      time,
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

  return router;
}
