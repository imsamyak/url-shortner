import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import useWeb from "./web";

import logger from "./infra/logger";
import config from "./config";

/** Builds the HTTP application without opening a port or initializing infrastructure. */
export function createHttpApp() {
  const httpApp = express();

  // Security: Disable the X-Powered-By header to prevent leaking framework information
  httpApp.disable("x-powered-by");

  httpApp.use(cors({ origin: config.app.corsClients }));
  httpApp.use(express.json());

  // Health check endpoint
  httpApp.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", uptime: process.uptime() });
  });

  httpApp.use("/", useWeb(logger.child({ name: "web" })));
  logger.info("Web routes mounted on /");

  httpApp.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err, "Internal Server Error");

    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
      },
    });
  });

  return httpApp;
}

export async function app() {
  const httpApp = createHttpApp();



  return httpApp.listen(config.app.port, config.app.host, () => {
    logger.info(`Server running on http://${config.app.host}:${config.app.port}`);
  });
}


export default app;
