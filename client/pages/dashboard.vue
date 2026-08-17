<template>
  <div class="max-w-5xl mx-auto w-full p-6">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p class="text-slate-500">Manage your shortened URLs</p>
      </div>
      <button type="button" @click="showModal = true" class="btn-primary">
        + Create New URL
      </button>
    </div>

    <UrlList :redirects="redirectStore.items || []" :has-more="redirectStore.isLoading" :error="error"
      @refresh="loadRedirects(true)" @open-modal="showModal = true" />

    <CreateUrlModal :show="showModal" @close="showModal = false" @created="loadRedirects(true)" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRedirectStore } from '~/stores/redirect'

const redirectStore = useRedirectStore()

const error = ref<string | null>(null)

const loadRedirects = async (force = false) => {
  error.value = null;
  const res = await redirectStore.load(force);
  if (!res.success) {
    error.value = res.message;
  }
}

// Fast initial load (50ms) on both SSR and CSR
await loadRedirects();

onMounted(() => {
  loadRedirects();
})

// Modal State
const showModal = ref(false)
</script>
