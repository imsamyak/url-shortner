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

    const gateway = new RedirectGateway();
    const res = await gateway.get(shortId);

    return { message: "URL fetched successfully", data: res.data };
  } catch (error: any) {
    throw createError({
      message: "Failed to fetch URL",
      cause: error,
    });
  }
});
