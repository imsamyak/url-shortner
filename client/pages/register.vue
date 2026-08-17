<template>
  <div class="flex-grow flex items-center justify-center p-6">
    <div class="glass-card w-full max-w-md p-8 relative overflow-hidden">
      <!-- Decorative background glow -->
      <div class="absolute -top-20 -left-20 w-40 h-40 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div class="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      
      <div class="relative z-10">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p class="text-slate-500">Join to start shortening links</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div v-if="error" class="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {{ error }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input id="email" v-model="form.email" type="email" required class="input-field" placeholder="you@example.com" />
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input id="name" v-model="form.name" type="text" required class="input-field" placeholder="Your Name" />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input id="password" v-model="form.password" type="password" required class="input-field" placeholder="••••••••" />
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full">
            <span v-if="loading">Creating account...</span>
            <span v-else>Sign Up</span>
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-slate-500">
          Already have an account? 
          <NuxtLink to="/login" class="text-brand-600 font-semibold hover:underline">Sign in</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()
const form = reactive({ email: '', name: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  loading.value = true
  error.value = ''
  
  const res = await userStore.register({ email: form.email, name: form.name, password: form.password })
  
  if (res.success) {
    navigateTo('/dashboard')
  } else {
    error.value = res.message;
  }
  
  loading.value = false
}
</script>
