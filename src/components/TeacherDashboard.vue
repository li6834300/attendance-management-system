<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Teacher Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              Welcome, {{ user?.first_name }} {{ user?.last_name }}
            </span>
            <button @click="handleLogout" class="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">My Classes</h2>
          <p class="text-gray-600">Manage attendance for your classes</p>
        </div>

        <!-- Date Selector -->
        <div class="mb-6 card">
          <div class="flex items-center space-x-4">
            <label for="date" class="text-sm font-medium text-gray-700">
              Select Date:
            </label>
            <input
              id="date"
              type="date"
              v-model="selectedDate"
              class="form-input w-auto"
            />
          </div>
        </div>

        <!-- Classes Grid -->
        <div v-if="loading" class="text-center py-12">
          <div class="text-gray-500">Loading classes...</div>
        </div>

        <div v-else-if="classes.length === 0" class="text-center py-12">
          <div class="text-gray-500">No classes assigned</div>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="cls in classes"
            :key="cls.id"
            class="card hover:shadow-md transition-shadow cursor-pointer"
            @click="goToAttendance(cls.id)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ cls.name }}
                </h3>
                <div class="space-y-1 text-sm text-gray-600">
                  <p><strong>Subject:</strong> {{ cls.subject_name }} ({{ cls.subject_code }})</p>
                  <p><strong>Grade:</strong> {{ cls.grade_name }}</p>
                  <p v-if="cls.room"><strong>Room:</strong> {{ cls.room }}</p>
                  <p v-if="cls.schedule_time"><strong>Time:</strong> {{ cls.schedule_time }}</p>
                </div>
              </div>
              <div class="ml-4">
                <div class="w-3 h-3 bg-primary-500 rounded-full"></div>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
              <button class="btn-primary w-full">
                Take Attendance
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div v-if="classes.length > 0" class="mt-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Today's Summary</h3>
          <div class="grid gap-4 md:grid-cols-3">
            <div class="card text-center">
              <div class="text-2xl font-bold text-primary-600">{{ classes.length }}</div>
              <div class="text-sm text-gray-600">Total Classes</div>
            </div>
            <div class="card text-center">
              <div class="text-2xl font-bold text-green-600">0</div>
              <div class="text-sm text-gray-600">Attendance Taken</div>
            </div>
            <div class="card text-center">
              <div class="text-2xl font-bold text-yellow-600">{{ classes.length }}</div>
              <div class="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { classesAPI, authAPI } from '../api'
import { format } from 'date-fns'

export default {
  name: 'TeacherDashboard',
  setup() {
    const router = useRouter()
    const classes = ref([])
    const loading = ref(true)
    const user = ref(null)
    const selectedDate = ref(format(new Date(), 'yyyy-MM-dd'))

    const loadClasses = async () => {
      try {
        const response = await classesAPI.getClasses()
        classes.value = response.data
      } catch (error) {
        console.error('Failed to load classes:', error)
      } finally {
        loading.value = false
      }
    }

    const loadUser = async () => {
      try {
        const response = await authAPI.getMe()
        user.value = response.data
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }

    const goToAttendance = (classId) => {
      router.push(`/attendance/${classId}/${selectedDate.value}`)
    }

    const handleLogout = async () => {
      try {
        await authAPI.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_role')
        localStorage.removeItem('user_data')
        router.push('/login')
      }
    }

    onMounted(() => {
      loadClasses()
      loadUser()
    })

    return {
      classes,
      loading,
      user,
      selectedDate,
      goToAttendance,
      handleLogout
    }
  }
}
</script> 