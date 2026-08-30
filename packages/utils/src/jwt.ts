import jwt, {
  type JwtPayload as JsonWebTokenPayload,
  type Secret,
  type SignOptions,
  type VerifyOptions,
} from "jsonwebtoken";
import { InternalError, UnauthorizedError } from "@app/error";

export type JwtIntent =
  | "access"
  | "refresh"
  | "reset_credential"
  | "email_verification";

export interface IntentPayload<TClaim extends object> extends JsonWebTokenPayload {
  claim: TClaim;
  intent: JwtIntent;
}

export interface JwtServiceConfig {
  secret: Secret;
  expiresIn: Record<JwtIntent, NonNullable<SignOptions["expiresIn"]>>;
  signOptions?: Omit<SignOptions, "expiresIn">;
  verifyOptions?: VerifyOptions;
}

export class JwtService<TClaim extends object> {
  constructor(private readonly config: JwtServiceConfig) { }

  encode(params: { payload: IntentPayload<TClaim> }): string {
    const { payload } = params;
    try {
      return jwt.sign(payload, this.config.secret, {
        ...this.config.signOptions,
        expiresIn: this.config.expiresIn[payload.intent],
      });
    } catch (cause) {
      throw new InternalError("Failed to sign JWT", { cause });
    }
  }

  decode(params: {
    token: string;
    verify?: { intent?: JwtIntent };
  }): IntentPayload<TClaim> {
    const { token, verify = {} } = params;

    let decoded: any;
    try {
      decoded = jwt.verify(token, this.config.secret, this.config.verifyOptions);
    } catch (cause) {
      throw new UnauthorizedError({ message: "Invalid or expired JWT", options: { cause } });
    }

    if (!decoded || typeof decoded !== "object" || !decoded.claim || !decoded.intent) {
      throw new UnauthorizedError({ message: "JWT is missing required claim or intent fields" });
    }

    if (verify.intent && verify.intent !== decoded.intent) {
      throw new UnauthorizedError({ message: "JWT intent does not match the expected intent" });
    }

    return decoded as IntentPayload<TClaim>;
  }
}

export default JwtService;
