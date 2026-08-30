<template>
  <div>
    <div v-if="error" class="flex flex-col justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center">
      <span><strong>Couldn’t load your links.</strong> {{ error }}</span>
      <button type="button" class="font-bold underline" @click="$emit('refresh')">Try again</button>
    </div>

    <div v-else-if="redirects.length === 0" class="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-6 py-14 text-center">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl text-brand-700 shadow-sm">⌁</div>
      <h3 class="mt-5 text-lg font-black text-slate-900">Your workspace is ready</h3>
      <p class="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Create your first short link and it will appear here for quick access.</p>
      <button type="button" class="btn-primary mt-6" @click="$emit('open-modal')">Create first link</button>
    </div>

    <div v-else class="space-y-3">
      <UrlCard v-for="url in redirects" :key="url.id" :redirect="url" />
      <div v-if="hasMore" class="flex items-center justify-center gap-2 py-5 text-sm font-semibold text-slate-400">
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" /> Syncing links…
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Redirect } from "~/types";

defineProps<{ redirects: Redirect[]; hasMore: boolean; error?: string | null }>();
defineEmits<{ (event: "refresh"): void; (event: "open-modal"): void }>();
</script>
