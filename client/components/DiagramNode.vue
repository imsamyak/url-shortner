<template>
  <component :is="interactive ? 'button' : 'div'" :type="interactive ? 'button' : undefined" class="rounded-2xl border p-3 text-left shadow-sm" :class="[toneClass, interactive ? 'transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-500/10' : '']">
    <p class="text-[9px] font-black uppercase tracking-[0.12em] opacity-70">{{ eyebrow }}</p>
    <span class="mt-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-800 shadow-sm">{{ icon }}</span>
    <span class="mt-3 block text-sm font-black text-slate-950">{{ title }}</span>
    <span class="mt-1 block text-[10px] leading-4 text-slate-500">{{ description }}</span>
  </component>
</template>

<script setup lang="ts">
const props = defineProps<{ eyebrow: string; title: string; icon: string; description: string; tone: "slate" | "cyan" | "amber"; interactive?: boolean }>();
const toneClass = computed(() => ({ slate: "border-slate-200 bg-slate-100", cyan: "border-cyan-200 bg-cyan-50", amber: "border-amber-200 bg-amber-50" })[props.tone]);
</script>
