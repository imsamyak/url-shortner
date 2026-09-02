<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" @click.self="emit('close')">
      <div role="dialog" aria-modal="true" aria-labelledby="create-url-title" class="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl shadow-slate-950/30 dark:border-slate-700 dark:bg-slate-900">
        <div class="flex items-start justify-between border-b border-slate-100 p-6 sm:p-7">
          <div>
            <div class="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">↗</div>
            <h2 id="create-url-title" class="text-2xl font-black tracking-tight text-slate-950">Create a short link</h2>
            <p class="mt-1 text-sm text-slate-500">Add a destination and choose how long it lives.</p>
          </div>
          <button type="button" class="icon-button" aria-label="Close dialog" @click="emit('close')">×</button>
        </div>

        <form class="space-y-5 p-6 sm:p-7" @submit.prevent="createUrl">
          <div v-if="createError" role="alert" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{{ createError }}</div>
          <div>
            <label for="origin-url" class="mb-2 block text-sm font-bold text-slate-700">Destination URL</label>
            <input id="origin-url" v-model="form.origin" type="url" required class="input-field" placeholder="https://example.com/your/long/path" />
            <p class="mt-2 text-xs leading-5 text-slate-400">Use the complete URL, including https://.</p>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between"><label for="expires-at" class="text-sm font-bold text-slate-700">Expiration date</label><span class="text-xs font-semibold text-slate-400">Optional</span></div>
            <input id="expires-at" v-model="form.expiresAt" type="date" :min="minDate" class="input-field" />
            <p class="mt-2 text-xs leading-5 text-slate-400">The link expires at 23:59:59 in your local timezone, stored as UTC.</p>
          </div>
          <div class="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" class="btn-secondary" @click="emit('close')">Cancel</button>
            <button type="submit" :disabled="creating" class="btn-primary">{{ creating ? "Creating…" : "Create short link" }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useRedirectStore } from "~/stores/redirect";

defineProps<{ show: boolean }>();
const emit = defineEmits<{ (event: "close"): void; (event: "created"): void }>();
const redirectStore = useRedirectStore();
const creating = ref(false);
const createError = ref("");
const form = reactive({ origin: "", expiresAt: "" });
const minDate = computed(() => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
});

const createUrl = async () => {
  creating.value = true;
  createError.value = "";
  try {
    const payload: { origin: string; expiresAt?: string } = { origin: form.origin };
    if (form.expiresAt) payload.expiresAt = new Date(`${form.expiresAt}T23:59:59.999`).toISOString();
    await redirectStore.create(payload);
    form.origin = "";
    form.expiresAt = "";
    emit("created");
    emit("close");
  } catch (error: any) {
    createError.value = error.data?.statusMessage || "Failed to create URL";
  } finally {
    creating.value = false;
  }
};
</script>
