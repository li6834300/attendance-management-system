<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Attendance Management System
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Username or Email</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              v-model="credentials.username"
              class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Username or Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              v-model="credentials.password"
              class="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '../api'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const credentials = ref({
      username: '',
      password: ''
    })
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      loading.value = true
      error.value = ''

      try {
        const response = await authAPI.login(credentials.value)
        const { token, user } = response.data

        localStorage.setItem('auth_token', token)
        localStorage.setItem('user_role', user.role)
        localStorage.setItem('user_data', JSON.stringify(user))

        // Redirect based on role
        if (user.role === 'admin') {
          router.push('/admin')
        } else if (user.role === 'teacher') {
          router.push('/teacher')
        }
      } catch (err) {
        error.value = err.response?.data?.error || 'Login failed'
      } finally {
        loading.value = false
      }
    }

    return {
      credentials,
      loading,
      error,
      handleLogin
    }
  }
}
</script> 