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
            <h1 class="text-xl font-semibold text-gray-900">Class Management</h1>
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
            <h2 class="text-2xl font-bold text-gray-900">Classes</h2>
            <p class="text-gray-600">Manage classes, assign teachers, and organize curricula</p>
          </div>
          <button @click="showAddModal = true" class="btn-primary">
            Add Class
          </button>
        </div>

        <!-- Classes Grid -->
        <div v-if="loading" class="text-center py-12">
          <div class="text-gray-500">Loading classes...</div>
        </div>

        <div v-else-if="classes.length === 0" class="text-center py-12">
          <div class="text-gray-500">No classes found. Add a class to get started.</div>
        </div>

        <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="cls in classes"
            :key="cls.id"
            class="card hover:shadow-md transition-shadow"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900 mb-2">
                  {{ cls.name }}
                </h3>
                <div class="space-y-1 text-sm text-gray-600">
                  <p><strong>Subject:</strong> {{ cls.subject_name }} ({{ cls.subject_code }})</p>
                  <p><strong>Grade:</strong> {{ cls.grade_name }}</p>
                  <p><strong>Teacher:</strong> {{ cls.teacher_first_name }} {{ cls.teacher_last_name }}</p>
                  <p v-if="cls.room"><strong>Room:</strong> {{ cls.room }}</p>
                  <p v-if="cls.schedule_time"><strong>Schedule:</strong> {{ cls.schedule_time }}</p>
                </div>
              </div>
            </div>
            
                         <div class="flex space-x-2">
               <button 
                 @click="manageStudents(cls)" 
                 class="btn-secondary flex-1 text-sm"
               >
                 Manage Students
               </button>
               <button 
                 @click="editClass(cls)" 
                 class="btn-primary flex-1 text-sm"
               >
                 Edit
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Class Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showAddModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveClass">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ isEditing ? 'Edit Class' : 'Add New Class' }}
              </h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Class Name*</label>
                  <input v-model="newClass.name" type="text" required class="form-input" />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Grade*</label>
                  <select v-model="newClass.grade_id" required class="form-select">
                    <option value="">Select Grade</option>
                    <option v-for="grade in grades" :key="grade.id" :value="grade.id">
                      {{ grade.name }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Subject*</label>
                  <select v-model="newClass.subject_id" required class="form-select">
                    <option value="">Select Subject</option>
                    <option v-for="subject in subjects" :key="subject.id" :value="subject.id">
                      {{ subject.name }} ({{ subject.code }})
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Teacher*</label>
                  <select v-model="newClass.teacher_id" required class="form-select">
                    <option value="">Select Teacher</option>
                    <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                      {{ teacher.first_name }} {{ teacher.last_name }}
                    </option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <input v-model="newClass.room" type="text" class="form-input" />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
                  <input v-model="newClass.schedule_time" type="text" class="form-input" placeholder="e.g., 9:00 AM - 10:00 AM" />
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="saving" class="btn-primary sm:ml-3 disabled:opacity-50">
                <span v-if="saving">Saving...</span>
                <span v-else>{{ isEditing ? 'Update Class' : 'Save Class' }}</span>
              </button>
              <button type="button" @click="showAddModal = false; resetForm()" class="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Student Management Modal -->
    <div v-if="showStudentsModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showStudentsModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Manage Students - {{ selectedClass?.name }}
            </h3>
            
            <div v-if="loadingStudents" class="text-center py-8">
              <div class="text-gray-500">Loading students...</div>
            </div>
            
            <div v-else class="grid gap-6 md:grid-cols-2">
              <!-- Enrolled Students -->
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-3">
                  Enrolled Students ({{ classStudents.length }})
                </h4>
                
                <div v-if="classStudents.length === 0" class="text-center py-4 text-gray-500">
                  No students enrolled in this class yet.
                </div>
                
                <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                  <div 
                    v-for="student in classStudents" 
                    :key="student.id"
                    class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ student.first_name }} {{ student.last_name }}
                      </div>
                      <div class="text-xs text-gray-500">
                        ID: {{ student.student_id }} | {{ student.grade_name }}
                      </div>
                    </div>
                    <button 
                      @click="removeStudentFromClass(student.id)"
                      class="text-red-600 hover:text-red-900 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Available Students -->
              <div>
                <h4 class="text-md font-medium text-gray-900 mb-3">
                  Available Students ({{ availableStudents.length }})
                </h4>
                
                <div v-if="availableStudents.length === 0" class="text-center py-4 text-gray-500">
                  All students are already enrolled in this class.
                </div>
                
                <div v-else class="space-y-2 max-h-64 overflow-y-auto">
                  <div 
                    v-for="student in availableStudents" 
                    :key="student.id"
                    class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ student.first_name }} {{ student.last_name }}
                      </div>
                      <div class="text-xs text-gray-500">
                        ID: {{ student.student_id }} | {{ student.grade_name }}
                      </div>
                    </div>
                    <button 
                      @click="addStudentToClass(student.id)"
                      class="text-primary-600 hover:text-primary-900 text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" @click="showStudentsModal = false" class="btn-primary">
              Done
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
  name: 'ClassManagement',
  setup() {
    const router = useRouter()
    const classes = ref([])
    const grades = ref([])
    const subjects = ref([])
    const teachers = ref([])
    const loading = ref(true)
    const saving = ref(false)
    const showAddModal = ref(false)
    const showStudentsModal = ref(false)
    const isEditing = ref(false)
    const selectedClass = ref(null)
    const classStudents = ref([])
    const allStudents = ref([])
    const loadingStudents = ref(false)

    const newClass = ref({
      name: '',
      grade_id: '',
      subject_id: '',
      teacher_id: '',
      room: '',
      schedule_time: ''
    })

    const loadClasses = async () => {
      try {
        const response = await adminAPI.getClasses()
        classes.value = response.data
      } catch (error) {
        console.error('Failed to load classes:', error)
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

    const loadSubjects = async () => {
      try {
        const response = await dataAPI.getSubjects()
        subjects.value = response.data
      } catch (error) {
        console.error('Failed to load subjects:', error)
      }
    }

    const loadTeachers = async () => {
      try {
        const response = await adminAPI.getUsers()
        teachers.value = response.data.filter(user => user.role === 'teacher')
      } catch (error) {
        console.error('Failed to load teachers:', error)
      }
    }

    const saveClass = async () => {
      saving.value = true
      try {
        if (isEditing.value) {
          await adminAPI.updateClass(newClass.value.id, newClass.value)
          alert('Class updated successfully!')
        } else {
          await adminAPI.createClass(newClass.value)
          alert('Class created successfully!')
        }
        await loadClasses()
        showAddModal.value = false
        resetForm()
      } catch (error) {
        console.error('Failed to save class:', error)
        alert('Failed to save class. Please try again.')
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      newClass.value = {
        name: '',
        grade_id: '',
        subject_id: '',
        teacher_id: '',
        room: '',
        schedule_time: ''
      }
      isEditing.value = false
    }

    const editClass = (cls) => {
      newClass.value = { ...cls }
      isEditing.value = true
      showAddModal.value = true
    }

    const manageStudents = async (cls) => {
      selectedClass.value = cls
      showStudentsModal.value = true
      loadingStudents.value = true
      
      try {
        // Load students enrolled in this class
        const enrollmentsResponse = await adminAPI.getClassEnrollments(cls.id)
        classStudents.value = enrollmentsResponse.data
        
        // Load all students for adding new enrollments
        const allStudentsResponse = await adminAPI.getStudents()
        allStudents.value = allStudentsResponse.data
      } catch (error) {
        console.error('Failed to load students:', error)
        alert('Failed to load student data. Please try again.')
      } finally {
        loadingStudents.value = false
      }
    }

    const addStudentToClass = async (studentId) => {
      try {
        await adminAPI.addStudentToClass(selectedClass.value.id, studentId)
        alert('Student added to class successfully!')
        // Refresh the class students list
        await manageStudents(selectedClass.value)
      } catch (error) {
        console.error('Failed to add student to class:', error)
        alert('Failed to add student to class. They may already be enrolled.')
      }
    }

    const removeStudentFromClass = async (studentId) => {
      if (confirm('Are you sure you want to remove this student from the class?')) {
        try {
          await adminAPI.removeStudentFromClass(selectedClass.value.id, studentId)
          alert('Student removed from class successfully!')
          // Refresh the class students list
          await manageStudents(selectedClass.value)
        } catch (error) {
          console.error('Failed to remove student from class:', error)
          alert('Failed to remove student from class. Please try again.')
        }
      }
    }

    const availableStudents = computed(() => {
      const enrolledIds = classStudents.value.map(s => s.id)
      return allStudents.value.filter(s => !enrolledIds.includes(s.id))
    })

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
      Promise.all([loadClasses(), loadGrades(), loadSubjects(), loadTeachers()])
    })

    return {
      classes,
      grades,
      subjects,
      teachers,
      loading,
      saving,
      showAddModal,
      showStudentsModal,
      isEditing,
      selectedClass,
      classStudents,
      allStudents,
      loadingStudents,
      availableStudents,
      newClass,
      saveClass,
      resetForm,
      editClass,
      manageStudents,
      addStudentToClass,
      removeStudentFromClass,
      handleLogout
    }
  }
}
</script> 