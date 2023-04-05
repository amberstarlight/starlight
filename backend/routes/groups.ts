// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Request, Response } from "express";

const router = express.Router();

router.get("/groups", (_req: Request, res: Response) => {
  res.json({
    status: 200,
    groups: "",
    // will return a list of groups
  });
});

router.get("/groups/:groupId", (req: Request, res: Response) => {
  res.json({
    status: 200,
    group: req.params.groupId,
    // will return a group's full info
  });
});

export { router as groupRoutes };
