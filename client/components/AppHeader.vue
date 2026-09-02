<template>
  <header class="fixed inset-x-0 top-0 z-[60] border-b border-white/70 bg-white/75 backdrop-blur-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900/95">
    <div class="page-shell flex h-18 items-center justify-between py-3">
      <NuxtLink to="/" class="group flex items-center gap-3" aria-label="Linkora home">
        <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15 transition group-hover:-rotate-3 group-hover:bg-brand-700">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
          </svg>
        </span>
        <span>
          <span class="block text-lg font-black tracking-tight text-slate-950 dark:text-white">Linkora</span>
          <span class="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:block">Link workspace</span>
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-1 text-sm font-semibold sm:gap-2" aria-label="Main navigation">
        <NuxtLink
          v-if="!isArchitecturePage"
          to="/architecture"
          class="header-action"
          aria-label="View service architecture"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="8.5" y="14" width="7" height="7" rx="2" />
            <path d="M6.5 10v2h11v-2M12 12v2" />
          </svg>
          <span class="hidden lg:inline">Architecture</span>
        </NuxtLink>
        <NuxtLink
          v-else
          to="/"
          class="header-action"
          aria-label="Return to the Linkora app"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m3 11 9-7 9 7M5 10v10h14V10M9 20v-6h6v6" />
          </svg>
          <span class="hidden lg:inline">App</span>
        </NuxtLink>

        <a
          href="https://github.com/imsamyak/url-shortner"
          target="_blank"
          rel="noopener noreferrer"
          class="header-action"
          aria-label="Open Linkora on GitHub in a new tab"
        >
          <svg class="h-[1.1rem] w-[1.1rem]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.23c-3.22.7-3.9-1.37-3.9-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.57-.29-5.27-1.29-5.27-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.19-1.49 3.16-1.18 3.16-1.18.63 1.58.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.4-2.71 5.38-5.29 5.67.42.36.79 1.07.79 2.16v3.21c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .7Z" />
          </svg>
          <span class="hidden lg:inline">GitHub</span>
          <svg class="hidden h-3 w-3 lg:block" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.22 14.78a.75.75 0 0 0 1.06 0l7-7v4.47a.75.75 0 0 0 1.5 0V6a.75.75 0 0 0-.75-.75H7.75a.75.75 0 0 0 0 1.5h4.47l-7 7a.75.75 0 0 0 0 1.06Z" /></svg>
        </a>

        <button
          type="button"
          class="header-action !w-10 justify-center !px-0 dark:border dark:border-brand-500/30 dark:bg-slate-900"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to night mode'"
          :title="isDark ? 'Light mode' : 'Night mode'"
          @click="toggleTheme"
        >
          <ClientOnly>
            <svg v-if="isDark" class="h-[1.1rem] w-[1.1rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="4" /><path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </svg>
            <svg v-else class="h-[1.1rem] w-[1.1rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.4 15.1A8.5 8.5 0 0 1 8.9 3.6 8.5 8.5 0 1 0 20.4 15.1Z" />
            </svg>
            <template #fallback>
              <svg class="h-[1.1rem] w-[1.1rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M20.4 15.1A8.5 8.5 0 0 1 8.9 3.6 8.5 8.5 0 1 0 20.4 15.1Z" /></svg>
            </template>
          </ClientOnly>
        </button>

        <ClientOnly>
          <template v-if="!userStore.isLoggedIn">
            <NuxtLink to="/login" class="rounded-xl px-2.5 py-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:px-4">Log in</NuxtLink>
            <NuxtLink to="/register" class="btn-primary hidden !rounded-xl !px-4 !py-2.5 sm:inline-flex">Start free</NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/dashboard" class="hidden rounded-xl px-4 py-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:block">Dashboard</NuxtLink>
            <div class="ml-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pl-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
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
import { useTheme } from "~/composables/useTheme";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const route = useRoute();
const { isDark, toggleTheme } = useTheme();
const userInitial = computed(() => userStore.profile?.name?.charAt(0) || "U");
const isArchitecturePage = computed(() => route.path === "/architecture");

const handleLogout = async () => {
  await userStore.logout();
  await navigateTo("/");
};
</script>
