// SPDX-License-Identifier: AGPL-3.0-or-later

import express, { Response, Router } from "express";
import { Zigbee2MqttService } from "../zigbee2mqttService";
import { readFile } from "fs";
import { logger } from "../logger";

async function getShortSha(): Promise<string> {
  return new Promise((resolve, reject) => {
    readFile("../.git/HEAD", (err, data) => {
      const sha = data.toString().trim();

      if (err) {
        logger("error", err.name, err.message);
        reject();
      }

      if (sha.indexOf(":") === -1) {
        resolve(sha.slice(0, 7));
      } else {
        readFile(`../.git/${sha.substring(5)}`, (err, data) => {
          if (err) {
            logger("error", err.name, err.message);
            reject();
          }

          resolve(data.toString().trim().slice(0, 7));
        });
      }
    });
  });
}

const router = express.Router();

export function rootRouter(zigbee2mqttService: Zigbee2MqttService): Router {
  router.get("/healthcheck", async (_, res: Response) => {
    getShortSha().then((sha) => {
      zigbee2mqttService.cacheStatus().then((cache) => {
        const allCached = Object.values(cache).every((status) => status);

        res.status(allCached ? 200 : 503).json({
          git_sha1: sha,
          cache: cache,
        });
      });
    });
  });

  return router;
}
