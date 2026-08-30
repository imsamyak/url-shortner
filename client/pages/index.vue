<template>
  <div class="flex-1">
    <section class="page-shell grid min-h-[calc(100vh-9rem)] items-center gap-14 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
      <div>
        <div class="eyebrow mb-6">
          <span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
          Your links, under control
        </div>
        <h1 class="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
          Short links with a
          <span class="bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">long-term edge.</span>
        </h1>
        <p class="mt-7 max-w-xl text-lg leading-8 text-slate-600">
          Turn unwieldy URLs into clean, dependable links. Set expirations, organize every destination, and keep control from one focused workspace.
        </p>
        <div class="mt-9 flex flex-col gap-3 sm:flex-row">
          <NuxtLink to="/register" class="btn-primary !px-7 !py-4">
            Create your workspace
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.69L10.22 5.03a.75.75 0 0 1 1.06-1.06l5.5 5.5a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 1 1-1.06-1.06l4.22-4.22H3.75A.75.75 0 0 1 3 10Z" clip-rule="evenodd" /></svg>
          </NuxtLink>
          <NuxtLink to="/login" class="btn-secondary !px-7 !py-4">Open dashboard</NuxtLink>
        </div>
        <div class="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
          <span class="flex items-center gap-2"><span class="text-emerald-500">✓</span> Free to start</span>
          <span class="flex items-center gap-2"><span class="text-emerald-500">✓</span> Expiring links</span>
          <span class="flex items-center gap-2"><span class="text-emerald-500">✓</span> Secure workspace</span>
        </div>
      </div>

      <div class="relative mx-auto w-full max-w-xl">
        <div class="absolute -inset-8 rounded-full bg-gradient-to-br from-brand-300/30 to-cyan-300/20 blur-3xl" />
        <div class="surface-card relative overflow-hidden p-3 sm:p-5">
          <div class="rounded-[1.35rem] bg-slate-950 p-5 text-white sm:p-7">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Live workspace</span>
              <span class="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">Active</span>
            </div>
            <p class="mt-9 text-sm text-slate-400">Your short link</p>
            <div class="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p class="min-w-0 truncate text-lg font-bold text-cyan-300">linkora.dev/s/launch</p>
              <span class="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950">Copy</span>
            </div>
            <div class="mt-5 grid grid-cols-2 gap-3">
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p class="text-xs text-slate-400">Links managed</p>
                <p class="mt-2 text-3xl font-black">128</p>
              </div>
              <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p class="text-xs text-slate-400">Availability</p>
                <p class="mt-2 text-3xl font-black">99.9%</p>
              </div>
            </div>
          </div>
          <div class="grid gap-3 p-3 pt-5 sm:grid-cols-3">
            <div v-for="feature in features" :key="feature.title" class="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div class="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm">{{ feature.icon }}</div>
              <p class="text-sm font-black text-slate-900">{{ feature.title }}</p>
              <p class="mt-1 text-xs leading-5 text-slate-500">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const features = [
  { icon: "↗", title: "Clean links", description: "Share a URL people can trust." },
  { icon: "◷", title: "Smart expiry", description: "Choose when access should end." },
  { icon: "⌁", title: "One dashboard", description: "Keep every destination organized." },
];

useHead({ title: "Linkora — Links with a long-term edge" });
</script>
