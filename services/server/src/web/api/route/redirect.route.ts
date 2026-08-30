import { Router } from "express";
import { createRedirect, deleteRedirect } from "../controller/redirect.controller";
import { requireAuth } from "../middleware/auth";

export function useUrlRoutes(logger: Logger) {
  const router = Router();

  // Public routes

  // Protected routes
  router.use(requireAuth);
  router.post("/", createRedirect);
  router.delete("/:shortId", deleteRedirect);

  return router;
}


export default useUrlRoutes;
