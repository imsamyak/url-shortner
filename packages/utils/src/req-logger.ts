import { pinoHttp } from "pino-http";
import type { Logger } from "pino";
import type { RequestHandler } from "express";

export function withRequestLogger(logger: Logger): RequestHandler {
    try {
        return pinoHttp({
            logger: logger as any,
            serializers: {
                req(req) {
                    return {
                        id: req.id,
                        method: req.method,
                        url: req.url,
                    };
                },
                res(res) {
                    return {
                        statusCode: res.statusCode,
                    };
                },
            },
        });
    } catch (err) {
        logger.error({ err }, "Failed to initialize logging middleware");
        throw err;
    }
}


export default withRequestLogger;
