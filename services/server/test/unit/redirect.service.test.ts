import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ResourceAlreadyExistsError,
  ResourceNotFoundError,
} from "@app/error";
import { createTestLogger } from "../helpers/logger";

const mocks = vi.hoisted(() => ({
  put: vi.fn(),
  get: vi.fn(),
  getByAuthor: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../../src/core/repository/redirect.repository", () => ({
  default: {
    put: mocks.put,
    get: mocks.get,
    getByAuthor: mocks.getByAuthor,
    delete: mocks.delete,
  },
}));

import RedirctService from "../../src/core/service/redirct.service";

describe("RedirctService", () => {
  const logger = createTestLogger();
  const context = { userId: "user-1" };
  const redirect = {
    id: "short1",
    origin: "https://example.com/path",
    createdAt: "2026-08-29T10:00:00.000Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.put.mockResolvedValue(redirect);
    mocks.get.mockResolvedValue(redirect);
    mocks.getByAuthor.mockResolvedValue({ items: [redirect] });
    mocks.delete.mockResolvedValue(undefined);
  });

  it("creates a redirect for the authenticated user", async () => {
    await expect(
      new RedirctService(context, logger).createRedirect({
        origin: redirect.origin,
      }),
    ).resolves.toEqual(redirect);

    expect(mocks.put).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        origin: redirect.origin,
      }),
      context.userId,
    );
  });

  it("retries a generated short-id collision", async () => {
    mocks.put
      .mockRejectedValueOnce(
        new ResourceAlreadyExistsError({ resource: "URL", id: redirect.id }),
      )
      .mockResolvedValueOnce(redirect);

    await expect(
      new RedirctService(context, logger).createRedirect({
        origin: redirect.origin,
      }),
    ).resolves.toEqual(redirect);
    expect(mocks.put).toHaveBeenCalledTimes(2);
  });

  it("returns a redirect by short id", async () => {
    await expect(
      new RedirctService(context, logger).getRedirect(redirect.id),
    ).resolves.toEqual(redirect);
  });

  it("throws when a short id does not exist", async () => {
    mocks.get.mockResolvedValue(null);

    await expect(
      new RedirctService(context, logger).getRedirect("missing"),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it("lists redirects newest-first and normalizes an absent cursor", async () => {
    const result = await new RedirctService(
      context,
      logger,
    ).getRedirectsByAuthor({ cursor: "cursor", limit: 10 });

    expect(mocks.getByAuthor).toHaveBeenCalledWith(context.userId, {
      cursor: "cursor",
      limit: 10,
      sort: "desc",
    });
    expect(result).toEqual({ items: [redirect], cursor: null });
  });

  it("deletes only through the authenticated user's repository scope", async () => {
    await new RedirctService(context, logger).deleteUrl({
      shortId: redirect.id,
    });

    expect(mocks.delete).toHaveBeenCalledWith(redirect.id, context.userId);
  });
});
