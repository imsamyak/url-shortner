import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@app/error";
import { jwt } from "../../../infra/security/jwt";
import withAuthContext from "@app/utils/auth-context";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Attempt to access the userId to trigger the auth validation
    const _ = req.auth.userId;
  } catch (err) {
    // If the getter throws, they aren't authenticated
    throw new UnauthorizedError({ message: "Authentication is required to access this api" });
  }

  next();
};

declare global {
  interface AuthContext {
    userId: string;
  }
}

export const injectAuthMiddleware = withAuthContext((req: Request) => {
  const authHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (authHeader) {
    const claim = jwt.decode({
      token: authHeader,
      verify: {
        intent: "access"
      }
    });

    return { userId: claim.userId };
  }

  return undefined;
});
