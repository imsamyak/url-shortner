// Nuxt owns all client-service environment access. Application code consumes the
// typed runtime config through Nuxt's auto-imported `useRuntimeConfig` helper.
const apiUrl = process.env.NUXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const isProduction = process.env.NODE_ENV === "production";

export default defineNuxtConfig({
  srcDir: ".",
  compatibilityDate: "2024-11-01",
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      ],
      meta: [
        { name: "theme-color", content: "#f8fafc" },
      ],
      script: [
        {
          innerHTML: `(function () {
            try {
              var savedTheme = localStorage.getItem("linkora-theme");
              var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              var isDark = savedTheme ? savedTheme === "dark" : prefersDark;
              document.documentElement.classList.toggle("dark", isDark);
              document.documentElement.style.colorScheme = isDark ? "dark" : "light";
              document.querySelector('meta[name="theme-color"]')?.setAttribute("content", isDark ? "#1e293b" : "#f8fafc");
            } catch (_) {}
          })();`,
          tagPosition: "head",
        },
      ],
    },
  },
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
