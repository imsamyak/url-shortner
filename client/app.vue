<template>
  <div class="relative flex min-h-screen flex-col overflow-hidden bg-slate-50 font-sans">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.13),transparent_38%)]" />
    <AppHeader />

    <main class="relative z-10 flex flex-1 flex-col">
      <NuxtPage />
    </main>

    <footer class="relative z-10 border-t border-slate-200/80 bg-white/70 py-7 backdrop-blur-xl">
      <div class="page-shell flex flex-col items-center justify-between gap-2 text-sm text-slate-500 sm:flex-row">
        <p>&copy; {{ new Date().getFullYear() }} Linkora. Built for links that matter.</p>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Fast · Private · Reliable</p>
      </div>
    </footer>

    <ToastContainer />
  </div>
</template>
