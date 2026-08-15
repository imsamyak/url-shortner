<template>
  <div class="glass-card p-6 flex flex-col group relative">
    <!-- Delete Button (appears on hover) -->
    <button type="button" @click="openDeleteConfirm"
      class="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      title="Delete URL">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd"
          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
          clip-rule="evenodd" />
      </svg>
    </button>

    <div class="mb-4 pr-6">
      <div class="text-sm font-semibold text-brand-600 mb-1 flex items-center gap-2">
        <a :href="redirect.url" target="_blank" class="hover:underline">{{ redirect.url }}</a>
        <button type="button" @click="copy" class="text-slate-400 hover:text-brand-600 transition-colors"
          title="Copy to clipboard">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
      <a :href="redirect.origin" target="_blank" class="text-slate-500 text-sm truncate block hover:text-slate-700"
        :title="redirect.origin">
        {{ redirect.origin }}
      </a>
    </div>

    <div class="mt-auto flex justify-between items-center text-xs text-slate-400 pt-4 border-t border-slate-100">
      <ClientOnly fallback="&nbsp">Created: {{ new Date(redirect.createdAt).toLocaleDateString() }}</ClientOnly>
      <span v-if="redirect.expiresAt" class="flex items-center gap-1 text-orange-500" title="Expires">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <ClientOnly fallback="&nbsp">{{ new Date(redirect.expiresAt).toLocaleDateString() }}</ClientOnly>
      </span>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmDeleteModal :show="showDeleteModal" @close="showDeleteModal = false" @confirm="handleDelete" />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { useRedirectStore } from "~/stores/redirect";
import type { Redirect } from "~/types";
import { useToast } from "~/composables/useToast";

const props = defineProps<{
  redirect: Redirect
}>()

const redirectStore = useRedirectStore()
const toast = useToast()

const showDeleteModal = ref(false)

const openDeleteConfirm = () => {
  showDeleteModal.value = true
}

const handleDelete = async () => {
  showDeleteModal.value = false
  try {
    await redirectStore.delete(props.redirect.id)
    toast.success('URL deleted successfully')
  } catch (err: any) {
    toast.error(err.data?.message || 'Failed to delete URL')
  }
}

const copy = async () => {
  const textToCopy = props.redirect.url;
  try {
    await navigator.clipboard.writeText(textToCopy);
    toast.success('URL copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy', err)
    toast.error('Failed to copy URL')
  }
}
</script>
