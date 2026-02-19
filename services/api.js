// frontend/src/services/api.js

import axios from 'axios';

// Set the base URL for the backend API
// In production, this would come from an environment variable
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Automatically attach the JWT token to the Authorization header
 * if it exists in local storage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Handle global errors like 401 Unauthorized (expired tokens)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login if unauthorized
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// --- API Methods ---

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  register: (userData) => api.post('/auth/register', userData),
};

export const studentAPI = {
  getStudents: (params) => api.get('/students', { params }),
  getStudentById: (id) => api.get(`/students/${id}`),
  addStudent: (studentData) => api.post('/students', studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`),
};

export const attendanceAPI = {
  markAttendance: (data) => api.post('/attendance', data),
  getReport: (params) => api.get('/attendance/report', { params }),
  getSummary: (section_id) => api.get('/attendance/summary', { params: { section_id } }),
};

// Generic helper for meta-data (Years, Branches, Courses)
export const academicAPI = {
  // These could be implemented in a metadata controller if needed
  getYears: () => api.get('/academic/years'),
  getBranches: () => api.get('/academic/branches'),
  getCourses: () => api.get('/academic/courses'),
};

export default api;