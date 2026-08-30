import appConfig from "./app.config";
import loggerConfig from "./logger.config";
import dbConfig from "./db.config";
import jwtConfig from "./jwt.config";

export const config = {
  app: appConfig,
  logger: loggerConfig,
  db: dbConfig,
  jwt: jwtConfig,
} as const;

export default config;
