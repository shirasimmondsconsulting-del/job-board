import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => apiClient.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => apiClient.post('/auth/verify-email', { token }),
  resendVerification: (email) => apiClient.post('/auth/resend-verification', { email }),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/update-profile', data),
  changePassword: (currentPassword, newPassword) => apiClient.put('/auth/change-password', { currentPassword, newPassword }),
  logout: () => apiClient.post('/auth/logout')
};

// Jobs endpoints
export const jobsApi = {
  getAll: (filters = {}) => apiClient.get('/jobs', { params: filters }),
  getOne: (id) => apiClient.get(`/jobs/${id}`),
  search: (query) => apiClient.get('/jobs/search', { params: { q: query } }),
  getStats: () => apiClient.get('/jobs/stats'),
  create: (jobData) => apiClient.post('/jobs', jobData),
  update: (id, jobData) => apiClient.put(`/jobs/${id}`, jobData),
  delete: (id) => apiClient.delete(`/jobs/${id}`),
  publish: (id) => apiClient.post(`/jobs/${id}/publish`),
  unpublish: (id) => apiClient.post(`/jobs/${id}/unpublish`),
  getMyJobs: () => apiClient.get('/jobs/employer/my-jobs'),
  getAnalytics: (id) => apiClient.get(`/jobs/${id}/analytics`),
  getApplications: (id) => apiClient.get(`/jobs/${id}/applications`)
};

// Companies endpoints
export const companiesApi = {
  getAll: () => apiClient.get('/companies'),
  getOne: (id) => apiClient.get(`/companies/${id}`),
  search: (query) => apiClient.get('/companies/search', { params: { q: query } }),
  getJobs: (id) => apiClient.get(`/companies/${id}/jobs`),
  getReviews: (id) => apiClient.get(`/companies/${id}/reviews`),
  create: (companyData) => apiClient.post('/companies', companyData),
  update: (id, companyData) => apiClient.put(`/companies/${id}`, companyData),
  delete: (id) => apiClient.delete(`/companies/${id}`),
  requestVerification: (id) => apiClient.post(`/companies/${id}/verify`),
  uploadLogo: (id, formData) => apiClient.post(`/companies/${id}/upload-logo`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBanner: (id, formData) => apiClient.post(`/companies/${id}/upload-banner`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyCompanies: () => apiClient.get('/companies/employer/my-companies'),
  getDashboard: (id) => apiClient.get(`/companies/${id}/dashboard`)
};

// Applications endpoints
export const applicationsApi = {
  getAll: (filters = {}) => apiClient.get('/applications', { params: filters }),
  getOne: (id) => apiClient.get(`/applications/${id}`),
  submit: (applicationData) => apiClient.post('/applications', applicationData),
  updateStatus: (id, status, rejectionReason) => apiClient.put(`/applications/${id}/status`, { status, rejectionReason }),
  withdraw: (id) => apiClient.delete(`/applications/${id}`),
  shortlist: (id) => apiClient.post(`/applications/${id}/shortlist`),
  accept: (id) => apiClient.post(`/applications/${id}/accept`),
  reject: (id, reason) => apiClient.post(`/applications/${id}/reject`, { reason })
};

// Saved Jobs endpoints
export const savedJobsApi = {
  getAll: (filters = {}) => apiClient.get('/saved-jobs', { params: filters }),
  save: (jobId) => apiClient.post('/saved-jobs', { jobId }),
  remove: (jobId) => apiClient.delete(`/saved-jobs/${jobId}`),
  check: (jobId) => apiClient.get(`/saved-jobs/check/${jobId}`),
  getCount: () => apiClient.get('/saved-jobs/count'),
  bulkRemove: (jobIds) => apiClient.delete('/saved-jobs/bulk', { data: { jobIds } })
};

// Reviews endpoints
export const reviewsApi = {
  getCompanyReviews: (companyId, filters = {}) => apiClient.get(`/reviews/company/${companyId}`, { params: filters }),
  getCompanyStats: (companyId) => apiClient.get(`/reviews/company/${companyId}/stats`),
  getMyReviews: (filters = {}) => apiClient.get('/reviews/my-reviews', { params: filters }),
  create: (reviewData) => apiClient.post('/reviews', reviewData),
  update: (id, reviewData) => apiClient.put(`/reviews/${id}`, reviewData),
  delete: (id) => apiClient.delete(`/reviews/${id}`),
  like: (id) => apiClient.post(`/reviews/${id}/like`),
  report: (id, reportData) => apiClient.post(`/reviews/${id}/report`, reportData)
};

// Notifications endpoints
export const notificationsApi = {
  getAll: (filters = {}) => apiClient.get('/notifications', { params: filters }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => apiClient.put('/notifications/mark-all-read'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
  deleteAll: () => apiClient.delete('/notifications'),
  getCount: () => apiClient.get('/notifications/count'),
  getTypes: () => apiClient.get('/notifications/types'),
  updatePreferences: (preferences) => apiClient.put('/notifications/preferences', preferences),
  getPreferences: () => apiClient.get('/notifications/preferences')
};

// Users endpoints
export const usersApi = {
  getProfile: () => apiClient.get('/users/profile'),
  getJobSeekers: (params) => apiClient.get('/users/job-seekers', { params }),
  getPublicProfile: (id) => apiClient.get(`/users/${id}`),
  updateProfile: (profileData) => apiClient.put('/users/profile', profileData),
  uploadResume: (formData) => apiClient.post('/users/upload-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadProfileImage: (formData) => apiClient.post('/users/upload-profile-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard: () => apiClient.get('/users/dashboard'),
  getApplications: () => apiClient.get('/users/applications'),
  getSavedJobs: () => apiClient.get('/users/saved-jobs'),
  getJobRecommendations: () => apiClient.get('/users/job-recommendations'),
  updatePreferences: (preferences) => apiClient.put('/users/preferences', preferences)
};

export default apiClient;