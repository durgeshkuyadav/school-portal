import apiClient from './apiClient';

// ── AUTH ─────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: (refreshToken) => apiClient.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken }),
  register: (userData) => apiClient.post('/auth/register', userData),
  changePassword: (data) => apiClient.put('/auth/password', data),
  autoCreateStudent: (data) => apiClient.post('/auth/auto-create/student', data),
  autoCreateTeacher: (data) => apiClient.post('/auth/auto-create/teacher', data),
  getUserById: (id) => apiClient.get(`/auth/user/${id}`),
};

// ── CLASSES ───────────────────────────────────────────────────────
export const classApi = {
  getAll: () => apiClient.get('/students/classes'),
  create: (data) => apiClient.post('/students/classes', data),
  getById: (id) => apiClient.get(`/students/classes/${id}`),
};

// ── STUDENTS ──────────────────────────────────────────────────────
export const studentApi = {
  getAll: (page = 0, size = 20) => apiClient.get(`/students?page=${page}&size=${size}`),
  getById: (id) => apiClient.get(`/students/${id}`),
  getByClass: (classId) => apiClient.get(`/students/class/${classId}`),
  getByAdmissionNumber: (admNo) => apiClient.get(`/students/admission/${admNo}`),
  create: (data) => apiClient.post('/students', data),
  update: (id, data) => apiClient.put(`/students/${id}`, data),
  promote: (studentId, newClassId) => apiClient.put(`/students/${studentId}/promote/${newClassId}`),
};

// ── ACADEMIC (Exams & Results) ────────────────────────────────────
export const academicApi = {
  createExam: (data) => apiClient.post('/academic/exams', data),
  getExamsByClass: (classId, year) => apiClient.get(`/academic/exams/class/${classId}?year=${year}`),
  saveResult: (examId, data) => apiClient.post(`/academic/exams/${examId}/results`, data),
  bulkSaveResults: (examId, data) => apiClient.post(`/academic/exams/${examId}/results/bulk`, data),
  publishResults: (examId) => apiClient.put(`/academic/exams/${examId}/publish`),
  getStudentResults: (studentId, year) => apiClient.get(`/academic/results/student/${studentId}?year=${year}`),
  getClassResults: (examId) => apiClient.get(`/academic/exams/${examId}/results`),
  getReportCard: (studentId, year) => apiClient.get(`/academic/report-card/${studentId}?year=${year}`),
};

// ── CONTENT ───────────────────────────────────────────────────────
export const contentApi = {
  getMyContent: () => apiClient.get('/content/my-content'),
  getClassContent: (classId) => apiClient.get(`/content/class/${classId}`),
  getStudentContent: () => apiClient.get('/content/student'), // Uses JWT claims
  upload: (data) => apiClient.post('/content/upload', data),
  delete: (contentId) => apiClient.delete(`/content/${contentId}`),
};

// ── TEACHERS ──────────────────────────────────────────────────────
export const teacherApi = {
  getAll: () => apiClient.get('/teachers'),
  getPublicProfiles: () => apiClient.get('/teachers/public'),
  getById: (id) => apiClient.get(`/teachers/${id}`),
  create: (data) => apiClient.post('/teachers', data),
  update: (id, data) => apiClient.put(`/teachers/${id}`, data),
  addQualification: (id, data) => apiClient.post(`/teachers/${id}/qualifications`, data),
  addAchievement: (id, data) => apiClient.post(`/teachers/${id}/achievements`, data),
};

// ── CALENDAR ──────────────────────────────────────────────────────
export const calendarApi = {
  getEvents: (month, year) => apiClient.get(`/calendar/events?month=${month}&year=${year}`),
  createEvent: (data) => apiClient.post('/calendar/events', data),
  updateEvent: (id, data) => apiClient.put(`/calendar/events/${id}`, data),
  deleteEvent: (id) => apiClient.delete(`/calendar/events/${id}`),
};

// ── ONLINE TESTS ──────────────────────────────────────────────────
export const testApi = {
  getAvailableTests: () => apiClient.get('/tests/available'),
  getTestById: (id) => apiClient.get(`/tests/${id}`),
  createTest: (data) => apiClient.post('/tests', data),
  startAttempt: (testId) => apiClient.post(`/tests/${testId}/attempt`),
  submitAttempt: (testId, attemptId, answers) =>
    apiClient.post(`/tests/${testId}/attempt/${attemptId}/submit`, { answers }),
  getMyAttempts: () => apiClient.get('/tests/my-attempts'),
  getTestResults: (testId) => apiClient.get(`/tests/${testId}/results`),
};

// ── TASKS ─────────────────────────────────────────────────────────
export const taskApi = {
  createTask: (data) => apiClient.post('/students/tasks', data),
  getTasksIAssigned: () => apiClient.get('/students/tasks/assigned-by-me'),
  getAllTasks: () => apiClient.get('/students/tasks/all'),
  getMyTasks: () => apiClient.get('/students/tasks/my-tasks'),
  updateStatus: (taskId, data) => apiClient.put(`/students/tasks/${taskId}/status`, data),
  addRemark: (taskId, data) => apiClient.put(`/students/tasks/${taskId}/remark`, data),
  updateTask: (taskId, data) => apiClient.put(`/students/tasks/${taskId}`, data),
  deleteTask: (taskId) => apiClient.delete(`/students/tasks/${taskId}`),
  getStats: () => apiClient.get('/students/tasks/stats'),
};

// ── ATTENDANCE ────────────────────────────────────────────────────
export const attendanceApi = {
  // Teacher: poori class ka bulk attendance mark karo
  markBulk: (data) => apiClient.post('/attendance/bulk', data),

  // Teacher/Admin: ek din ki class attendance dekho
  getClassByDate: (classId, date) =>
    apiClient.get(`/attendance/class/${classId}/date/${date}`),

  // Teacher: aaj ka status (marked hai ya nahi)
  getTodayStatus: (classId) =>
    apiClient.get(`/attendance/class/${classId}/today`),

  // Student/Parent: attendance summary + percentage
  getStudentSummary: (studentId, from, to) =>
    apiClient.get(`/attendance/student/${studentId}/summary?from=${from}&to=${to}`),

  // Student: attendance list (calendar ke liye)
  getStudentList: (studentId, from, to) =>
    apiClient.get(`/attendance/student/${studentId}?from=${from}&to=${to}`),

  // Admin: monthly report
  getMonthlyReport: (classId, month, year) =>
    apiClient.get(`/attendance/class/${classId}/report?month=${month}&year=${year}`),
};

// ── PUBLIC CONTENT (gallery + articles — no login needed) ─────────
export const publicApi = {
  getContent: (type) => apiClient.get(`/content/public${type ? `?type=${type}` : ''}`),
  getTeachers: () => apiClient.get('/teachers/public'),
  getCalendarEvents: (month, year) => apiClient.get(`/calendar/public/events?month=${month}&year=${year}`),
  getHolidays: () => apiClient.get('/calendar/public/holidays'),
};
