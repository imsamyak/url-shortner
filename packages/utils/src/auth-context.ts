import { UnauthorizedError } from "@app/error";
import type { Request, RequestHandler } from "express";

/** Services extend this interface with their authentication fields. */


declare global {

    interface AuthContext { }

    namespace Express {
        interface Request {
            /** Reading this throws when the request is not authenticated. */
            readonly auth: AuthContext;
        }
    }
}


/**
 * Installs one immutable authentication context on each request.
 * The supplier may return `undefined` for anonymous requests; `request.auth`
 * then throws an UnauthorizedError when a protected handler reads it.
 */
export function withAuthContext(
    provider: (request: Request) => AuthContext | undefined
): RequestHandler {
    return (request, _response, next) => {
        const auth = provider(request);

        Object.defineProperty(request, "auth", {
            configurable: false,
            enumerable: false,
            get(): AuthContext {
                if (auth === undefined) {
                    throw new UnauthorizedError({
                        message: "Missing or invalid authentication",
                    });
                }

                return auth;
            },
        });

        next();
    };
}


export default withAuthContext;
