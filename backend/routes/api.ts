// SPDX-License-Identifier: AGPL-3.0-or-later

import { Router } from "express";

export function apiRouter(obj: Record<string, Router>): Router {
  const router = Router();

  Object.entries(obj).forEach(([path, subrouter]) =>
    router.use(path, subrouter),
  );

  return router;
}

export const ApiError = {
  DeviceNotFound: "Device not found.",
  GroupNotFound: "Group not found.",
  NameInUse: "Name already in use.",
  SettingPropertyMalformed: "Setting property malformed.",
  StateDataMissing: "Could not retrieve state data.",
  ValueNotProvided: "Value property was not provided.",
};
