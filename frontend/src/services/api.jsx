/**
 * services/api.js
 * Axios instance – base URL read from .env (VITE_API_BASE_URL)
 */
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Normalise error messages
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const detail = err.response?.data?.detail
    let message = 'Something went wrong'
    if (Array.isArray(detail)) {
      // FastAPI validation errors: [{loc, msg, type}, ...]
      message = detail.map((d) => d.msg).join(', ')
    } else if (typeof detail === 'string') {
      message = detail
    }
    return Promise.reject(new Error(message))
  },
)

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login:    (data) => api.post('/api/auth/login',    data),
}

// ─── Courses ──────────────────────────────────────────────────────────────
export const coursesAPI = {
  getAll:  (search = '') =>
    api.get('/api/courses', { params: search ? { search } : {} }),
  getById: (id)     => api.get(`/api/courses/${id}`),
  create:  (data)   => api.post('/api/courses', data),
  update:  (id, data) => api.put(`/api/courses/${id}`, data),
  remove:  (id)     => api.delete(`/api/courses/${id}`),
}

// ─── Enrollments (teacher) ────────────────────────────────────────────────
export const enrollmentsAPI = {
  list:   (courseId)           => api.get(`/api/courses/${courseId}/enrollments`),
  enroll: (courseId, username) => api.post(`/api/courses/${courseId}/enrollments`, { username }),
  remove: (courseId, enrollmentId) =>
    api.delete(`/api/courses/${courseId}/enrollments/${enrollmentId}`),
}

// ─── Users ────────────────────────────────────────────────────────────────
export const usersAPI = {
  searchStudents: (q = '') =>
    api.get('/api/users/students', { params: q ? { q } : {} }),
  myEnrolledCourses: () => api.get('/api/users/me/courses'),
}

export default api
