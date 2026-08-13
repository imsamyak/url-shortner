import UserGateway from "~/server/gateway/user.gateway";

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, "auth_token");
    const body = await readBody<{ name?: string }>(event);
    const gateway = new UserGateway(token);
    await gateway.updateProfile(body);

    return { message: "Profile updated successfully" };
  } catch (error: any) {
    throw createError({
      message: "Failed to update profile",
      cause: error,
    });
  }
});
