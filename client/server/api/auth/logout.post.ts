import AuthGateway from "~/server/gateway/auth.gateway";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "auth_token");
  const gateway = new AuthGateway(token);

  try {
    await gateway.logout();
  } catch (err) {
    console.error(err, "API Error: logout failed");
  } finally {
    deleteCookie(event, "auth_token", {
      path: "/",
    });
  }

  return { message: "Logged out successfully" };
});
