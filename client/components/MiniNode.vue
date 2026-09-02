<template>
  <div class="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white bg-white p-2 shadow-sm" :class="wide ? 'min-h-12' : ''"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-700">{{ icon }}</span><span class="truncate text-[10px] font-black text-slate-800">{{ title }}</span></div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; title: string; wide?: boolean }>();
</script>
