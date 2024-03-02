// SPDX-FileCopyrightText: © 2024 Amber Cronin <software@amber.vision>
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
  ParameterMissing: (param: string) =>
    `Parameter '${param}' missing in request.`,
};
