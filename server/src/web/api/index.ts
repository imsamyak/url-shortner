import { Router } from "express";
import { injectContext } from "./middleware";

import useAuthRoutes from "./route/auth.route";
import useUserRoutes from "./route/user.route";
import useUrlRoutes from "./route/redirect.route";

export default function useApi(logger: Logger) {
  const api = Router();

  try {
    api.use(injectContext);

    api.use("/auth", useAuthRoutes(logger));
    api.use("/redirect", useUrlRoutes(logger));
    api.use("/user", useUserRoutes(logger));
  } catch (err) {
    logger.error(err, "Failed to initialize API routes");
    throw err;
  }

  return api;
}
