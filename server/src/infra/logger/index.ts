import pino from "pino";
import config from "../../config";

declare global {
  type Logger = pino.Logger;
}

const logger = pino({
  level: config.log.lvl,
  redact: {
    paths: [...config.log.redactKeys],
    censor: "[REDACTED]",
  },
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
    },
  },
});

export default logger;
