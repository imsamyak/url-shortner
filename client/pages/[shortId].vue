<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50">
    <div class="text-center" v-if="error">
      <h1 class="text-4xl font-bold text-gray-800 mb-4">404</h1>
      <p class="text-lg text-gray-600 mb-6">The link you are looking for does not exist or has expired.</p>
      <NuxtLink to="/" class="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
        Go Home
      </NuxtLink>
    </div>
    <div v-else>
      <p class="text-lg text-gray-600 animate-pulse">Redirecting...</p>
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
