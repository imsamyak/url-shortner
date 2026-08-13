import AuthGateway from "~/server/gateway/auth.gateway";
import type { H3Event } from "h3";

function setAuthCookie(event: H3Event, token: string) {
  setCookie(event, "auth_token", token, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ email: string; password: string }>(event);

    const gateway = new AuthGateway();

    const res = await gateway.login({
      email: body.email,
      password: body.password,
    });

    setAuthCookie(event, res.data.token);
    return {
      message: "Login successful",
      data: {
        user: res.data.user,
      },
    };
  } catch (error: any) {
    throw createError({
      message: error?.message || "Failed to login",
      statusCode: error?.status || 401,
      cause: error,
    });
  }
});
