<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
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
        <!-- Welcome Section -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">Administrator Panel</h2>
          <p class="text-gray-600">Manage students, teachers, classes, and view attendance reports</p>
        </div>

        <!-- Quick Stats -->
        <div class="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div class="card text-center">
            <div class="text-3xl font-bold text-primary-600 mb-2">{{ stats.totalStudents }}</div>
            <div class="text-sm text-gray-600">Total Students</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-blue-600 mb-2">{{ stats.totalClasses }}</div>
            <div class="text-sm text-gray-600">Active Classes</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ stats.totalTeachers }}</div>
            <div class="text-sm text-gray-600">Teachers</div>
          </div>
          <div class="card text-center">
            <div class="text-3xl font-bold text-yellow-600 mb-2">{{ stats.todayAttendance }}%</div>
            <div class="text-sm text-gray-600">Today's Attendance</div>
          </div>
        </div>

        <!-- Management Sections -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Student Management -->
          <div class="card hover:shadow-md transition-shadow cursor-pointer" @click="goTo('/admin/students')">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Student Management</h3>
            </div>
            <p class="text-gray-600 mb-4">Add, edit, and manage student records. Import students from CSV files.</p>
            <button class="btn-primary w-full">
              Manage Students
            </button>
          </div>

          <!-- Class Management -->
          <div class="card hover:shadow-md transition-shadow cursor-pointer" @click="goTo('/admin/classes')">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Class Management</h3>
            </div>
            <p class="text-gray-600 mb-4">Create and manage classes, assign teachers, and organize grade levels.</p>
            <button class="btn-primary w-full">
              Manage Classes
            </button>
          </div>

          <!-- User Management -->
          <div class="card hover:shadow-md transition-shadow cursor-pointer" @click="goTo('/admin/users')">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">User Management</h3>
            </div>
            <p class="text-gray-600 mb-4">Manage teacher accounts, create new users, and set permissions.</p>
            <button class="btn-primary w-full">
              Manage Users
            </button>
          </div>

          <!-- Reports -->
          <div class="card hover:shadow-md transition-shadow cursor-pointer" @click="goTo('/admin/reports')">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Reports & Analytics</h3>
            </div>
            <p class="text-gray-600 mb-4">Generate attendance reports, export data, and view analytics.</p>
            <button class="btn-primary w-full">
              View Reports
            </button>
          </div>

          <!-- Quick Attendance -->
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Quick Attendance</h3>
            </div>
            <p class="text-gray-600 mb-4">Take attendance for any class as an administrator.</p>
            <select v-model="selectedClass" class="form-select mb-4">
              <option value="">Select a class...</option>
              <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                {{ cls.name }} - {{ cls.subject_name }}
              </option>
            </select>
            <button 
              @click="goToAttendance" 
              :disabled="!selectedClass"
              class="btn-primary w-full disabled:opacity-50"
            >
              Take Attendance
            </button>
          </div>

          <!-- System Settings -->
          <div class="card hover:shadow-md transition-shadow">
            <div class="flex items-center mb-4">
              <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">System Settings</h3>
            </div>
            <p class="text-gray-600 mb-4">Configure system settings, backup data, and manage preferences.</p>
            <button class="btn-secondary w-full">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI, classesAPI, adminAPI } from '../api'
import { format } from 'date-fns'

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter()
    const user = ref(null)
    const classes = ref([])
    const selectedClass = ref('')
    const stats = ref({
      totalStudents: 0,
      totalClasses: 0,
      totalTeachers: 0,
      todayAttendance: 0
    })

    const loadUser = async () => {
      try {
        const response = await authAPI.getMe()
        user.value = response.data
      } catch (error) {
        console.error('Failed to load user:', error)
      }
    }

    const loadClasses = async () => {
      try {
        const response = await classesAPI.getClasses()
        classes.value = response.data
        stats.value.totalClasses = classes.value.length
      } catch (error) {
        console.error('Failed to load classes:', error)
      }
    }

    const loadStats = async () => {
      try {
        const response = await adminAPI.getDashboardStats()
        stats.value = response.data
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
        // Fallback to default values
        stats.value = {
          totalStudents: 0,
          totalClasses: classes.value.length,
          totalTeachers: 0,
          todayAttendance: 0
        }
      }
    }

    const goTo = (path) => {
      router.push(path)
    }

    const goToAttendance = () => {
      if (selectedClass.value) {
        const today = format(new Date(), 'yyyy-MM-dd')
        router.push(`/attendance/${selectedClass.value}/${today}`)
      }
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

    onMounted(async () => {
      await Promise.all([
        loadUser(),
        loadClasses()
      ])
      loadStats()
    })

    return {
      user,
      classes,
      selectedClass,
      stats,
      goTo,
      goToAttendance,
      handleLogout
    }
  }
}
</script> 