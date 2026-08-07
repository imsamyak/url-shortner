import { hashPassword, validatePassword } from "../utils/cred";
import crypto from "node:crypto";
import db from "../../infra/database";
import { validateEmail, validatePasswordStrength } from "../utils/validation";
import {
  ResourceNotFoundException,
  UnauthenticatedException,
} from "../../domain/exception";
import { UserRepository } from "../../infra/database/repository/user.repository";
import { JwtService } from "../../infra/security";
import { RequestContext } from "../../domain/type";

export default class AuthService {
  private readonly repo: UserRepository;

  constructor(
    private readonly context: RequestContext,
    private readonly logger: Logger,
  ) {
    this.repo = new db.repositories.User(logger);
  }

  async login(params: { email: string; password: string }) {
    const { email, password } = params;

    validateEmail(email);
    validatePasswordStrength(password);

    try {
      const user = await this.repo.getByEmail(email);

      if (!user) {
        throw new UnauthenticatedException("Invalid credentials");
      }

      const isMatch = await validatePassword(
        password,
        user.passwordHash,
        this.logger,
      );

      if (!isMatch) {
        this.logger.error("Failed to validate password");
        throw new UnauthenticatedException("Invalid credentials");
      }

      const jwt = new JwtService(this.logger);
      const token = jwt.encode({
        claim: {
          userId: user.id,
        },
        intent: "access",
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
      this.logger.error(err);
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

      await this.repo.create(user);

      const jwt = new JwtService(this.logger);
      return {
        user,
        token: jwt.encode({ claim: { userId: user.id }, intent: "access" }),
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async forgotPassword(params: { email: string }) {
    const { email } = params;

    try {
      validateEmail(email);

      const user = await this.repo.getByEmail(email);
      if (!user) {
        return null; // Return silently to prevent email enumeration
      }

      const jwt = new JwtService(this.logger);
      const resetToken = jwt.encode({
        claim: { userId: user.id },
        intent: "reset_credential",
      });

      this.logger.info(
        `Simulated Email: Password reset link for ${email} is /api/v1/auth/reset-password?token=${resetToken}`,
      );

      return resetToken;
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async resetPassword(params: { token: string; newPassword: string }) {
    const { token, newPassword } = params;

    try {
      const jwt = new JwtService(this.logger);
      const decoded = jwt.decode(token, { intent: "reset_credential" });
      const userId = decoded.claim.userId;

      if (!userId) {
        throw new Error("Invalid or expired reset token");
      }

      validatePasswordStrength(newPassword);

      const user = await this.repo.getById(userId as string);
      if (!user) {
        throw new Error("User not found");
      }

      const passwordHash = await hashPassword(newPassword, this.logger);
      if (!passwordHash) {
        throw new Error("Failed to process password");
      }

      await this.repo.update(user.id, { passwordHash });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async activateUser(params: { token: string }) {
    const { token } = params;

    try {
      const jwt = new JwtService(this.logger);
      const { claim } = jwt.decode(token, { intent: "email_verification" });

      const user = await this.repo.getById(claim.userId);
      if (!user) {
        throw new ResourceNotFoundException("User not found");
      }

      if (user.isVerfied) {
        return;
      }

      await this.repo.update(claim.userId, { isVerfied: true });
      this.logger.info({ userId: claim.userId }, "User activated successfully");
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
