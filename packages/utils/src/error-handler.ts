import type { ErrorRequestHandler } from "express";
import { ServiceError } from "@app/error";

export function withErrorHandler(
    handler?: (err: ServiceError) => void
): ErrorRequestHandler {

    return (err, req, res, next) => {

        const error = ServiceError.from(err);

        handler?.(error);

        const httpErr = error.toHttpError();

        res.status(httpErr.httpStatus).json({
            code: httpErr.code,
            message: httpErr.message,
        });
    }
}


export default withErrorHandler;
