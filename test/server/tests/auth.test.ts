import { describe, it, expect } from "vitest";
import { api } from "./utils/client";

describe("Auth API (E2E)", () => {
  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    password: "password123",
  };

  it("POST /auth/register - Should successfully register a new user", async () => {
    const res = await api("/auth/register", {
      method: "POST",
      body: testUser,
    });
    expect(res.message).toBe("Registration successful");
    expect(res.data.user).toBeDefined();
    expect(res.data.user.email).toBe(testUser.email);
    expect(res.data.token).toBeDefined();
  });

  it("POST /auth/register - Should fail if email already exists", async () => {
    const res = await api("/auth/register", {
      method: "POST",
      body: testUser,
    });
    expect(res.error).toBeDefined();
    // Assuming backend returns an error message for existing users
  });

  it("POST /auth/login - Should successfully login the user", async () => {
    const res = await api("/auth/login", {
      method: "POST",
      body: {
        email: testUser.email,
        password: testUser.password,
      },
    });
    console.log("LOGIN RESPONSE:", res);
    expect(res.message).toBe("Login successful");
    expect(res.data.user).toBeDefined();
    expect(res.data.token).toBeDefined();
  });

  it("POST /auth/login - Should fail with invalid password", async () => {
    const res = await api("/auth/login", {
      method: "POST",
      body: {
        email: testUser.email,
        password: "wrongpassword",
      },
    });
    expect(res.error).toBeDefined();
  });

  it("POST /auth/forgot-password - Should generate a reset link", async () => {
    const res = await api("/auth/forgot-password", {
      method: "POST",
      body: { email: testUser.email },
    });
    expect(res.message).toBeDefined();
    expect(res.error).toBeUndefined();
  });
});
