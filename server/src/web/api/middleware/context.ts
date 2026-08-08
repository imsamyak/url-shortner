import { NextFunction, Request, Response } from "express";
import { RequestContext } from "../../../domain/type";
import { JwtService } from "../../../infra/security";
import { UnauthenticatedException } from "../../../domain/exception";

declare global {
  namespace Express {
    interface Request {
      context: RequestContext;
    }
  }
}

export const injectContext = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let userId: string | undefined;

  const authHeader = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null;

  if (authHeader) {
    const jwt = new JwtService(req.log);

    const {
      claim: { userId: decodedUserId },
    } = jwt.decode(authHeader);

    userId = decodedUserId;
  }

  req.context = {
    get userId() {
      if (userId) {
        return userId;
      }
      throw new UnauthenticatedException("Unauthorized");
    },
  };

  next();
};
