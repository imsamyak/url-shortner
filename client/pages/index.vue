<template>
  <div class="flex-grow flex items-center justify-center p-6">
    <div class="text-center max-w-2xl mx-auto">
      <div class="inline-block p-4 rounded-3xl bg-brand-50 mb-6 border border-brand-100">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
      <h1 class="text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
        Shorten Your Links <br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">Expand Your Reach</span>
      </h1>
      <p class="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
        A premium URL shortener that gives you full control. Set custom expiration dates, secure your links, and manage everything from a beautiful dashboard.
      </p>
      
      <div class="flex items-center justify-center gap-4">
        <NuxtLink to="/register" class="btn-primary text-lg px-8 py-4">
          Get Started For Free
        </NuxtLink>
        <NuxtLink to="/login" class="btn-secondary text-lg px-8 py-4">
          Login to Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'UrlShortener - Premium Link Management'
})
</script>
