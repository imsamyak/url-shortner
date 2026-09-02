<template>
  <div class="grid gap-5 lg:grid-cols-[5rem_1fr] lg:items-start">
    <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-900/15 dark:bg-brand-600">{{ number }}</span>
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">{{ eyebrow }}</p>
      <h2 class="mt-2 max-w-4xl text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">{{ title }}</h2>
      <p class="mt-4 max-w-4xl text-sm leading-7 text-slate-500 sm:text-base">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  number: string;
  eyebrow: string;
  title: string;
  text: string;
}>();
</script>
