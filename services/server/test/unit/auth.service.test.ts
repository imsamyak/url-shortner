import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ResourceNotFoundError,
  UnauthorizedError,
} from "@app/error";
import { createTestLogger } from "../helpers/logger";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  getById: vi.fn(),
  getByEmail: vi.fn(),
  hashPassword: vi.fn(),
  validatePassword: vi.fn(),
  encode: vi.fn(),
  decode: vi.fn(),
}));

vi.mock("../../src/core/repository/user.repository", () => ({
  default: {
    create: mocks.create,
    update: mocks.update,
    getById: mocks.getById,
    getByEmail: mocks.getByEmail,
  },
}));

vi.mock("../../src/core/utils/cred", () => ({
  hashPassword: mocks.hashPassword,
  validatePassword: mocks.validatePassword,
}));

vi.mock("../../src/infra/security/jwt", () => ({
  jwt: {
    encode: mocks.encode,
    decode: mocks.decode,
  },
}));

import AuthService from "../../src/core/service/auth.service";

const user = {
  id: "user-1",
  name: "Ada",
  email: "ada@example.com",
  passwordHash: "stored-hash",
  isVerfied: false,
};

describe("AuthService", () => {
  const logger = createTestLogger();
  const context = { userId: user.id };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getByEmail.mockResolvedValue(user);
    mocks.getById.mockResolvedValue(user);
    mocks.create.mockResolvedValue(user);
    mocks.update.mockResolvedValue(user);
    mocks.hashPassword.mockResolvedValue("new-hash");
    mocks.validatePassword.mockResolvedValue(true);
    mocks.encode.mockReturnValue("signed-token");
    mocks.decode.mockReturnValue({ claim: { userId: user.id } });
  });

  it("logs in with valid credentials and returns a safe user", async () => {
    const result = await new AuthService(context, logger).login({
      email: user.email,
      password: "password123",
    });

    expect(mocks.validatePassword).toHaveBeenCalledWith(
      "password123",
      user.passwordHash,
      logger,
    );
    expect(mocks.encode).toHaveBeenCalledWith(
      {
        payload: {
          claim: { userId: user.id },
          intent: "access",
        },
      },
    );
    expect(result).toEqual({
      user: { id: user.id, name: user.name, email: user.email },
      token: "signed-token",
    });
  });

  it("rejects login when the user does not exist", async () => {
    mocks.getByEmail.mockResolvedValue(null);

    await expect(
      new AuthService(context, logger).login({
        email: user.email,
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("rejects login when the password does not match", async () => {
    mocks.validatePassword.mockResolvedValue(false);

    await expect(
      new AuthService(context, logger).login({
        email: user.email,
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("registers a user with a hash and access token", async () => {
    const result = await new AuthService(context, logger).register({
      email: user.email,
      password: "password123",
      name: user.name,
    });

    expect(mocks.hashPassword).toHaveBeenCalledWith("password123", logger);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: user.name,
        email: user.email,
        passwordHash: "new-hash",
        isVerfied: false,
      }),
    );
    expect(result.token).toBe("signed-token");
  });

  it("logs out the authenticated context", async () => {
    await new AuthService(context, logger).logout();

    expect(logger.info).toHaveBeenCalledWith(
      { userId: user.id },
      "User logged out successfully",
    );
  });

  it("creates a reset token for an existing user", async () => {
    const result = await new AuthService(context, logger).forgotPassword({
      email: user.email,
    });

    expect(result).toBe("signed-token");
    expect(mocks.encode).toHaveBeenCalledWith(
      {
        payload: {
          claim: { userId: user.id },
          intent: "reset_credential",
        },
      },
    );
  });

  it("does not reveal whether a reset email is unregistered", async () => {
    mocks.getByEmail.mockResolvedValue(null);

    await expect(
      new AuthService(context, logger).forgotPassword({ email: user.email }),
    ).resolves.toBeNull();
    expect(mocks.encode).not.toHaveBeenCalled();
  });

  it("resets a password using a reset-credential token", async () => {
    await new AuthService(context, logger).resetPassword({
      token: "reset-token",
      newPassword: "newPassword123",
    });

    expect(mocks.decode).toHaveBeenCalledWith(
      { token: "reset-token", verify: { intent: "reset_credential" } },
    );
    expect(mocks.update).toHaveBeenCalledWith(user.id, {
      passwordHash: "new-hash",
    });
  });

  it("fails reset when the token user no longer exists", async () => {
    mocks.getById.mockResolvedValue(null);

    await expect(
      new AuthService(context, logger).resetPassword({
        token: "reset-token",
        newPassword: "newPassword123",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("activates an unverified user", async () => {
    await new AuthService(context, logger).activateUser({
      token: "activation-token",
    });

    expect(mocks.decode).toHaveBeenCalledWith(
      {
        token: "activation-token",
        verify: { intent: "email_verification" },
      },
    );
    expect(mocks.update).toHaveBeenCalledWith(user.id, { isVerfied: true });
  });

  it("does not update a user who is already verified", async () => {
    mocks.getById.mockResolvedValue({ ...user, isVerfied: true });

    await new AuthService(context, logger).activateUser({
      token: "activation-token",
    });

    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("fails activation when the user no longer exists", async () => {
    mocks.getById.mockResolvedValue(null);

    await expect(
      new AuthService(context, logger).activateUser({
        token: "activation-token",
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
