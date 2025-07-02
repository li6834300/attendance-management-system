import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import TeacherDashboard from '../components/TeacherDashboard.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import AttendanceView from '../components/AttendanceView.vue'
import StudentManagement from '../components/admin/StudentManagement.vue'
import Reports from '../components/admin/Reports.vue'
import ClassManagement from '../components/admin/ClassManagement.vue'
import UserManagement from '../components/admin/UserManagement.vue'
import StudentAttendanceDetails from '../components/admin/StudentAttendanceDetails.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/teacher',
    name: 'TeacherDashboard',
    component: TeacherDashboard,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/attendance/:classId/:date?',
    name: 'AttendanceView',
    component: AttendanceView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/students',
    name: 'StudentManagement',
    component: StudentManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/classes',
    name: 'ClassManagement',
    component: ClassManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/student-attendance/:studentId',
    name: 'StudentAttendanceDetails',
    component: StudentAttendanceDetails,
    meta: { requiresAuth: true, role: 'admin' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const userRole = localStorage.getItem('user_role')
  
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.role && userRole !== to.meta.role) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'admin') {
      next('/admin')
    } else if (userRole === 'teacher') {
      next('/teacher')
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router 