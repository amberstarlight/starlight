// SPDX-License-Identifier: GPL-3.0-or-later

import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: 200,
    message: "OK",
  });
});

export { router as rootRoutes };
