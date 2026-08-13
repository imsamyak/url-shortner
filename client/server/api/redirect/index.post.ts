import RedirectGateway from "~/server/gateway/redirect.gateway";

export default defineEventHandler(async (event) => {
  try {
    const token = getCookie(event, "auth_token");
    const body = await readBody<{ origin: string; expiresAt?: string }>(event);

    const gateway = new RedirectGateway(token);
    const res = await gateway.create(body);

    return { message: "URL created successfully", data: res.data };
  } catch (error: any) {
    throw createError({
      message: "Failed to create URL",
      cause: error,
    });
  }
});
