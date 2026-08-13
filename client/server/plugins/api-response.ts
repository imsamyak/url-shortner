import ApiGatewayError from "../gateway/core/error";

export default defineNitroPlugin((nitroApp) => {
  // Intercept API errors to format them correctly
  nitroApp.hooks.hook("error", async (error: any, { event }) => {
    if (!event?.path.startsWith("/api/")) return;

    let status = 500;
    let cause = error.cause;

    // Extract original error status code from our Gateway wrapper
    if (cause instanceof ApiGatewayError) {
      status = cause.status;
    } else if (error.statusCode) {
      status = error.statusCode;
    }

    setResponseStatus(event, status);

    const responseBody = {
      message: error.message || "An unexpected error occurred",
      error: cause instanceof Error ? cause.message : String(cause || error),
    };

    // Send the formatted error response
    if (!event.handled) {
      // H3 send method
      await send(event, JSON.stringify(responseBody), "application/json");
    }
  });
});
