import { Router } from "express";
import useRedirect from "./redirect";

import useApi from "./api";
import { useDoc } from "./doc";
import useLog from "./infra/plugin/logger";
import handleError from "./infra/plugin/error";

export default function useWeb(logger: Logger) {
  const web = Router();

  // enable request logging
  web.use(useLog(logger.child({ name: "request" })));

  // serve redirect
  web.use("/r", useRedirect(logger.child({ name: "redirect" })));
  logger.info("Redirect mounted on /r");

  // serve api
  web.use("/api/v1", useApi(logger.child({ name: "api" })));
  logger.info("API mounted on /api/v1");

  // serve swagger ui
  web.use("/docs", useDoc(logger.child({ name: "docs" })));
  logger.info("Docs mounted on /docs");

  // error handler
  web.use(handleError);

  return web;
}
