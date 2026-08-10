import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import useWeb from "./web";
import db from "./infra/database";
import logger from "./infra/logger";
import config from "./config";

const clients = config.core.clients;
const PORT = config.core.port;
const HOST = config.core.host;

export default async function app() {
  const app = express();

  // Security: Disable the X-Powered-By header to prevent leaking framework information
  app.disable("x-powered-by");

  app.use(cors({ origin: clients }));
  app.use(express.json());

  // Health check endpoint
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "OK", uptime: process.uptime() });
  });

  app.use("/", useWeb(logger.child({ name: "web" })));
  logger.info("Web routes mounted on /");

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err, "Internal Server Error");

    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
      },
    });
  });

  // Initialize DB before starting listener
  await db.init();

  app.listen(PORT, HOST, () => {
    logger.info(`Server running on http://${HOST}:${PORT}`);
  });
}
