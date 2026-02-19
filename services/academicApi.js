// frontend/src/services/academicApi.js

import api from './api';

/**
 * Academic API Service
 * Handles fetching of metadata such as years, branches, and sections
 * which are used for filtering and student registration.
 */
export const academicAPI = {
  // Fetch all academic years
  getYears: () => api.get('/academic/years'),

  // Fetch all branches
  getBranches: () => api.get('/academic/branches'),

  // Fetch all courses
  getCourses: () => api.get('/academic/courses'),

  // Fetch sections (can be filtered by year and branch)
  getSections: (params) => api.get('/academic/sections', { params }),

  // Fetch sections assigned to a specific faculty member
  getFacultySections: (facultyId) => api.get(`/academic/faculty-sections/${facultyId}`),
};

export default academicAPI;