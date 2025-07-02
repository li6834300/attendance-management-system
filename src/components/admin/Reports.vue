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
            <h1 class="text-xl font-semibold text-gray-900">Reports & Analytics</h1>
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
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Attendance Reports</h2>
          <p class="text-gray-600">Generate and export attendance analytics</p>
        </div>

        <!-- Filters -->
        <div class="mb-6 card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Report Filters</h3>
          <div class="grid gap-4 md:grid-cols-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input v-model="filters.startDate" type="date" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input v-model="filters.endDate" type="date" class="form-input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select v-model="filters.classId" class="form-select">
                <option value="">All Classes</option>
                <option v-for="cls in classes" :key="cls.id" :value="cls.id">
                  {{ cls.name }} - {{ cls.subject_name }}
                </option>
              </select>
            </div>
            <div class="flex items-end">
              <button @click="generateReport" :disabled="loading" class="btn-primary w-full disabled:opacity-50">
                <span v-if="loading">Generating...</span>
                <span v-else>Generate Report</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Export Options -->
        <div class="mb-6 card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Export Options</h3>
          <div class="flex space-x-4">
            <button @click="exportToCSV" :disabled="!sortedReportData.length" class="btn-secondary disabled:opacity-50">
              Export to CSV
            </button>
            <button @click="exportToExcel" :disabled="!sortedReportData.length" class="btn-secondary disabled:opacity-50">
              Export to Excel
            </button>
            <button @click="exportToPDF" :disabled="!sortedReportData.length" class="btn-secondary disabled:opacity-50">
              Export to PDF
            </button>
          </div>
        </div>

        <!-- Summary Stats -->
        <div v-if="sortedReportData.length > 0" class="mb-6 grid gap-6 md:grid-cols-4">
          <div class="card text-center">
            <div class="text-2xl font-bold text-green-600">{{ summary.totalPresent }}</div>
            <div class="text-sm text-gray-600">Total Present</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-red-600">{{ summary.totalAbsent }}</div>
            <div class="text-sm text-gray-600">Total Absent</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ summary.totalLate }}</div>
            <div class="text-sm text-gray-600">Total Late</div>
          </div>
          <div class="card text-center">
            <div class="text-2xl font-bold text-primary-600">{{ summary.attendanceRate }}%</div>
            <div class="text-sm text-gray-600">Attendance Rate</div>
          </div>
        </div>

        <!-- Report Data -->
        <div v-if="sortedReportData.length > 0" class="card">
          <div class="mb-4 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900">
              Attendance Summary ({{ sortedReportData.length }} records)
            </h3>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    @click="sortBy('student_name')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Student</span>
                      <span class="text-gray-400">
                        <svg v-if="sortColumn === 'student_name'" class="w-3 h-3" :class="{ 'rotate-180': sortDirection === 'desc' }" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    @click="sortBy('present_count')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Present</span>
                      <span class="text-gray-400">
                        <svg v-if="sortColumn === 'present_count'" class="w-3 h-3" :class="{ 'rotate-180': sortDirection === 'desc' }" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    @click="sortBy('absent_count')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Absent</span>
                      <span class="text-gray-400">
                        <svg v-if="sortColumn === 'absent_count'" class="w-3 h-3" :class="{ 'rotate-180': sortDirection === 'desc' }" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    @click="sortBy('late_count')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Late</span>
                      <span class="text-gray-400">
                        <svg v-if="sortColumn === 'late_count'" class="w-3 h-3" :class="{ 'rotate-180': sortDirection === 'desc' }" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    @click="sortBy('excused_count')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Excused</span>
                      <span class="text-gray-400">
                        <svg v-if="sortColumn === 'excused_count'" class="w-3 h-3" :class="{ 'rotate-180': sortDirection === 'desc' }" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    @click="sortBy('early_leave_count')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Early Leave</span>
                      <span class="text-gray-400">
                        <svg v-if="sortColumn === 'early_leave_count'" class="w-3 h-3" :class="{ 'rotate-180': sortDirection === 'desc' }" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    @click="sortBy('total_days')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Total Days</span>
                      <span class="text-gray-400">
                        <svg v-if="sortColumn === 'total_days'" class="w-3 h-3" :class="{ 'rotate-180': sortDirection === 'desc' }" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th 
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    @click="sortBy('attendance_rate')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Attendance %</span>
                      <span class="text-gray-400">
                        <svg v-if="sortColumn === 'attendance_rate'" class="w-3 h-3" :class="{ 'rotate-180': sortDirection === 'desc' }" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                        <svg v-else class="w-3 h-3 opacity-30" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                        </svg>
                      </span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="record in sortedReportData" :key="`${record.student_id}-${record.class_name}`">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ record.last_name }}, {{ record.first_name }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ record.student_id }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ record.class_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {{ record.present_count }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {{ record.absent_count }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                    {{ record.late_count }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {{ record.excused_count }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-purple-600 font-medium">
                    {{ record.early_leave_count }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {{ record.total_days }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span :class="getAttendanceRateClass(record.attendance_rate)">
                      {{ record.attendance_rate }}%
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      @click="viewStudentAttendance(record)" 
                      class="text-primary-600 hover:text-primary-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- No Data Message -->
        <div v-else-if="!loading" class="card text-center py-12">
          <div class="text-gray-500">
            No attendance data found for the selected criteria. Please adjust your filters and try again.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminAPI, classesAPI, authAPI } from '../../api'
import { format, subMonths } from 'date-fns'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default {
  name: 'Reports',
  setup() {
    const router = useRouter()
    const reportData = ref([])
    const classes = ref([])
    const loading = ref(false)
    const sortColumn = ref('')
    const sortDirection = ref('asc')

    const filters = ref({
      startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      classId: ''
    })

    const sortedReportData = computed(() => {
      if (!reportData.value.length || !sortColumn.value) {
        return reportData.value
      }

      return [...reportData.value].sort((a, b) => {
        let aVal, bVal

        // Special handling for student name sorting
        if (sortColumn.value === 'student_name') {
          // Sort by last name first, then first name
          aVal = `${a.last_name}, ${a.first_name}`.toLowerCase()
          bVal = `${b.last_name}, ${b.first_name}`.toLowerCase()
        } else {
          aVal = a[sortColumn.value]
          bVal = b[sortColumn.value]

          // Convert to numbers for numeric columns
          if (typeof aVal === 'string' && !isNaN(aVal)) {
            aVal = parseInt(aVal)
          }
          if (typeof bVal === 'string' && !isNaN(bVal)) {
            bVal = parseInt(bVal)
          }
        }

        if (aVal < bVal) {
          return sortDirection.value === 'asc' ? -1 : 1
        }
        if (aVal > bVal) {
          return sortDirection.value === 'asc' ? 1 : -1
        }
        return 0
      })
    })

    const summary = computed(() => {
      if (!reportData.value.length) {
        return {
          totalPresent: 0,
          totalAbsent: 0,
          totalLate: 0,
          attendanceRate: 0
        }
      }

      const totals = reportData.value.reduce((acc, record) => {
        acc.present += parseInt(record.present_count)
        acc.absent += parseInt(record.absent_count)
        acc.late += parseInt(record.late_count)
        acc.totalDays += parseInt(record.total_days)
        return acc
      }, { present: 0, absent: 0, late: 0, totalDays: 0 })

      const attendanceRate = totals.totalDays > 0 
        ? Math.round((totals.present / totals.totalDays) * 100)
        : 0

      return {
        totalPresent: totals.present,
        totalAbsent: totals.absent,
        totalLate: totals.late,
        attendanceRate
      }
    })

    const loadClasses = async () => {
      try {
        const response = await classesAPI.getClasses()
        classes.value = response.data
      } catch (error) {
        console.error('Failed to load classes:', error)
      }
    }

    const generateReport = async () => {
      loading.value = true
      try {
        const params = {
          start_date: filters.value.startDate,
          end_date: filters.value.endDate
        }
        
        if (filters.value.classId) {
          params.class_id = filters.value.classId
        }

        const response = await adminAPI.getAttendanceSummary(params)
        reportData.value = response.data.map(record => ({
          ...record,
          attendance_rate: record.total_days > 0 
            ? Math.round((record.present_count / record.total_days) * 100)
            : 0
        }))
      } catch (error) {
        console.error('Failed to generate report:', error)
        alert('Failed to generate report. Please try again.')
      } finally {
        loading.value = false
      }
    }

    const exportToCSV = () => {
      const headers = [
        'Student ID', 'First Name', 'Last Name', 'Class', 'Present', 'Absent', 
        'Late', 'Excused', 'Early Leave', 'Total Days', 'Attendance Rate (%)'
      ]
      
      const csvData = [
        headers,
        ...sortedReportData.value.map(record => [
          record.student_id,
          record.first_name,
          record.last_name,
          record.class_name,
          record.present_count,
          record.absent_count,
          record.late_count,
          record.excused_count,
          record.early_leave_count,
          record.total_days,
          record.attendance_rate
        ])
      ]

      const csvContent = csvData.map(row => row.join(',')).join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `attendance_report_${filters.value.startDate}_${filters.value.endDate}.csv`
      link.click()
      window.URL.revokeObjectURL(url)
    }

    const exportToExcel = () => {
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(sortedReportData.value.map(record => ({
        'Student ID': record.student_id,
        'First Name': record.first_name,
        'Last Name': record.last_name,
        'Class': record.class_name,
        'Present': record.present_count,
        'Absent': record.absent_count,
        'Late': record.late_count,
        'Excused': record.excused_count,
        'Early Leave': record.early_leave_count,
        'Total Days': record.total_days,
        'Attendance Rate (%)': record.attendance_rate
      })))

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report')
      XLSX.writeFile(workbook, `attendance_report_${filters.value.startDate}_${filters.value.endDate}.xlsx`)
    }

    const exportToPDF = () => {
      const doc = new jsPDF()
      
      doc.setFontSize(20)
      doc.text('Attendance Report', 20, 20)
      
      doc.setFontSize(12)
      doc.text(`Period: ${filters.value.startDate} to ${filters.value.endDate}`, 20, 35)
      
      const tableData = sortedReportData.value.map(record => [
        record.student_id,
        `${record.first_name} ${record.last_name}`,
        record.class_name,
        record.present_count,
        record.absent_count,
        record.late_count,
        record.excused_count,
        record.early_leave_count,
        record.total_days,
        `${record.attendance_rate}%`
      ])

      doc.autoTable({
        head: [['ID', 'Student', 'Class', 'Present', 'Absent', 'Late', 'Excused', 'Early Leave', 'Total', 'Rate']],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 115, 104] }
      })

      doc.save(`attendance_report_${filters.value.startDate}_${filters.value.endDate}.pdf`)
    }

    const getAttendanceRateClass = (rate) => {
      if (rate >= 90) return 'text-green-600'
      if (rate >= 80) return 'text-yellow-600'
      return 'text-red-600'
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

    const sortBy = (column) => {
      if (sortColumn.value === column) {
        // Toggle direction if same column
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
      } else {
        // New column, set appropriate default direction
        sortColumn.value = column
        // Default to ascending for names (A-Z), descending for counts (higher is usually more important)
        sortDirection.value = column === 'student_name' ? 'asc' : 'desc'
      }
    }

    const viewStudentAttendance = (record) => {
      // Navigate to a detailed view or show a modal with individual attendance records
      router.push(`/admin/student-attendance/${record.student_id}?class_id=${record.class_id || ''}&start_date=${filters.value.startDate}&end_date=${filters.value.endDate}`)
    }

    onMounted(() => {
      loadClasses()
      // Load data by default
      generateReport()
    })

    return {
      reportData,
      sortedReportData,
      classes,
      loading,
      filters,
      summary,
      sortColumn,
      sortDirection,
      generateReport,
      sortBy,
      exportToCSV,
      exportToExcel,
      exportToPDF,
      getAttendanceRateClass,
      viewStudentAttendance,
      handleLogout
    }
  }
}
</script> 