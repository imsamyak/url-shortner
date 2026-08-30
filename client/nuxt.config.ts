// Nuxt owns all client-service environment access. Application code consumes the
// typed runtime config through Nuxt's auto-imported `useRuntimeConfig` helper.
const apiUrl = process.env.NUXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const isProduction = process.env.NODE_ENV === "production";

export default defineNuxtConfig({
  srcDir: ".",
  compatibilityDate: "2024-11-01",
  // Keep the inspector out of production and preview builds.
  devtools: { enabled: !isProduction },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    pagination: {
      urlChunkSize: 20,
    },
    public: {
      apiUrl,
    },
  },
});
