import UserGateway from "~/server/gateway/user.gateway";

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, "auth_token");
    const gateway = new UserGateway(token);
    const res = await gateway.getProfile();

    return { message: "Profile fetched successfully", data: res.data };
  } catch (error: any) {
    throw createError({
      statusCode: error.status || 401,
      message: "Failed to fetch profile",
      cause: error,
    });
  }
});
