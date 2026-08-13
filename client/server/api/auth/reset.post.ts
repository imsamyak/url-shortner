import AuthGateway from "~/server/gateway/auth.gateway";


export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ token: string; newPassword?: string }>(event);
    const gateway = new AuthGateway();
    await gateway.resetPassword({
      token: body.token,
      newPassword: body.newPassword || "", // Backend expects newPassword
    });
    return { message: "Password has been reset" };
  } catch (error: any) {
    throw createError({
      message: "Failed to reset password",
      cause: error,
    });
  }
});
