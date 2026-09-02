<template>
  <div class="flex min-h-screen items-center justify-center bg-blue-50 dark:bg-slate-800">
    <div class="text-center" v-if="error">
      <h1 class="mb-4 text-4xl font-bold text-gray-800 dark:text-white">404</h1>
      <p class="mb-6 text-lg text-gray-600 dark:text-slate-300">The link you are looking for does not exist or has expired.</p>
      <NuxtLink to="/" class="rounded-lg bg-blue-600 px-6 py-3 text-white shadow transition hover:bg-blue-700">
        Go Home
      </NuxtLink>
    </div>
    <div v-else>
      <p class="animate-pulse text-lg text-gray-600 dark:text-slate-300">Redirecting...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from '#imports'

const route = useRoute()
const shortId = route.params.shortId as string
const error = ref(false)

const runtimeConfig = useRuntimeConfig()
const apiUrl = runtimeConfig.public.apiUrl || 'http://localhost:4000'

try {
  // Use useFetch to hit the backend directly or create an API route
  // We can hit the backend directly since it's just a GET request
  const { data, error: fetchError } = await useFetch<{ url?: { origin: string } }>(`${apiUrl}/api/v1/url/${shortId}`, {
    server: true
  })

  if (fetchError.value || !data.value?.url?.origin) {
    error.value = true
  } else {
    // Redirect using navigateTo with external flag
    await navigateTo(data.value.url.origin, {
      external: true,
      redirectCode: 302
    })
  }
} catch {
  error.value = true
}
</script>
