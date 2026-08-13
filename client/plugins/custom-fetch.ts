export default defineNuxtPlugin(() => {
  const customFetch = $fetch.create({
    onResponseError({ request, response, error }) {
      console.error(`[fetch error] ${request} - Status: ${response.status}`);
      console.error("Details:", response._data || error);
    },
    onRequestError({ request, error }) {
      console.error(`[fetch request error] ${request}`);
      console.error("Details:", error);
    },
  });

  // Overwrite the global $fetch instance
  globalThis.$fetch = customFetch;
});
