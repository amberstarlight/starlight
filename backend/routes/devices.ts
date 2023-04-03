import express, { Request, Response } from "express";

const router = express.Router();

router.get("/devices", (_req: Request, res: Response) => {
  res.json({
    status: 200,
    devices: "",
    // will a list of all devices
  });
});

router.get("/devices/:deviceId", (req: Request, res: Response) => {
  res.json({
    status: 200,
    device: req.params.deviceId,
    // will return a device's full info
  });
});

router.post("/devices/:deviceId", (req: Request, res: Response) => {
  // deal with the request
  res.json({
    status: 200,
    device: req.params.deviceId,
    // will return the result
  });
});

export { router as deviceRoutes };
