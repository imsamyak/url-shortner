<template>
  <div>
    <!-- Error State -->
    <div v-if="error"
      class="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-6 flex justify-between items-center">
      <span>Failed to load URLs: {{ error }}</span>
      <button type="button" @click="$emit('refresh')" class="text-sm font-semibold underline">Try again</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="redirects.length === 0"
      class="text-center p-12 glass-card border-dashed border-slate-300 bg-slate-50/50">
      <p class="text-slate-500 mb-4">You haven't shortened any URLs yet.</p>
      <button type="button" @click="$emit('open-modal')" class="btn-secondary">Shorten your first link</button>
    </div>

    <!-- Grid List -->
    <div v-else>
      <div class="flex flex-col gap-4 mb-6">
        <UrlCard v-for="url in redirects" :key="url.id" :redirect="url" />
      </div>

      <!-- Background Sync Loader -->
      <div v-if="hasMore" class="flex items-center justify-center py-4 text-slate-500 gap-2">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-500"></div>
        <span class="text-sm">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Redirect } from '~/types'

const props = defineProps<{
  redirects: Redirect[]
  hasMore: boolean
  error?: string | null
}>();


defineEmits<{
  (e: 'refresh'): void
  (e: 'open-modal'): void
}>()
</script>
