import UserGateway from "~/server/gateway/user.gateway";

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    const token = getCookie(event, "auth_token");
    const gateway = new UserGateway(token);
    const res = await gateway.getRedirects({
      cursor: query.cursor as string | undefined,
      limit: config.pagination.urlChunkSize,
    });

    return { message: "URLs fetched successfully", data: res.data };
  } catch (error: any) {
    throw createError({
      message: "Failed to fetch URLs",
      cause: error,
    });
  }
});
