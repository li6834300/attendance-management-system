<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/admin" class="text-primary-600 hover:text-primary-800">
              ← Back to Dashboard
            </router-link>
            <h1 class="text-xl font-semibold text-gray-900">User Management</h1>
          </div>
          <div class="flex items-center space-x-4">
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
        <!-- Header Actions -->
        <div class="mb-6 flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Users</h2>
            <p class="text-gray-600">Manage teacher accounts and user permissions</p>
          </div>
          <button @click="showAddModal = true" class="btn-primary">
            Add User
          </button>
        </div>

        <!-- Users Table -->
        <div class="card">
          <div class="mb-4 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">
              User List ({{ users.length }} users)
            </h3>
            <div class="flex space-x-2">
              <select v-model="selectedRole" class="form-select w-auto">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="text-gray-500">Loading users...</div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.first_name }} {{ user.last_name }}
                      </div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ user.username }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getRoleClass(user.role)">
                      {{ user.role }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(user.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      @click="viewUserClasses(user)" 
                      v-if="user.role === 'teacher'"
                      class="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      View Classes
                    </button>
                    <button 
                      @click="editUser(user)" 
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showAddModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveUser">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ isEditing ? 'Edit User' : 'Add New User' }}
              </h3>
              
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                  <input v-model="newUser.first_name" type="text" required class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                  <input v-model="newUser.last_name" type="text" required class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Username*</label>
                  <input v-model="newUser.username" type="text" required class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input v-model="newUser.email" type="email" required class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Role*</label>
                  <select v-model="newUser.role" required class="form-select">
                    <option value="">Select Role</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div v-if="!isEditing">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                  <input v-model="newUser.password" type="password" required class="form-input" />
                </div>
              </div>
              
              <div v-if="isEditing" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p class="text-sm text-yellow-800">
                  Note: Password cannot be changed through this interface. User must reset their password separately.
                </p>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="saving" class="btn-primary sm:ml-3 disabled:opacity-50">
                <span v-if="saving">Saving...</span>
                <span v-else>{{ isEditing ? 'Update User' : 'Save User' }}</span>
              </button>
              <button type="button" @click="showAddModal = false; resetForm()" class="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Teacher Classes Modal -->
    <div v-if="showClassesModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showClassesModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Classes for {{ selectedUser?.first_name }} {{ selectedUser?.last_name }}
            </h3>
            
            <div v-if="loadingClasses" class="text-center py-8">
              <div class="text-gray-500">Loading classes...</div>
            </div>
            
            <div v-else-if="userClasses.length === 0" class="text-center py-8">
              <div class="text-gray-500">This teacher is not assigned to any classes yet.</div>
            </div>
            
            <div v-else class="space-y-4">
              <div 
                v-for="cls in userClasses" 
                :key="cls.id"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="text-md font-medium text-gray-900 mb-2">
                      {{ cls.name }}
                    </h4>
                    <div class="space-y-1 text-sm text-gray-600">
                      <p><strong>Subject:</strong> {{ cls.subject_name }} ({{ cls.subject_code }})</p>
                      <p><strong>Grade:</strong> {{ cls.grade_name }}</p>
                      <p v-if="cls.room"><strong>Room:</strong> {{ cls.room }}</p>
                      <p v-if="cls.schedule_time"><strong>Schedule:</strong> {{ cls.schedule_time }}</p>
                      <p><strong>Students:</strong> {{ cls.student_count }} enrolled</p>
                    </div>
                  </div>
                  <div class="ml-4">
                    <button 
                      @click="goToAttendance(cls.id)"
                      class="btn-secondary text-sm"
                    >
                      Take Attendance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="showClassesModal = false" class="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminAPI, authAPI } from '../../api'
import { format } from 'date-fns'

export default {
  name: 'UserManagement',
  setup() {
    const router = useRouter()
    const users = ref([])
    const loading = ref(true)
    const saving = ref(false)
    const showAddModal = ref(false)
    const showClassesModal = ref(false)
    const isEditing = ref(false)
    const selectedRole = ref('')
    const selectedUser = ref(null)
    const userClasses = ref([])
    const loadingClasses = ref(false)

    const newUser = ref({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: '',
      password: ''
    })

    const filteredUsers = computed(() => {
      if (!selectedRole.value) return users.value
      return users.value.filter(user => user.role === selectedRole.value)
    })

    const loadUsers = async () => {
      try {
        const response = await adminAPI.getUsers()
        users.value = response.data
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        loading.value = false
      }
    }

    const saveUser = async () => {
      saving.value = true
      try {
        if (isEditing.value) {
          // TODO: Implement update functionality when backend supports it
          alert('Update functionality coming soon!')
        } else {
          await adminAPI.createUser(newUser.value)
          alert('User created successfully!')
        }
        await loadUsers()
        showAddModal.value = false
        resetForm()
      } catch (error) {
        console.error('Failed to save user:', error)
        alert('Failed to save user. Please try again.')
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      newUser.value = {
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: '',
        password: ''
      }
      isEditing.value = false
    }

    const editUser = (user) => {
      newUser.value = { 
        ...user,
        password: '' // Don't include password for editing
      }
      isEditing.value = true
      showAddModal.value = true
    }

    const viewUserClasses = async (user) => {
      selectedUser.value = user
      showClassesModal.value = true
      loadingClasses.value = true
      
      try {
        const response = await adminAPI.getUserClasses(user.id)
        userClasses.value = response.data
      } catch (error) {
        console.error('Failed to load user classes:', error)
        alert('Failed to load classes. Please try again.')
      } finally {
        loadingClasses.value = false
      }
    }

    const getRoleClass = (role) => {
      return role === 'admin' ? 'status-present' : 'status-late'
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString()
    }

    const goToAttendance = (classId) => {
      const today = format(new Date(), 'yyyy-MM-dd')
      router.push(`/attendance/${classId}/${today}`)
      showClassesModal.value = false
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
      loadUsers()
    })

    return {
      users,
      loading,
      saving,
      showAddModal,
      showClassesModal,
      isEditing,
      selectedRole,
      selectedUser,
      userClasses,
      loadingClasses,
      newUser,
      filteredUsers,
      saveUser,
      resetForm,
      editUser,
      viewUserClasses,
      goToAttendance,
      getRoleClass,
      formatDate,
      handleLogout
    }
  }
}
</script> 