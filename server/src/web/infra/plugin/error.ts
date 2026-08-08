import { Request, Response, NextFunction } from "express";
import { HttpError, InternalServerError } from "../http-error";

const handleError = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const error = HttpError.from(err);

    if (error instanceof InternalServerError) {
      throw error;
    }

    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  } catch (err) {
    req.log.error(err, "Internal Server error");
    res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal Server Error",
      },
    });
  }
};

export default handleError;
