import buildLogger, { LoggerConfig } from "@app/utils/logger";

import { ConfigurationError } from "@app/error";

import type { Logger } from "pino";

import config from "../../config";

function initLogger(config: LoggerConfig): Logger {
    try {
        return buildLogger(config);
    } catch (err: any) {
        throw new ConfigurationError({
            message: "Logger initialization failure",
            options: { cause: err }
        });
    }
}

const logger = initLogger(config.logger);
export default logger;
