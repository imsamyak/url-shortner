import { Router } from "express";
import { redirectRedirect } from "./redirect.controller";
import { injectAuthMiddleware } from "../api/middleware";
import withRequestLogger from "@app/utils/req-logger";
import type { Logger } from "pino";

export function useRedirect(logger: Logger) {
  const router = Router();

  // Enable request logging specifically for this router
  router.use(withRequestLogger(logger.child({ name: "request" })));

  // Inject context for service usage
  router.use(injectAuthMiddleware);

  // Root short URL redirect
  router.get("/:shortId", redirectRedirect);

  return router;
}


export default useRedirect;
