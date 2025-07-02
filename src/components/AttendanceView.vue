<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <button @click="goBack" class="text-primary-600 hover:text-primary-800">
              ← Back
            </button>
            <h1 class="text-xl font-semibold text-gray-900">Take Attendance</h1>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">{{ classInfo?.name }}</span>
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
        <!-- Class Info -->
        <div class="mb-6 card">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                {{ classInfo?.name }}
              </h2>
              <div class="text-sm text-gray-600 space-y-1">
                <p><strong>Subject:</strong> {{ classInfo?.subject_name }} ({{ classInfo?.subject_code }})</p>
                <p><strong>Grade:</strong> {{ classInfo?.grade_name }}</p>
                <p><strong>Date:</strong> {{ formatDate(selectedDate) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <label for="date" class="text-sm font-medium text-gray-700">
                Change Date:
              </label>
              <input
                id="date"
                type="date"
                v-model="selectedDate"
                @change="loadAttendance"
                class="form-input w-auto"
              />
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="mb-6 card">
          <div class="flex items-center space-x-4">
            <h3 class="text-lg font-medium text-gray-900">Bulk Actions:</h3>
            <button @click="markAllPresent" class="btn-primary">
              Mark All Present
            </button>
            <button @click="markAllAbsent" class="btn-danger">
              Mark All Absent
            </button>
          </div>
        </div>

        <!-- Students List -->
        <div v-if="loading" class="text-center py-12">
          <div class="text-gray-500">Loading students...</div>
        </div>

        <div v-else-if="students.length === 0" class="text-center py-12">
          <div class="text-gray-500">No students enrolled in this class</div>
        </div>

        <div v-else class="card">
          <div class="mb-4 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">
              Student Attendance ({{ students.length }} students)
            </h3>
            <div class="text-sm text-gray-600">
              Present: {{ getPresentCount() }} | 
              Absent: {{ getAbsentCount() }} |
              Other: {{ getOtherCount() }}
            </div>
          </div>

          <div class="overflow-x-auto">
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
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="student in students" :key="student.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ student.last_name }}, {{ student.first_name }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ student.student_id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <select
                      v-model="attendanceRecords[student.id].status"
                      class="form-select w-40"
                      @change="updateAttendance(student.id)"
                    >
                      <option value="">Select Status</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                      <option value="early_leave">Early Leave</option>
                    </select>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      v-model="attendanceRecords[student.id].notes"
                      placeholder="Optional notes..."
                      class="form-input w-48"
                      @blur="updateAttendance(student.id)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Save Button -->
          <div class="mt-6 flex justify-between items-center pt-6 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              {{ unsavedChanges }} unsaved changes
            </div>
            <button 
              @click="saveAttendance"
              :disabled="saving"
              class="btn-primary disabled:opacity-50"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>Save Attendance</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { classesAPI, attendanceAPI, authAPI } from '../api'
import { format } from 'date-fns'

export default {
  name: 'AttendanceView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const classId = ref(route.params.classId)
    const selectedDate = ref(route.params.date || format(new Date(), 'yyyy-MM-dd'))
    
    const students = ref([])
    const classInfo = ref(null)
    const attendanceRecords = reactive({})
    const loading = ref(true)
    const saving = ref(false)
    const unsavedChanges = ref(0)

    const loadStudents = async () => {
      try {
        const response = await classesAPI.getStudents(classId.value)
        students.value = response.data
        
        students.value.forEach(student => {
          if (!attendanceRecords[student.id]) {
            attendanceRecords[student.id] = {
              student_id: student.id,
              class_id: classId.value,
              date: selectedDate.value,
              status: '',
              notes: ''
            }
          }
        })
      } catch (error) {
        console.error('Failed to load students:', error)
      }
    }

    const loadAttendance = async () => {
      try {
        const response = await attendanceAPI.getAttendance(classId.value, selectedDate.value)
        const existingAttendance = response.data
        
        students.value.forEach(student => {
          const existing = existingAttendance.find(a => a.student_id === student.id)
          if (existing) {
            attendanceRecords[student.id] = {
              student_id: student.id,
              class_id: classId.value,
              date: selectedDate.value,
              status: existing.status,
              notes: existing.notes || ''
            }
          } else {
            attendanceRecords[student.id] = {
              student_id: student.id,
              class_id: classId.value,
              date: selectedDate.value,
              status: '',
              notes: ''
            }
          }
        })
        
        unsavedChanges.value = 0
      } catch (error) {
        console.error('Failed to load attendance:', error)
      } finally {
        loading.value = false
      }
    }

    const loadClassInfo = async () => {
      try {
        const response = await classesAPI.getClasses()
        classInfo.value = response.data.find(c => c.id == classId.value)
      } catch (error) {
        console.error('Failed to load class info:', error)
      }
    }

    const updateAttendance = (studentId) => {
      attendanceRecords[studentId].date = selectedDate.value
      unsavedChanges.value++
    }

    const markAllPresent = () => {
      students.value.forEach(student => {
        attendanceRecords[student.id].status = 'present'
        attendanceRecords[student.id].date = selectedDate.value
      })
      unsavedChanges.value += students.value.length
    }

    const markAllAbsent = () => {
      students.value.forEach(student => {
        attendanceRecords[student.id].status = 'absent'
        attendanceRecords[student.id].date = selectedDate.value
      })
      unsavedChanges.value += students.value.length
    }

    const saveAttendance = async () => {
      saving.value = true
      
      try {
        const records = Object.values(attendanceRecords).filter(record => record.status)
        await attendanceAPI.recordAttendance(records)
        unsavedChanges.value = 0
        alert('Attendance saved successfully!')
      } catch (error) {
        console.error('Failed to save attendance:', error)
        alert('Failed to save attendance. Please try again.')
      } finally {
        saving.value = false
      }
    }

    const getPresentCount = () => {
      return Object.values(attendanceRecords).filter(r => r.status === 'present').length
    }

    const getAbsentCount = () => {
      return Object.values(attendanceRecords).filter(r => r.status === 'absent').length
    }

    const getOtherCount = () => {
      return Object.values(attendanceRecords).filter(r => 
        r.status && !['present', 'absent'].includes(r.status)
      ).length
    }

    const formatDate = (date) => {
      return format(new Date(date), 'MMMM d, yyyy')
    }

    const goBack = () => {
      const userRole = localStorage.getItem('user_role')
      if (userRole === 'admin') {
        router.push('/admin')
      } else {
        router.push('/teacher')
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

    watch(selectedDate, () => {
      Object.values(attendanceRecords).forEach(record => {
        record.date = selectedDate.value
      })
      loadAttendance()
    })

    onMounted(async () => {
      await Promise.all([
        loadClassInfo(),
        loadStudents()
      ])
      await loadAttendance()
    })

    return {
      classInfo,
      students,
      attendanceRecords,
      selectedDate,
      loading,
      saving,
      unsavedChanges,
      updateAttendance,
      markAllPresent,
      markAllAbsent,
      saveAttendance,
      getPresentCount,
      getAbsentCount,
      getOtherCount,
      formatDate,
      goBack,
      handleLogout,
      loadAttendance
    }
  }
}
</script>
