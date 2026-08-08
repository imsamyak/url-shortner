import { Request } from "express";
import { pinoHttp } from "pino-http";

const useLog = (logger: Logger) => {
  try {
    return pinoHttp({
      logger,
      serializers: {
        req(req: Request) {
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
    logger.error(err, "Failed to initialize logging middleware");
    throw err;
  }
};

export default useLog;
