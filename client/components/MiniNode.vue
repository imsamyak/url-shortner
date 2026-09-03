<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    class="flex min-w-0 flex-1 gap-2 rounded-xl border border-white bg-white p-2 text-left shadow-sm"
    :class="[
      stacked ? 'min-h-[4.5rem] flex-col items-start justify-between' : 'items-center',
      wide ? 'min-h-12' : '',
      interactive ? 'cursor-pointer transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand-500/10' : '',
    ]"
  >
    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-700">{{ icon }}</span>
    <span class="text-[10px] font-black leading-4 text-slate-800" :class="stacked ? 'whitespace-normal' : 'truncate'">{{ title }}</span>
  </component>
</template>

<script setup lang="ts">
defineProps<{ icon: string; title: string; wide?: boolean; interactive?: boolean; stacked?: boolean }>();
</script>
