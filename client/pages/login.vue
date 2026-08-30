<template>
  <div class="page-shell flex flex-1 items-center justify-center py-12 sm:py-20">
    <div class="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[.9fr_1.1fr]">
      <aside class="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div class="eyebrow !border-white/10 !bg-white/5 !text-cyan-300">Welcome back</div>
        <div>
          <blockquote class="text-3xl font-black leading-tight tracking-tight">“The shortest path from an idea to its audience.”</blockquote>
          <p class="mt-5 text-sm leading-6 text-slate-400">Return to your workspace and keep every destination current.</p>
        </div>
        <div class="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500"><span class="h-px w-8 bg-slate-700" /> Linkora workspace</div>
      </aside>

      <section class="p-7 sm:p-10 lg:p-12">
        <div class="mb-8">
          <p class="text-sm font-bold text-brand-600">Account access</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950">Log in to your workspace</h1>
          <p class="mt-2 text-sm leading-6 text-slate-500">Manage links, expirations, and destinations from one place.</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div v-if="error" role="alert" class="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <span aria-hidden="true">!</span><span>{{ error }}</span>
          </div>
          <div>
            <label for="email" class="mb-2 block text-sm font-bold text-slate-700">Email address</label>
            <input id="email" v-model="form.email" type="email" autocomplete="email" required class="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label for="password" class="mb-2 block text-sm font-bold text-slate-700">Password</label>
            <input id="password" v-model="form.password" type="password" autocomplete="current-password" required class="input-field" placeholder="Enter your password" />
          </div>
          <button type="submit" :disabled="loading" class="btn-primary w-full !py-3.5">
            <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z" /></svg>
            {{ loading ? "Signing in…" : "Sign in" }}
          </button>
        </form>

        <p class="mt-7 text-center text-sm text-slate-500">New to Linkora? <NuxtLink to="/register" class="font-bold text-brand-700 hover:underline">Create an account</NuxtLink></p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const form = reactive({ email: "", password: "" });
const loading = ref(false);
const error = ref("");

const handleLogin = async () => {
  loading.value = true;
  error.value = "";
  try {
    const result = await userStore.login(form);
    if (result.success) await navigateTo("/dashboard");
    else error.value = result.message;
  } finally {
    loading.value = false;
  }
};
</script>
