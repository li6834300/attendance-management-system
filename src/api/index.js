import axios from 'axios'

const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8787' 
  : 'https://attendance-api-backup.lizhien277.workers.dev'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_role')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me')
}

export const classesAPI = {
  getClasses: () => api.get('/api/classes'),
  getStudents: (classId) => api.get(`/api/classes/${classId}/students`)
}

export const attendanceAPI = {
  getAttendance: (classId, date) => api.get(`/api/attendance/${classId}/${date}`),
  recordAttendance: (records) => api.post('/api/attendance', { records })
}

export const adminAPI = {
  getStudents: () => api.get('/api/admin/students'),
  createStudent: (student) => api.post('/api/admin/students', student),
  updateStudent: (id, student) => api.put(`/api/admin/students/${id}`, student),
  deleteStudent: (id) => api.delete(`/api/admin/students/${id}`),
  importStudents: (students) => api.post('/api/admin/students/import', { students }),
  getClasses: () => api.get('/api/admin/classes'),
  createClass: (cls) => api.post('/api/admin/classes', cls),
  updateClass: (id, cls) => api.put(`/api/admin/classes/${id}`, cls),
  getClassEnrollments: (classId) => api.get(`/api/admin/classes/${classId}/enrollments`),
  addStudentToClass: (classId, studentId) => api.post(`/api/admin/classes/${classId}/enrollments`, { student_id: studentId }),
  removeStudentFromClass: (classId, studentId) => api.delete(`/api/admin/classes/${classId}/enrollments/${studentId}`),
  getUsers: () => api.get('/api/admin/users'),
  createUser: (user) => api.post('/api/admin/users', user),
  getUserClasses: (userId) => api.get(`/api/users/${userId}/classes`),
  getStudentAttendanceDetails: (studentId, params) => api.get(`/api/admin/student-attendance/${studentId}`, { params }),
  getAttendanceSummary: (params) => api.get('/api/reports/attendance-summary', { params }),
  getDashboardStats: () => api.get('/api/admin/dashboard-stats')
}

export const dataAPI = {
  getGrades: () => api.get('/api/grades'),
  getSubjects: () => api.get('/api/subjects')
}

export default api 