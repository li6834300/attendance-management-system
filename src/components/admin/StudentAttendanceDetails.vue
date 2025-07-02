<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <router-link to="/admin/reports" class="text-primary-600 hover:text-primary-800">
              ← Back to Reports
            </router-link>
            <h1 class="text-xl font-semibold text-gray-900">Student Attendance Details</h1>
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
        <div v-if="loading" class="text-center py-12">
          <div class="text-gray-500">Loading student data...</div>
        </div>

        <div v-else-if="!student" class="text-center py-12">
          <div class="text-gray-500">Student not found.</div>
        </div>

        <div v-else>
          <!-- Student Info Header -->
          <div class="mb-6 card">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">
                  {{ student.first_name }} {{ student.last_name }}
                </h2>
                <div class="space-y-1 text-gray-600">
                  <p><strong>Student ID:</strong> {{ student.student_id }}</p>
                  <p><strong>Grade:</strong> {{ student.grade_name }}</p>
                  <p v-if="student.email"><strong>Email:</strong> {{ student.email }}</p>
                  <p v-if="student.parent_name"><strong>Parent:</strong> {{ student.parent_name }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500">Period: {{ filters.startDate }} to {{ filters.endDate }}</div>
                <div class="mt-2">
                  <span class="text-2xl font-bold text-primary-600">{{ attendanceRate }}%</span>
                  <div class="text-sm text-gray-500">Attendance Rate</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="mb-6 grid gap-4 md:grid-cols-5">
            <div class="card text-center">
              <div class="text-xl font-bold text-green-600">{{ summary.present }}</div>
              <div class="text-sm text-gray-600">Present</div>
            </div>
            <div class="card text-center">
              <div class="text-xl font-bold text-red-600">{{ summary.absent }}</div>
              <div class="text-sm text-gray-600">Absent</div>
            </div>
            <div class="card text-center">
              <div class="text-xl font-bold text-yellow-600">{{ summary.late }}</div>
              <div class="text-sm text-gray-600">Late</div>
            </div>
            <div class="card text-center">
              <div class="text-xl font-bold text-blue-600">{{ summary.excused }}</div>
              <div class="text-sm text-gray-600">Excused</div>
            </div>
            <div class="card text-center">
              <div class="text-xl font-bold text-purple-600">{{ summary.earlyLeave }}</div>
              <div class="text-sm text-gray-600">Early Leave</div>
            </div>
          </div>

          <!-- Attendance Records -->
          <div class="card">
            <div class="mb-4 flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">
                Attendance Records ({{ attendanceRecords.length }} entries)
              </h3>
              <div class="flex space-x-2">
                <button @click="exportToCSV" :disabled="!attendanceRecords.length" class="btn-secondary text-sm disabled:opacity-50">
                  Export CSV
                </button>
              </div>
            </div>

            <div v-if="attendanceRecords.length === 0" class="text-center py-8">
              <div class="text-gray-500">No attendance records found for this period.</div>
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teacher
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="record in attendanceRecords" :key="`${record.class_id}-${record.date}`">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ formatDate(record.date) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ record.class_name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ record.subject_name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {{ record.teacher_first_name }} {{ record.teacher_last_name }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="getStatusClass(record.status)">
                        {{ record.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {{ record.notes || '-' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        @click="editRecord(record)" 
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
    </div>

    <!-- Edit Attendance Modal -->
    <div v-if="showEditModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="showEditModal = false">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveEdit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Attendance Record</h3>
              
              <div v-if="editingRecord" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="text" :value="formatDate(editingRecord.date)" readonly class="form-input bg-gray-50" />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <input type="text" :value="editingRecord.class_name" readonly class="form-input bg-gray-50" />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status*</label>
                  <select v-model="editingRecord.status" required class="form-select">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                    <option value="early_leave">Early Leave</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea v-model="editingRecord.notes" rows="3" class="form-input"></textarea>
                </div>
              </div>
            </div>
            
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="saving" class="btn-primary sm:ml-3 disabled:opacity-50">
                <span v-if="saving">Saving...</span>
                <span v-else>Save Changes</span>
              </button>
              <button type="button" @click="showEditModal = false" class="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminAPI, attendanceAPI, authAPI } from '../../api'

export default {
  name: 'StudentAttendanceDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const student = ref(null)
    const attendanceRecords = ref([])
    const loading = ref(true)
    const saving = ref(false)
    const showEditModal = ref(false)
    const editingRecord = ref(null)
    
    const filters = ref({
      startDate: route.query.start_date || '',
      endDate: route.query.end_date || '',
      classId: route.query.class_id || ''
    })

    const summary = computed(() => {
      const counts = attendanceRecords.value.reduce((acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1
        return acc
      }, {})
      
      return {
        present: counts.present || 0,
        absent: counts.absent || 0,
        late: counts.late || 0,
        excused: counts.excused || 0,
        earlyLeave: counts.early_leave || 0
      }
    })

    const attendanceRate = computed(() => {
      const total = attendanceRecords.value.length
      if (total === 0) return 0
      return Math.round((summary.value.present / total) * 100)
    })

    const loadStudentData = async () => {
      try {
        const params = {}
        if (filters.value.startDate) params.start_date = filters.value.startDate
        if (filters.value.endDate) params.end_date = filters.value.endDate
        if (filters.value.classId) params.class_id = filters.value.classId
        
        const response = await adminAPI.getStudentAttendanceDetails(route.params.studentId, params)
        student.value = response.data.student
        attendanceRecords.value = response.data.attendance
      } catch (error) {
        console.error('Failed to load student data:', error)
        alert('Failed to load student data. Please try again.')
      } finally {
        loading.value = false
      }
    }

    const editRecord = (record) => {
      editingRecord.value = { ...record }
      showEditModal.value = true
    }

    const saveEdit = async () => {
      if (!editingRecord.value) return
      
      saving.value = true
      try {
        await attendanceAPI.recordAttendance([{
          student_id: student.value.id,
          class_id: editingRecord.value.class_id,
          date: editingRecord.value.date,
          status: editingRecord.value.status,
          notes: editingRecord.value.notes
        }])
        
        // Update the record in the local array
        const index = attendanceRecords.value.findIndex(r => 
          r.class_id === editingRecord.value.class_id && r.date === editingRecord.value.date
        )
        if (index !== -1) {
          attendanceRecords.value[index] = { ...editingRecord.value }
        }
        
        showEditModal.value = false
        alert('Attendance record updated successfully!')
      } catch (error) {
        console.error('Failed to update attendance:', error)
        alert('Failed to update attendance record. Please try again.')
      } finally {
        saving.value = false
      }
    }

    const getStatusClass = (status) => {
      const classes = {
        present: 'status-present',
        absent: 'status-absent',
        late: 'status-late',
        excused: 'status-excused',
        early_leave: 'status-early-leave'
      }
      return classes[status] || 'status-excused'
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString()
    }

    const exportToCSV = () => {
      const headers = ['Date', 'Class', 'Subject', 'Teacher', 'Status', 'Notes']
      const csvData = [
        headers,
        ...attendanceRecords.value.map(record => [
          record.date,
          record.class_name,
          record.subject_name,
          `${record.teacher_first_name} ${record.teacher_last_name}`,
          record.status,
          record.notes || ''
        ])
      ]

      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${student.value.student_id}_attendance_${filters.value.startDate}_${filters.value.endDate}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
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
      loadStudentData()
    })

    return {
      student,
      attendanceRecords,
      loading,
      saving,
      showEditModal,
      editingRecord,
      filters,
      summary,
      attendanceRate,
      editRecord,
      saveEdit,
      getStatusClass,
      formatDate,
      exportToCSV,
      handleLogout
    }
  }
}
</script> 