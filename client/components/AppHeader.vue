<template>
  <header class="sticky top-0 z-50 border-b border-white/70 bg-white/75 backdrop-blur-xl">
    <div class="page-shell flex h-18 items-center justify-between py-3">
      <NuxtLink to="/" class="group flex items-center gap-3" aria-label="Linkora home">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15 transition group-hover:-rotate-3 group-hover:bg-brand-700">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
          </svg>
        </span>
        <span>
          <span class="block text-lg font-black tracking-tight text-slate-950">Linkora</span>
          <span class="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">Link workspace</span>
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-2 text-sm font-semibold" aria-label="Main navigation">
        <NuxtLink
          to="/architecture"
          class="group flex h-10 items-center gap-2 rounded-xl px-2.5 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 sm:px-3"
          aria-label="View service architecture"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="8.5" y="14" width="7" height="7" rx="2" />
            <path d="M6.5 10v2h11v-2M12 12v2" />
          </svg>
          <span class="hidden md:inline">Architecture</span>
        </NuxtLink>
        <ClientOnly>
          <template v-if="!userStore.isLoggedIn">
            <NuxtLink to="/login" class="rounded-xl px-4 py-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Log in</NuxtLink>
            <NuxtLink to="/register" class="btn-primary !rounded-xl !px-4 !py-2.5">Start free</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/dashboard" class="hidden rounded-xl px-4 py-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 sm:block">Dashboard</NuxtLink>
            <div class="ml-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pl-2 shadow-sm">
              <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-100 text-xs font-black uppercase text-brand-700">
                {{ userInitial }}
              </span>
              <button type="button" class="rounded-xl px-2 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600" @click="handleLogout">
                Log out
              </button>
            </div>
          </template>
        </ClientOnly>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const userInitial = computed(() => userStore.profile?.name?.charAt(0) || "U");

const handleLogout = async () => {
  await userStore.logout();
  await navigateTo("/");
};
</script>
