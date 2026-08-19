import { describe, it, expect, beforeAll } from "vitest";
import { api } from "./utils/client";

describe("REDIRECT API (E2E)", () => {
  let authToken = "";
  const testUser = {
    name: `REDIRECT Tester ${Date.now()}`,
    email: `redirect-${Date.now()}@example.com`,
    password: "password123",
  };

  beforeAll(async () => {
    const res = await api("/auth/register", {
      method: "POST",
      body: testUser,
    });
    authToken = res.data.token;
  });

  let createdShortId = "";

  it("POST /redirect - Should create a shortened URL", async () => {
    const res = await api("/redirect", {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        origin: "https://example.com/very/long/path/that/needs/shortening",
      },
    });
    console.log("CREATE REDIRECT RESPONSE:", res);
    expect(res.message).toBe("Short URL created successfully");
    expect(res.data.redirect.id).toBeDefined();
    createdShortId = res.data.redirect.id;
  });

  it("DELETE /redirect/:shortId - Should delete the URL", async () => {
    const res = await api(`/redirect/${createdShortId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });
    expect(res.message).toBe("URL deleted successfully");
  });
});
