import { Router } from "express";
import UserController from "../controller/user.controller";
import { requireAuth } from "../middleware/auth";

export default function useUserRoutes(logger: Logger) {
  const router = Router();
  const controller = new UserController();

  // Protected routes
  router.use(requireAuth);

  router.get("/redirects", controller.getUserRedirects);
  router.get("/", controller.getUserProfile);
  router.put("/", controller.updateUserProfile);

  return router;
}
