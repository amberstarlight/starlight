// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";

const router = express.Router();

export default function rootRouter(
  zigbee2mqttService: Zigbee2MqttService,
): Router {
  router.get("/healthcheckz", (_, res: Response) => {
    zigbee2mqttService.cacheStatus().then((cache) => {
      const allCached = Object.values(cache).every((status) => status);
      res.status(allCached ? 200 : 503).send({ cache: cache });
    });
  });

  return router;
}
