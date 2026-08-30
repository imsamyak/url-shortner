import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceNotFoundError } from "@app/error";
import { createTestLogger } from "../helpers/logger";

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  getById: vi.fn(),
}));

vi.mock("../../src/core/repository/user.repository", () => ({
  default: {
    update: mocks.update,
    getById: mocks.getById,
  },
}));

import UserService from "../../src/core/service/user.service";

describe("UserService", () => {
  const logger = createTestLogger();
  const context = { userId: "user-1" };
  const user = {
    id: context.userId,
    name: "Ada",
    email: "ada@example.com",
    passwordHash: "hash",
    isVerfied: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.update.mockResolvedValue(user);
    mocks.getById.mockResolvedValue(user);
  });

  it("updates the authenticated user's profile", async () => {
    await new UserService(context, logger).updateProfile({ name: "Grace" });

    expect(mocks.update).toHaveBeenCalledWith(context.userId, {
      name: "Grace",
    });
  });

  it("returns a profile without authentication fields", async () => {
    await expect(
      new UserService(context, logger).getProfile(),
    ).resolves.toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  });

  it("throws when the authenticated user no longer exists", async () => {
    mocks.getById.mockResolvedValue(null);

    await expect(
      new UserService(context, logger).getProfile(),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
