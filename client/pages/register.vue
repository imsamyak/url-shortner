<template>
  <div class="page-shell flex flex-1 items-center justify-center py-12 sm:py-20">
    <div class="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-slate-900/10 lg:grid-cols-[.9fr_1.1fr]">
      <aside class="hidden bg-gradient-to-br from-brand-700 to-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div class="eyebrow !border-white/10 !bg-white/10 !text-cyan-200">Start free</div>
        <div>
          <h2 class="text-4xl font-black leading-tight tracking-tight">Make every link easier to share.</h2>
          <ul class="mt-7 space-y-4 text-sm text-indigo-100">
            <li v-for="benefit in benefits" :key="benefit" class="flex items-center gap-3"><span class="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs text-cyan-200">✓</span>{{ benefit }}</li>
          </ul>
        </div>
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300">No card required</p>
      </aside>

      <section class="p-7 sm:p-10 lg:p-12">
        <div class="mb-8">
          <p class="text-sm font-bold text-brand-600">Create your account</p>
          <h1 class="mt-2 text-3xl font-black tracking-tight text-slate-950">Build your link workspace</h1>
          <p class="mt-2 text-sm leading-6 text-slate-500">A few details and you’re ready to shorten.</p>
        </div>
        <form class="space-y-4" @submit.prevent="handleRegister">
          <div v-if="error" role="alert" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{{ error }}</div>
          <div>
            <label for="name" class="mb-2 block text-sm font-bold text-slate-700">Full name</label>
            <input id="name" v-model="form.name" type="text" autocomplete="name" required class="input-field" placeholder="Your name" />
          </div>
          <div>
            <label for="email" class="mb-2 block text-sm font-bold text-slate-700">Email address</label>
            <input id="email" v-model="form.email" type="email" autocomplete="email" required class="input-field" placeholder="you@example.com" />
          </div>
          <div>
            <label for="password" class="mb-2 block text-sm font-bold text-slate-700">Password</label>
            <input id="password" v-model="form.password" type="password" autocomplete="new-password" minlength="6" required class="input-field" placeholder="At least 6 characters" />
          </div>
          <button type="submit" :disabled="loading" class="btn-primary mt-2 w-full !py-3.5">{{ loading ? "Creating account…" : "Create account" }}</button>
        </form>
        <p class="mt-7 text-center text-sm text-slate-500">Already have an account? <NuxtLink to="/login" class="font-bold text-brand-700 hover:underline">Log in</NuxtLink></p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "~/stores/user";

const benefits = ["Organize every shortened URL", "Set UTC-backed expiration dates", "Keep the Express API private"];
const userStore = useUserStore();
const form = reactive({ email: "", name: "", password: "" });
const loading = ref(false);
const error = ref("");

const handleRegister = async () => {
  loading.value = true;
  error.value = "";
  try {
    const result = await userStore.register(form);
    if (result.success) await navigateTo("/dashboard");
    else error.value = result.message;
  } finally {
    loading.value = false;
  }
};
</script>
