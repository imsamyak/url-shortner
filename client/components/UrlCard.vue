<template>
  <article class="group rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg hover:shadow-slate-900/5 sm:p-5">
    <div class="flex items-start gap-4">
      <div class="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition group-hover:bg-brand-50 group-hover:text-brand-700 sm:flex">↗</div>
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <a :href="redirect.url" target="_blank" rel="noopener noreferrer" class="block truncate text-base font-black text-slate-950 hover:text-brand-700">{{ redirect.url }}</a>
            <a :href="redirect.origin" target="_blank" rel="noopener noreferrer" class="mt-1 block truncate text-sm text-slate-500 hover:text-slate-800" :title="redirect.origin">{{ redirect.origin }}</a>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <button type="button" class="icon-button !h-9 !w-9" title="Copy short URL" aria-label="Copy short URL" @click="copy">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            </button>
            <button type="button" class="icon-button !h-9 !w-9 hover:!border-red-200 hover:!bg-red-50 hover:!text-red-600" title="Delete URL" aria-label="Delete URL" @click="showDeleteModal = true">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2m-9 0 1 15h8l1-15M10 11v5m4-5v5" /></svg>
            </button>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400">
          <span class="rounded-lg bg-slate-100 px-2.5 py-1.5"><ClientOnly fallback="Created recently">Created {{ formatDate(redirect.createdAt) }}</ClientOnly></span>
          <span v-if="redirect.expiresAt" class="rounded-lg bg-amber-50 px-2.5 py-1.5 text-amber-700"><ClientOnly fallback="Scheduled expiry">Expires {{ formatDate(redirect.expiresAt) }}</ClientOnly></span>
          <span v-else class="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-700">No expiry</span>
        </div>
      </div>
    </div>
    <ConfirmDeleteModal :show="showDeleteModal" @close="showDeleteModal = false" @confirm="handleDelete" />
  </article>
</template>

<script setup lang="ts">
import { useRedirectStore } from "~/stores/redirect";
import type { Redirect } from "~/types";
import { useToast } from "~/composables/useToast";

const props = defineProps<{ redirect: Redirect }>();
const redirectStore = useRedirectStore();
const toast = useToast();
const showDeleteModal = ref(false);
const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));

const handleDelete = async () => {
  showDeleteModal.value = false;
  try {
    await redirectStore.delete(props.redirect.id);
    toast.success("URL deleted successfully");
  } catch (error: any) {
    toast.error(error.data?.message || "Failed to delete URL");
  }
};

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.redirect.url);
    toast.success("URL copied to clipboard");
  } catch {
    toast.error("Failed to copy URL");
  }
};
</script>
