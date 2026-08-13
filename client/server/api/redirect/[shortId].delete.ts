import RedirectGateway from "~/server/gateway/redirect.gateway";

export default defineEventHandler(async (event) => {
  try {
    const shortId = event.context.params?.shortId;
    if (!shortId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing short ID",
      });
    }

    const token = getCookie(event, "auth_token");
    const gateway = new RedirectGateway(token);
    await gateway.delete(shortId);

    return { message: "URL deleted successfully" };
  } catch (error: any) {
    throw createError({
      message: "Failed to delete URL",
      cause: error,
    });
  }
});
