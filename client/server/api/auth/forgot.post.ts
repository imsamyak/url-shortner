import AuthGateway from "~/server/gateway/auth.gateway";


export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ email: string }>(event);
    const gateway = new AuthGateway();
    await gateway.forgotPassword({ email: body.email });
    return { message: "Password reset email sent" };
  } catch (error: any) {
    throw createError({
      message: "Failed to send reset email",
      cause: error,
    });
  }
});
