<template>
  <div class="page-shell flex-1 py-10 sm:py-14">
    <div class="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
      <div>
        <div class="eyebrow mb-4">Workspace overview</div>
        <h1 class="text-4xl font-black tracking-[-0.035em] text-slate-950">Good to see you{{ firstName ? `, ${firstName}` : "" }}.</h1>
        <p class="mt-2 text-slate-500">Create, copy, and control every short link.</p>
      </div>
      <button type="button" class="btn-primary self-start !px-6 !py-3.5 lg:self-auto" @click="showModal = true">
        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
        New short link
      </button>
    </div>

    <div class="mb-7 grid gap-4 sm:grid-cols-3">
      <div v-for="stat in stats" :key="stat.label" class="surface-card p-5">
        <div class="flex items-start justify-between">
          <div><p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{{ stat.label }}</p><p class="mt-2 text-3xl font-black text-slate-950">{{ stat.value }}</p></div>
          <span class="flex h-10 w-10 items-center justify-center rounded-2xl" :class="stat.color">{{ stat.icon }}</span>
        </div>
      </div>
    </div>

    <section class="surface-card overflow-hidden">
      <div class="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
        <div><h2 class="text-lg font-black text-slate-950">Your links</h2><p class="mt-1 text-sm text-slate-500">Most recently created first</p></div>
        <button type="button" class="text-sm font-bold text-brand-700 hover:underline" @click="loadRedirects(true)">Refresh list</button>
      </div>
      <div class="p-4 sm:p-6">
        <UrlList :redirects="redirectStore.items || []" :has-more="redirectStore.isLoading" :error="error" @refresh="loadRedirects(true)" @open-modal="showModal = true" />
      </div>
    </section>

    <CreateUrlModal :show="showModal" @close="showModal = false" @created="loadRedirects(true)" />
  </div>
</template>

<script setup lang="ts">
import { useRedirectStore } from "~/stores/redirect";
import { useUserStore } from "~/stores/user";

const redirectStore = useRedirectStore();
const userStore = useUserStore();
const error = ref<string | null>(null);
const showModal = ref(false);
const firstName = computed(() => userStore.profile?.name?.split(" ")[0] || "");
const stats = computed(() => {
  const items = redirectStore.items || [];
  const expiring = items.filter((item) => item.expiresAt).length;
  return [
    { label: "Total links", value: items.length, icon: "↗", color: "bg-brand-50 text-brand-700" },
    { label: "No expiry", value: items.length - expiring, icon: "∞", color: "bg-emerald-50 text-emerald-700" },
    { label: "Scheduled", value: expiring, icon: "◷", color: "bg-amber-50 text-amber-700" },
  ];
});

const loadRedirects = async (force = false) => {
  error.value = null;
  const result = await redirectStore.load(force);
  if (!result.success) error.value = result.message;
};

await loadRedirects();
onMounted(() => loadRedirects());
</script>
