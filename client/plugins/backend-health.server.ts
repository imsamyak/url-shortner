const SUCCESS_INTERVAL_MS = 5 * 60 * 1_000;
const FAILURE_RETRY_INTERVAL_MS = 30 * 1_000;
const REQUEST_TIMEOUT_MS = 60 * 1_000;

let inFlightWakeUp: Promise<void> | undefined;
let nextWakeUpAt = 0;

/** Wakes a sleeping backend once and shares the request across concurrent SSR renders. */
async function wakeBackend(healthCheckUrl: string): Promise<void> {
  if (!healthCheckUrl || Date.now() < nextWakeUpAt) return;

  if (!inFlightWakeUp) {
    inFlightWakeUp = $fetch(healthCheckUrl, {
      method: "GET",
      retry: 0,
      timeout: REQUEST_TIMEOUT_MS,
    })
      .then(() => {
        nextWakeUpAt = Date.now() + SUCCESS_INTERVAL_MS;
      })
      .catch((error: unknown) => {
        nextWakeUpAt = Date.now() + FAILURE_RETRY_INTERVAL_MS;
        console.warn("[backend-health] Unable to wake the backend:", error);
      })
      .finally(() => {
        inFlightWakeUp = undefined;
      });
  }

  await inFlightWakeUp;
}

export default defineNuxtPlugin(async () => {
  const { healthCheckUrl } = useRuntimeConfig();
  await wakeBackend(healthCheckUrl);
});
