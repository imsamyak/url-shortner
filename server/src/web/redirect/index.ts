import { Router } from "express";
import { redirectRedirect } from "./redirect.controller";
import { injectContext } from "../api/middleware";
import useLog from "../infra/plugin/logger";

export default function useRedirect(logger: Logger) {
  const router = Router();

  // Enable request logging specifically for this router
  router.use(useLog(logger.child({ name: "request" })));
  
  // Inject context for service usage
  router.use(injectContext);

  // Root short URL redirect
  router.get("/:shortId", redirectRedirect);

  return router;
}
