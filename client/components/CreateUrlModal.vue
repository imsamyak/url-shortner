<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
    <div class="glass-card w-full max-w-lg p-6 relative">
      <button type="button" @click="$emit('close')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h3 class="text-xl font-bold text-slate-900 mb-6">Create Short URL</h3>

      <form @submit.prevent="createUrl" class="space-y-4">
        <div v-if="createError" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
          {{ createError }}
        </div>

        <div>
          <label for="origin-url" class="block text-sm font-medium text-slate-700 mb-1">Original URL <span
              class="text-red-500">*</span></label>
          <input id="origin-url" v-model="form.origin" type="url" required class="input-field"
            placeholder="https://example.com/very/long/path" />
        </div>

        <div>
          <label for="expires-at" class="block text-sm font-medium text-slate-700 mb-1">Expiration Date
            (Optional)</label>
          <input id="expires-at" v-model="form.expiresAt" type="date" :min="minDate" class="input-field" />
          <p class="text-xs text-slate-500 mt-1">Leave blank for no expiration. Sets to end of day (23:59).</p>
        </div>

        <div class="pt-4 flex justify-end gap-3">
          <button type="button" @click="$emit('close')" class="btn-secondary">Cancel</button>
          <button type="submit" :disabled="creating" class="btn-primary">
            {{ creating ? 'Creating...' : 'Create URL' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRedirectStore } from "~/stores/redirect";

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const redirectStore = useRedirectStore()
const creating = ref(false)
const createError = ref('')
const form = reactive({
  origin: '',
  expiresAt: ''
})

// Returns YYYY-MM-DD for today so past dates cannot be clicked
const minDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

const createUrl = async () => {
  creating.value = true
  createError.value = ''

  try {
    const payload: { origin: string; expiresAt?: string } = { origin: form.origin }
    if (form.expiresAt) {
      // Set to 23:59:59.999 (last second of the selected date)
      payload.expiresAt = new Date(`${form.expiresAt}T23:59:59.999`).toISOString()
    }

    await redirectStore.create(payload)

    form.origin = ''
    form.expiresAt = ''
    emit('created')
    emit('close')
  } catch (err: any) {
    createError.value = err.data?.statusMessage || 'Failed to create URL'
  } finally {
    creating.value = false
  }
}
</script>
