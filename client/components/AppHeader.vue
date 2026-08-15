<template>
  <header class="w-full border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <NuxtLink to="/"
        class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-400">
        UrlShortener
      </NuxtLink>
      <nav class="flex items-center gap-4 text-sm font-medium">
        <ClientOnly>
          <div class="flex items-center gap-4">
            <template v-if="!userStore.isLoggedIn">
              <NuxtLink to="/login" class="text-slate-600 hover:text-brand-600 transition-colors">Login</NuxtLink>
              <NuxtLink to="/register"
                class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md shadow-brand-500/20">
                Sign Up</NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/dashboard" class="text-slate-600 hover:text-brand-600 transition-colors">Dashboard
              </NuxtLink>
              <button type="button" @click="handleLogout"
                class="text-red-500 hover:text-red-600 transition-colors">Logout</button>
            </template>
          </div>
        </ClientOnly>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();

const handleLogout = async () => {
  await userStore.logout();
  navigateTo("/");
};

</script>
