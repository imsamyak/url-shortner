import AuthGateway from "~/server/gateway/auth.gateway";


export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, "auth_token");
    const gateway = new AuthGateway(token);

    await gateway.logout();

    deleteCookie(event, "auth_token", {
      path: "/",
    });

    return { message: "Logged out successfully" };
  } catch (error: any) {
    throw createError({
      message: "Failed to logout",
      cause: error,
    });
  }
});
