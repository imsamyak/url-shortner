import AuthGateway from "~/server/gateway/auth.gateway";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{
      name: string;
      email: string;
      password: string;
    }>(event);

    const gateway = new AuthGateway();
    const res = await gateway.register(body);

    setCookie(event, "auth_token", res.data.token, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return {
      message: "Registration successful",
      data: res.data,
    };
  } catch (error: any) {
    throw createError({
      message: "Failed to register",
      cause: error,
    });
  }
});
