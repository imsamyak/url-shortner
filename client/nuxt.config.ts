export default defineNuxtConfig({
  srcDir: ".",
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    pagination: {
      urlChunkSize: 20,
    },
    public: {
      apiUrl: "http://localhost:4000/api/v1",
    },
  },
});
