import jwt from "jsonwebtoken";
import config from "../../config";
import { UnauthenticatedException } from "../../domain/exception";

// --- Types ---

export namespace Jwt {
  export type Token = string & { readonly __authToken: unique symbol };

  export type Intent =
    | "access"
    | "refresh"
    | "reset_credential"
    | "email_verification";

  export interface Payload {
    readonly claim: {
      userId: string;
    };
    readonly intent: Intent;
  }
}

// --- Service ---
export class JwtService {
  private readonly secret: string;
  private readonly expiryMap: Record<Jwt.Intent, string>;

  constructor(protected readonly logger: Logger) {
    this.secret = config.infra.security.jwt.secret;
    this.expiryMap = {
      access: config.infra.security.jwt.expiresIn.access,
      refresh: config.infra.security.jwt.expiresIn.refresh,
      reset_credential: config.infra.security.jwt.expiresIn.resetPassword,
      email_verification: config.infra.security.jwt.expiresIn.emailVerification,
    };
  }

  /**
   * Encodes a payload into a strongly-typed Jwt.Token.
   */
  encode(payload: Jwt.Payload): Jwt.Token {
    try {
      const token = jwt.sign(payload, this.secret, {
        expiresIn: this.expiryMap[payload.intent] as any,
      });

      return token as Jwt.Token;
    } catch (err) {
      this.logger.error({ err, payload }, "Failed to generate JWT");
      throw err;
    }
  }

  /**
   * Decodes and validates a Jwt.Token.
   */
  decode(
    token: string,
    verify?: {
      readonly intent?: Jwt.Intent;
    },
  ): Jwt.Payload {
    let decoded: Jwt.Payload;

    try {
      decoded = jwt.verify(token, this.secret) as Jwt.Payload;
    } catch (err: any) {
      this.logger.error({ err }, "Unexpected error while verifying JWT");
      throw new UnauthenticatedException(
        err.message || "Invalid or expired token",
        err,
      );
    }

    if (verify?.intent && decoded.intent !== verify.intent) {
      this.logger.warn(
        {
          claim: decoded.claim,
          intent: {
            expected: verify.intent,
            received: decoded.intent,
          },
        },
        "JWT token intent mismatch",
      );
      throw new UnauthenticatedException("Invalid token");
    }

    return decoded;
  }
}
