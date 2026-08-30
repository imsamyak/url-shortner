import { expect, test } from "@playwright/test";
import { jwt } from "../../src/infra/security/jwt";

test.describe.configure({ mode: "serial" });

const runId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const user = {
  name: "API Test User",
  email: `api-${runId}@example.com`,
  password: "password123",
};


let userId = "";
let accessToken = "";
let shortId = "";

test("GET /health", async ({ request }) => {
  const response = await request.get("/health");

  expect(response.status()).toBe(200);
  await expect(response.json()).resolves.toMatchObject({ status: "OK" });
});

test("POST /api/v1/auth/register", async ({ request }) => {
  const response = await request.post("/api/v1/auth/register", { data: user });
  const body = await response.json();

  expect(response.status()).toBe(201);
  expect(body.message).toBe("Registration successful");
  expect(body.data.user).toMatchObject({ name: user.name, email: user.email });
  expect(body.data.user.passwordHash).toBeUndefined();
  expect(body.data.token).toEqual(expect.any(String));

  userId = body.data.user.id;
  accessToken = body.data.token;
});

test("POST /api/v1/auth/register rejects a duplicate", async ({ request }) => {
  const response = await request.post("/api/v1/auth/register", { data: user });
  const body = await response.json();

  expect(response.status()).toBe(409);
  expect(body.error.code).toBe("CONFLICT");
});

test("POST /api/v1/auth/login", async ({ request }) => {
  const response = await request.post("/api/v1/auth/login", {
    data: { email: user.email, password: user.password },
  });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.message).toBe("Login successful");
  expect(body.data.token).toEqual(expect.any(String));
});

test("POST /api/v1/auth/login rejects invalid credentials", async ({
  request,
}) => {
  const response = await request.post("/api/v1/auth/login", {
    data: { email: user.email, password: "wrong-password" },
  });

  expect(response.status()).toBe(401);
  expect((await response.json()).error.code).toBe("UNAUTHORIZED");
});

test("POST /api/v1/auth/forgot-password", async ({ request }) => {
  const response = await request.post("/api/v1/auth/forgot-password", {
    data: { email: user.email },
  });

  expect(response.status()).toBe(200);
  expect((await response.json()).message).toContain("Password reset link");
});

test("POST /api/v1/auth/reset-password", async ({ request }) => {
  const resetToken = jwt.encode({
    payload: {
      claim: { userId },
      intent: "reset_credential",
    },
  });
  const response = await request.post("/api/v1/auth/reset-password", {
    data: { token: resetToken, newPassword: "newPassword123" },
  });

  expect(response.status()).toBe(200);
  expect((await response.json()).message).toBe("Password reset successfully");
  user.password = "newPassword123";
});

test("POST /api/v1/auth/logout", async ({ request }) => {
  const response = await request.post("/api/v1/auth/logout", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  expect(response.status()).toBe(200);
  expect((await response.json()).message).toBe("Logged out successfully");
});

test("GET /api/v1/user", async ({ request }) => {
  const response = await request.get("/api/v1/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.data.user).toMatchObject({
    id: userId,
    name: user.name,
    email: user.email,
  });
});

test("PUT /api/v1/user", async ({ request }) => {
  const response = await request.put("/api/v1/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { name: "Updated API User" },
  });

  expect(response.status()).toBe(200);
  expect((await response.json()).message).toBe("Profile updated successfully");
});

test("POST /api/v1/redirect", async ({ request }) => {
  const response = await request.post("/api/v1/redirect", {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      origin: "https://example.com/destination",
      expiresAt: "2030-01-01T00:00:00.000Z",
    },
  });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.data.redirect).toMatchObject({
    origin: "https://example.com/destination",
    expiresAt: "2030-01-01T00:00:00.000Z",
  });
  shortId = body.data.redirect.id;
});

test("GET /api/v1/user/redirects", async ({ request }) => {
  const response = await request.get("/api/v1/user/redirects?limit=10", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body.message).toBe("Redirects fetched successfully");
  expect(body.data.items).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: shortId })]),
  );
});

test("GET /r/:shortId", async ({ request }) => {
  const response = await request.get(`/r/${shortId}`, { maxRedirects: 0 });

  expect(response.status()).toBe(302);
  expect(response.headers().location).toBe("https://example.com/destination");
});

test("DELETE /api/v1/redirect/:shortId", async ({ request }) => {
  const response = await request.delete(`/api/v1/redirect/${shortId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  expect(response.status()).toBe(200);
  expect((await response.json()).message).toBe("URL deleted successfully");
});

test("protected APIs reject missing authentication", async ({ request }) => {
  const response = await request.get("/api/v1/user");

  expect(response.status()).toBe(401);
  expect((await response.json()).error.code).toBe("UNAUTHORIZED");
});

test("GET /docs/swagger serves API documentation", async ({ request }) => {
  const response = await request.get("/docs/swagger/");

  expect(response.status()).toBe(200);
  expect(await response.text()).toContain("Swagger UI");
});
