// SPDX-License-Identifier: AGPL-3.0-or-later

import { Router } from "express";

export function apiRouter(obj: Record<string, Router>): Router {
  const router = Router();

  Object.entries(obj).forEach(([path, subrouter]) =>
    router.use(path, subrouter),
  );

  return router;
}
