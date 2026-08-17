import { useUserStore } from "~/stores/user";

export default defineNuxtRouteMiddleware(async (to, from) => {
  const userStore = useUserStore();

  // If not initialized, try to load profile to see if we're authenticated
  if (!userStore.isInitialized) {
    await userStore.load();
    userStore.isInitialized = true;
  }

  // If not authenticated, redirect to login ONLY if trying to access dashboard
  if (!userStore.isLoggedIn) {
    if (to.path === "/dashboard") {
      return navigateTo("/login");
    }
    return;
  }

  // If authenticated, redirect away from public auth routes & landing page to the dashboard
  if (to.path === "/login" || to.path === "/register" || to.path === "/") {
    return navigateTo("/dashboard");
  }
});
