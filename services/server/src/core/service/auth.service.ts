import { hashPassword, validatePassword } from "../utils/cred";
import crypto from "node:crypto";
import userRepository from "../repository/user.repository";
import { validateEmail, validatePasswordStrength } from "../utils/validation";
import {
  ResourceNotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@app/error";
import { jwt } from "../../infra/security/jwt";

export class AuthService {
  constructor(
    private readonly auth: AuthProvider,
    private readonly logger: Logger,
  ) { }

  async login(params: { email: string; password: string }) {
    const { email, password } = params;

    validateEmail(email);
    validatePasswordStrength(password);

    try {
      const user = await userRepository.getByEmail(email);

      if (!user) {
        throw new UnauthorizedError({ message: "Invalid credentials" });
      }

      const isMatch = await validatePassword(
        password,
        user.passwordHash,
        this.logger,
      );

      if (!isMatch) {
        this.logger.error("Failed to validate password");
        throw new UnauthorizedError({ message: "Invalid credentials" });
      }

      const token = jwt.encode({
        payload: {
          claim: {
            userId: user.id,
          },
          intent: "access",
        },
      });

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      };
    } catch (err) {
      this.logger.error({ err });
      throw err;
    }
  }

  async register(params: { email: string; password: string; name: string }) {
    const { email, password, name } = params;
    try {
      validateEmail(email);
      validatePasswordStrength(password);

      const passwordHash = await hashPassword(password, this.logger);

      const user = {
        id: crypto.randomUUID() as string,
        name,
        email,
        passwordHash,
        isVerfied: false,
      };

      await userRepository.create(user);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: jwt.encode(
          {
            payload: {
              claim: { userId: user.id },
              intent: "access",
            },
          },
        ),
      };
    } catch (err) {
      this.logger.error({ err });
      throw err;
    }
  }

  async logout(): Promise<void> {
    const userId = this.auth().userId;

    // Refresh-token revocation will be handled here once Redis is introduced.
    this.logger.info({ userId }, "User logged out successfully");
  }

  async forgotPassword(params: { email: string }) {
    const { email } = params;

    try {
      validateEmail(email);

      const user = await userRepository.getByEmail(email);
      if (!user) {
        return null; // Return silently to prevent email enumeration
      }

      const resetToken = jwt.encode(
        {
          payload: {
            claim: { userId: user.id },
            intent: "reset_credential",
          },
        },
      );

      this.logger.info(
        `Simulated Email: Password reset link for ${email} is /api/v1/auth/reset-password?token=${resetToken}`,
      );

      return resetToken;
    } catch (err) {
      this.logger.error({ err });
      throw err;
    }
  }

  async resetPassword(params: { token: string; newPassword: string }) {
    const { token, newPassword } = params;

    try {
      const decoded = jwt.decode(
        { token, verify: { intent: "reset_credential" } },
      );
      const userId = decoded.claim.userId;

      if (!userId) {
        throw new ValidationError({ resource: "Reset Token", issue: "Invalid or expired reset token" });
      }

      validatePasswordStrength(newPassword);

      const user = await userRepository.getById(userId as string);
      if (!user) {
        throw new ResourceNotFoundError({ resource: "User", id: userId as string });
      }

      const passwordHash = await hashPassword(newPassword, this.logger);
      if (!passwordHash) {
        throw new Error("Failed to process password");
      }

      await userRepository.update(user.id, { passwordHash });
    } catch (err) {
      this.logger.error({ err });
      throw err;
    }
  }

  async activateUser(params: { token: string }) {
    const { token } = params;

    try {
      const { claim } = jwt.decode(
        { token, verify: { intent: "email_verification" } },
      );

      const user = await userRepository.getById(claim.userId);
      if (!user) {
        throw new ResourceNotFoundError({
          resource: "User",
          id: claim.userId
        });
      }

      if (user.isVerfied) {
        return;
      }

      await userRepository.update(claim.userId, { isVerfied: true });
      this.logger.info({ userId: claim.userId }, "User activated successfully");
    } catch (err) {
      this.logger.error({ err });
      throw err;
    }
  }
}


export default AuthService;
