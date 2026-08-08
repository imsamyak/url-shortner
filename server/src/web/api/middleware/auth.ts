import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../infra/http-error";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Attempt to access the userId to trigger the context validation
    const _ = req.context.userId;
  } catch (err) {
    // If the getter throws, they aren't authenticated
    throw new UnauthorizedError("Authentication is required to access this api");
  }

  next();
};
