import { Router } from "express";
import useRedirect from "./redirect";
import withRequestLogger from "@app/utils/req-logger";
import type { Logger } from "pino";

import useApi from "./api";
import { useDoc } from "./doc";
import withErrorHandler from "@app/utils/error-handler";

export function useWeb(logger: Logger) {
  const web = Router();

  // enable request logging
  web.use(withRequestLogger(logger.child({ name: "request" })));

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
  web.use(withErrorHandler((err) => {
    logger.error({ err }, "Internal Server Error");
  }));

  return web;
}


export default useWeb;
