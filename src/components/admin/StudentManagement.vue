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
            <h1 class="text-xl font-semibold text-gray-900">Student Management</h1>
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
            <h2 class="text-2xl font-bold text-gray-900">Students</h2>
            <p class="text-gray-600">Manage student records and enrollments</p>
          </div>
          <div class="flex space-x-4">
            <button @click="showAddModal = true" class="btn-primary">
              Add Student
            </button>
            <button @click="showImportModal = true" class="btn-secondary">
              Import CSV
            </button>
          </div>
        </div>

        <!-- Search and Filters -->
        <div class="mb-6 card">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                v-model="searchTerm"
                placeholder="Search students..."
                class="form-input"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Grade</label>
              <select v-model="selectedGrade" class="form-select">
                <option value="">All Grades</option>
                <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                  {{ grade.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="selectedStatus" class="form-select">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="transferred">Transferred</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Students Table -->
        <div class="card">
          <div class="mb-4 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">
              Student List ({{ filteredStudents.length }} students)
            </h3>
          </div>

          <div v-if="loading" class="text-center py-12">
            <div class="text-gray-500">Loading students...</div>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent Contact
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in paginatedStudents" :key="student.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ student.last_name }}, {{ student.first_name }}
                      </div>
                      <div class="text-sm text-gray-500">{{ student.email }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ student.student_id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ student.grade_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(student.status)">
                      {{ student.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{{ student.parent_name }}</div>
                    <div>{{ student.parent_phone }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button @click="editStudent(student)" class="text-primary-600 hover:text-primary-900 mr-3">
                      Edit
                    </button>
                    <button @click="deleteStudent(student)" class="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-6 flex justify-between items-center">
            <div class="text-sm text-gray-700">
              Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredStudents.length) }} of {{ filteredStudents.length }} students
            </div>
            <div class="flex space-x-2">
              <button 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                class="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                @click="currentPage++" 
                :disabled="currentPage === totalPages"
                class="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Student Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showAddModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveStudent">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ isEditing ? 'Edit Student' : 'Add New Student' }}</h3>
              
              <div class="grid gap-4 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                  <input v-model="newStudent.first_name" type="text" required class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                  <input v-model="newStudent.last_name" type="text" required class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Student ID*</label>
                  <input v-model="newStudent.student_id" type="text" required class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Grade*</label>
                  <select v-model="newStudent.grade_id" required class="form-select">
                    <option value="">Select Grade</option>
                    <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                      {{ grade.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input v-model="newStudent.email" type="email" class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input v-model="newStudent.phone" type="tel" class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input v-model="newStudent.date_of_birth" type="date" class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                  <input v-model="newStudent.parent_name" type="text" class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                  <input v-model="newStudent.parent_phone" type="tel" class="form-input" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Parent Email</label>
                  <input v-model="newStudent.parent_email" type="email" class="form-input" />
                </div>
              </div>
              
              <div class="mt-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea v-model="newStudent.address" rows="3" class="form-input"></textarea>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="saving" class="btn-primary sm:ml-3 disabled:opacity-50">
                <span v-if="saving">Saving...</span>
                <span v-else>{{ isEditing ? 'Update Student' : 'Save Student' }}</span>
              </button>
              <button type="button" @click="showAddModal = false; resetForm()" class="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- CSV Import Modal -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showImportModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Import Students from CSV</h3>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
              <input 
                type="file" 
                accept=".csv" 
                @change="handleFileUpload"
                class="form-input"
              />
              <p class="mt-2 text-sm text-gray-500">
                CSV should include headers: student_id, first_name, last_name, email, phone, grade, parent_name, parent_phone, parent_email, address
              </p>
            </div>

            <div v-if="csvData" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <textarea 
                v-model="csvData" 
                rows="6" 
                class="form-input text-xs"
                readonly
              ></textarea>
              <p class="mt-1 text-sm text-gray-500">
                {{ csvData.split('\n').length - 1 }} students to import
              </p>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              @click="importStudents" 
              :disabled="importing || !csvData" 
              class="btn-primary sm:ml-3 disabled:opacity-50"
            >
              <span v-if="importing">Importing...</span>
              <span v-else>Import Students</span>
            </button>
            <button type="button" @click="showImportModal = false; csvData = ''; csvFile = null" class="btn-secondary">
              Cancel
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
import { adminAPI, dataAPI, authAPI } from '../../api'

export default {
  name: 'StudentManagement',
  setup() {
    const router = useRouter()
    const students = ref([])
    const grades = ref([])
    const loading = ref(true)
    const saving = ref(false)
    const showAddModal = ref(false)
    const showImportModal = ref(false)
    const isEditing = ref(false)
    const importing = ref(false)
    
    const searchTerm = ref('')
    const selectedGrade = ref('')
    const selectedStatus = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)

    const newStudent = ref({
      student_id: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      grade_id: '',
      date_of_birth: '',
      parent_name: '',
      parent_phone: '',
      parent_email: '',
      address: ''
    })

    const filteredStudents = computed(() => {
      let filtered = students.value

      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase()
        filtered = filtered.filter(student => 
          student.first_name.toLowerCase().includes(term) ||
          student.last_name.toLowerCase().includes(term) ||
          student.student_id.toLowerCase().includes(term) ||
          student.email?.toLowerCase().includes(term)
        )
      }

      if (selectedGrade.value) {
        filtered = filtered.filter(student => student.grade_id == selectedGrade.value)
      }

      if (selectedStatus.value) {
        filtered = filtered.filter(student => student.status === selectedStatus.value)
      }

      return filtered
    })

    const paginatedStudents = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredStudents.value.slice(start, end)
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredStudents.value.length / pageSize.value)
    })

    const loadStudents = async () => {
      try {
        const response = await adminAPI.getStudents()
        students.value = response.data
      } catch (error) {
        console.error('Failed to load students:', error)
      } finally {
        loading.value = false
      }
    }

    const loadGrades = async () => {
      try {
        const response = await dataAPI.getGrades()
        grades.value = response.data
      } catch (error) {
        console.error('Failed to load grades:', error)
      }
    }

    const saveStudent = async () => {
      saving.value = true
      try {
        if (isEditing.value) {
          await adminAPI.updateStudent(newStudent.value.id, newStudent.value)
          alert('Student updated successfully!')
        } else {
          await adminAPI.createStudent(newStudent.value)
          alert('Student added successfully!')
        }
        await loadStudents()
        showAddModal.value = false
        resetForm()
      } catch (error) {
        console.error('Failed to save student:', error)
        alert('Failed to save student. Please try again.')
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      newStudent.value = {
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        grade_id: '',
        date_of_birth: '',
        parent_name: '',
        parent_phone: '',
        parent_email: '',
        address: ''
      }
      isEditing.value = false
    }

    const csvData = ref('')
    const csvFile = ref(null)

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file && file.type === 'text/csv') {
        csvFile.value = file
        const reader = new FileReader()
        reader.onload = (e) => {
          csvData.value = e.target.result
        }
        reader.readAsText(file)
      } else {
        alert('Please select a valid CSV file')
      }
    }

    const parseCSV = (csv) => {
      const lines = csv.split('\n').filter(line => line.trim())
      if (lines.length < 2) return []
      
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const students = []
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length >= headers.length) {
          const student = {}
          headers.forEach((header, index) => {
            // Map CSV headers to database fields
            const fieldMap = {
              'student_id': 'student_id',
              'studentid': 'student_id',
              'id': 'student_id',
              'first_name': 'first_name',
              'firstname': 'first_name',
              'first': 'first_name',
              'last_name': 'last_name',
              'lastname': 'last_name',
              'last': 'last_name',
              'email': 'email',
              'phone': 'phone',
              'grade': 'grade_id',
              'grade_id': 'grade_id',
              'gradeid': 'grade_id',
              'date_of_birth': 'date_of_birth',
              'dob': 'date_of_birth',
              'parent_name': 'parent_name',
              'parent': 'parent_name',
              'parent_phone': 'parent_phone',
              'parent_email': 'parent_email',
              'address': 'address'
            }
            
            const field = fieldMap[header]
            if (field) {
              student[field] = values[index] || null
            }
          })
          
          // Convert grade name to grade_id if needed
          if (student.grade_id && isNaN(student.grade_id)) {
            const grade = grades.value.find(g => g.name.toLowerCase() === student.grade_id.toLowerCase())
            student.grade_id = grade ? grade.id : null
          }
          
          students.push(student)
        }
      }
      
      return students
    }

    const importStudents = async () => {
      if (!csvData.value) {
        alert('Please upload a CSV file first')
        return
      }
      
      importing.value = true
      try {
        const studentsToImport = parseCSV(csvData.value)
        if (studentsToImport.length === 0) {
          alert('No valid students found in CSV file')
          return
        }
        
        const response = await adminAPI.importStudents(studentsToImport)
        await loadStudents()
        showImportModal.value = false
        csvData.value = ''
        csvFile.value = null
        
        alert(response.data.message)
      } catch (error) {
        console.error('Failed to import students:', error)
        alert('Failed to import students. Please try again.')
      } finally {
        importing.value = false
      }
    }

    const editStudent = (student) => {
      newStudent.value = { ...student }
      isEditing.value = true
      showAddModal.value = true
    }

    const deleteStudent = async (student) => {
      if (confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
        try {
          await adminAPI.deleteStudent(student.id)
          await loadStudents()
          alert('Student deleted successfully!')
        } catch (error) {
          console.error('Failed to delete student:', error)
          alert('Failed to delete student. Please try again.')
        }
      }
    }

    const getStatusClass = (status) => {
      const classes = {
        active: 'status-present',
        inactive: 'status-absent',
        transferred: 'status-late'
      }
      return classes[status] || 'status-excused'
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
      Promise.all([loadStudents(), loadGrades()])
    })

    return {
      students,
      grades,
      loading,
      saving,
      showAddModal,
      showImportModal,
      isEditing,
      importing,
      searchTerm,
      selectedGrade,
      selectedStatus,
      currentPage,
      pageSize,
      newStudent,
      csvData,
      csvFile,
      filteredStudents,
      paginatedStudents,
      totalPages,
      saveStudent,
      resetForm,
      editStudent,
      deleteStudent,
      getStatusClass,
      handleLogout,
      handleFileUpload,
      importStudents
    }
  }
}
</script> 