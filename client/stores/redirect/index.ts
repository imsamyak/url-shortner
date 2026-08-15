import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Redirect } from "~/types";

let cache: Promise<void> | null = null;

export const useRedirectStore = defineStore("urls", () => {
  const items = ref<Redirect[] | null>(null);
  const isInitialLoading = ref(false);
  const isDraining = ref(false);

  // Private to the store — Nuxt useState hydrates this from SSR to client
  const cursor = useState<string | null>("urls_cursor", () => null);

  const fetcher = useRequestFetch();

  // Fetches a single batch (50ms). Awaited by setup on both SSR & CSR.
  async function loadInitialBatch() {
    const res = await fetcher("/api/user/redirects", {
      query: {
        ...(cursor.value && { cursor: cursor.value }),
      },
    });

    const newItems = res.data?.items ?? [];
    if (items.value === null) {
      items.value = newItems;
    } else {
      items.value = [...items.value, ...newItems];
    }

    cursor.value = res.data?.cursor ?? null;
  }

  // Background stream for remaining pages — NON-BLOCKING (floating promise)
  async function drainRemaining() {
    if (import.meta.server || isDraining.value || !cursor.value) {
      return;
    }

    isDraining.value = true;

    try {
      while (cursor.value) {
        if (!cursor.value) break;

        const query: any = {};
        if (cursor.value) query.cursor = cursor.value;

        const res = await $fetch("/api/user/redirects", {
          query,
        });

        items.value ??= [];
        items.value.push(...res.data.items);

        cursor.value = res.data?.cursor ?? null;
      }
    } catch (err) {
      console.error("Background fetch error:", err);
    } finally {
      isDraining.value = false;
    }
  }

  // 1. Initial page load (Fast 50ms)
  async function load(force = false) {
    if (cache) {
      await cache;
      return { success: true, message: "Urls fetched successfully" };
    }

    if (force) {
      items.value = null;
      cursor.value = null;
    }

    // Return early if items exist AND all pages have been fetched
    if (items.value !== null && cursor.value === null && !force) {
      return { success: true, message: "Urls fetched successfully" };
    }

    // If items already exist from SSR/previous fetch, just trigger background drain
    if (items.value !== null && cursor.value !== null && !force) {
      if (import.meta.client) {
        drainRemaining(); // Floating promise - does not block setup!
      }
      return { success: true, message: "Urls fetched successfully" };
    }

    try {
      isInitialLoading.value = true;
      cache = loadInitialBatch().finally(() => {
        cache = null;
        isInitialLoading.value = false;
      });
      await cache;

      // After initial batch completes on client, start background drain non-blockingly
      if (import.meta.client && cursor.value) {
        drainRemaining(); // Floating promise - does not block page transition!
      }

      return { success: true, message: "Urls fetched successfully" };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || "Failed to fetch urls",
      };
    } finally {
      cache = null;
      isInitialLoading.value = false;
    }
  }

  async function create(params: { origin: string; expiresAt?: string }) {
    const res = await $fetch<{ data?: { redirect: Redirect } }>(
      "/api/redirect",
      {
        method: "POST",
        body: params,
      },
    );
    if (items.value && res.data?.redirect) {
      items.value.unshift(res.data.redirect);
    }
  }

  async function remove(id: string) {
    await $fetch(`/api/redirect/${id}`, { method: "DELETE" });
    if (items.value) {
      items.value = items.value.filter((item) => item.id !== id);
    }
  }

  return {
    items,
    isLoading: computed(() => isInitialLoading.value || isDraining.value),
    load,
    create,
    remove,
    delete: remove,
  };
});
