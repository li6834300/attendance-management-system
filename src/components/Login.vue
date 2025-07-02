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
          
          <!-- Connectivity Status -->
          <div v-if="showConnectivityTest" class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h4 class="text-sm font-medium text-blue-800 mb-2">API Connectivity Test</h4>
            <div v-if="connectivityResults.length === 0" class="text-sm text-blue-600">
              Testing connections...
            </div>
            <div v-else class="space-y-1">
              <div v-for="result in connectivityResults" :key="result.endpoint" class="text-xs">
                <span :class="result.working ? 'text-green-600' : 'text-red-600'">
                  {{ result.working ? '✅' : '❌' }} {{ result.endpoint.split('//')[1] }}
                </span>
                <span v-if="result.working" class="text-gray-500"> ({{ result.responseTime }}ms)</span>
              </div>
            </div>
            <button @click="runConnectivityTest" class="mt-2 text-xs text-blue-600 hover:text-blue-800">
              Retry Test
            </button>
          </div>
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
                <button v-if="error.includes('timeout') || error.includes('Network')" 
                        @click="showConnectivityTest = true; runConnectivityTest()" 
                        class="ml-2 text-xs underline">
                  Test Connectivity
                </button>
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

        <div class="text-center text-sm text-gray-600">
          <p>Default admin login:</p>
          <p>Username: <strong>admin</strong></p>
          <p>Password: <strong>admin123</strong></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI, testEndpoints } from '../api'

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
    const showConnectivityTest = ref(false)
    const connectivityResults = ref([])

    const runConnectivityTest = async () => {
      connectivityResults.value = []
      try {
        const results = await testEndpoints()
        connectivityResults.value = results
        console.log('Connectivity test results:', results)
      } catch (err) {
        console.error('Connectivity test failed:', err)
      }
    }

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
        const errorMessage = err.response?.data?.error || err.message || 'Login failed'
        error.value = errorMessage
        
        // Auto-show connectivity test on network errors
        if (errorMessage.includes('timeout') || errorMessage.includes('Network') || err.code === 'ERR_NETWORK') {
          showConnectivityTest.value = true
          runConnectivityTest()
        }
      } finally {
        loading.value = false
      }
    }

    // Test connectivity on component mount
    onMounted(() => {
      // Auto-run connectivity test after a short delay
      setTimeout(() => {
        runConnectivityTest()
      }, 1000)
    })

    return {
      credentials,
      loading,
      error,
      showConnectivityTest,
      connectivityResults,
      runConnectivityTest,
      handleLogin
    }
  }
}
</script> 