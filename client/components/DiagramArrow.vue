<template>
  <div class="flex min-w-0 flex-col items-center justify-center text-brand-400"><span class="mb-1 text-[8px] font-black uppercase tracking-wide text-slate-400">{{ label }}</span><svg :class="compact ? 'h-4 w-4' : 'h-5 w-5'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M3 12h18m-5-5 5 5-5 5" /></svg></div>
</template>

<script setup lang="ts">
defineProps<{ label: string; compact?: boolean }>();
</script>
