export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (event) => {
    console.log(`[Nuxt Server] ${event.method} ${event.path} - START`);
  });

  nitroApp.hooks.hook('afterResponse', (event) => {
    const status = getResponseStatus(event);
    console.log(`[Nuxt Server] ${event.method} ${event.path} - END (${status})`);
  });

  nitroApp.hooks.hook('error', (error, event) => {
    console.error(`[Nuxt Server] ERROR on ${event?.method} ${event?.path}:`, error);
  });
});
