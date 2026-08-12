<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans">
    <AppHeader />

    <main class="flex-grow flex flex-col">
      <NuxtPage />
    </main>

    <footer class="py-6 text-center text-slate-400 text-sm border-t border-slate-200 bg-white">
      &copy; {{ new Date().getFullYear() }} UrlShortener. All rights reserved.
    </footer>
    
    <ToastContainer />
  </div>
</template>

<script setup>
</script>
