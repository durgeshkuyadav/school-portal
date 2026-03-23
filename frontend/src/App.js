import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import store from './store/store';
import { restoreSession } from './store/slices/authSlice';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { AppSettingsProvider, useAppSettings } from './context/AppSettingsContext';
import SettingsPanel from './components/settings/SettingsPanel';

// Public
import HomePage from './pages/public/HomePage';
import { TeacherDirectory, SchoolGallery, SchoolCalendar } from './pages/public/PublicPages';
import ForbiddenPage from './pages/ForbiddenPage';

// Auth
import LoginPage from './pages/auth/LoginPage';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import StudentResults from './pages/student/StudentResults';
import StudentContent from './pages/student/StudentContent';
import OnlineTest from './pages/student/OnlineTest';
import StudentProfile from './pages/student/StudentProfile';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import ManageResults from './pages/teacher/ManageResults';
import UploadContent from './pages/teacher/UploadContent';
import ManageExams from './pages/teacher/ManageExams';
import MyTasks from './pages/teacher/MyTasks';
import TeacherProfile from './pages/teacher/TeacherProfile';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageClasses from './pages/admin/ManageClasses';
import AdminCalendar from './pages/admin/AdminCalendar';
import ManageTasks from './pages/admin/ManageTasks';
import AdminGallery from './pages/admin/AdminGallery';

// Science Lab
import ScienceLab from './pages/ScienceLab';

// Attendance
import TakeAttendance from './pages/attendance/TakeAttendance';
import MyAttendance from './pages/attendance/MyAttendance';
import AttendanceReport from './pages/attendance/AttendanceReport';

const ADMIN_ROLES   = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
const TEACHER_ROLES = ['CLASS_TEACHER', 'SUBJECT_TEACHER', 'SCHOOL_ADMIN', 'SUPER_ADMIN'];

/* ─── Theme factory — switches between light/dark ────────── */
function createAppTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary:   { main: '#0B1F3A' },
      secondary: { main: '#1565C0' },
      success:   { main: '#2E7D32' },
      warning:   { main: '#F5A623' },
      error:     { main: '#C62828' },
      background: {
        default: mode === 'dark' ? '#0d1117' : '#F4F7FC',
        paper:   mode === 'dark' ? '#161b27' : '#ffffff',
      },
      text: {
        primary:   mode === 'dark' ? '#e0e6f0' : '#1a2340',
        secondary: mode === 'dark' ? '#8892a4' : '#607090',
      },
    },
    typography: { fontFamily: "'DM Sans','Roboto','Helvetica',sans-serif" },
    shape: { borderRadius: 10 },
    components: {
      MuiButton:    { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
      MuiCard:      { styleOverrides: { root: { boxShadow: mode === 'dark' ? '0 2px 12px rgba(0,0,0,.3)' : '0 2px 12px rgba(0,0,0,.07)' } } },
      MuiPaper:     { styleOverrides: { root: { backgroundImage: 'none' } } },
    },
  });
}

function AppRoutes() {
  const dispatch = useDispatch();
  const { themeMode } = useAppSettings();
  const theme = createAppTheme(themeMode);

  useEffect(() => { dispatch(restoreSession()); }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* ── PUBLIC ── */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/teachers" element={<TeacherDirectory />} />
        <Route path="/gallery"  element={<SchoolGallery />} />
        <Route path="/calendar" element={<SchoolCalendar />} />
        <Route path="/403"      element={<ForbiddenPage />} />

        {/* ── HIDDEN LOGIN ── */}
        <Route path="/portal-login" element={<LoginPage />} />
        <Route path="/login"        element={<LoginPage />} />

        {/* ── STUDENT ── */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <AppLayout role="student" />
          </ProtectedRoute>
        }>
          <Route path="dashboard"  element={<StudentDashboard />} />
          <Route path="results"    element={<StudentResults />} />
          <Route path="content"    element={<StudentContent />} />
          <Route path="tests"      element={<OnlineTest />} />
          <Route path="profile"    element={<StudentProfile />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="lab"        element={<ScienceLab />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── TEACHER ── */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={TEACHER_ROLES}>
            <AppLayout role="teacher" />
          </ProtectedRoute>
        }>
          <Route path="dashboard"  element={<TeacherDashboard />} />
          <Route path="exams"      element={<ManageExams />} />
          <Route path="results"    element={<ManageResults />} />
          <Route path="content"    element={<UploadContent />} />
          <Route path="tasks"      element={<MyTasks />} />
          <Route path="attendance" element={<TakeAttendance />} />
          <Route path="profile"    element={<TeacherProfile />} />
          <Route path="lab"        element={<ScienceLab />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── ADMIN ── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={ADMIN_ROLES}>
            <AppLayout role="admin" />
          </ProtectedRoute>
        }>
          <Route path="dashboard"  element={<AdminDashboard />} />
          <Route path="students"   element={<ManageStudents />} />
          <Route path="teachers"   element={<ManageTeachers />} />
          <Route path="classes"    element={<ManageClasses />} />
          <Route path="calendar"   element={<AdminCalendar />} />
          <Route path="tasks"      element={<ManageTasks />} />
          <Route path="gallery"    element={<AdminGallery />} />
          <Route path="attendance" element={<AttendanceReport />} />
          <Route path="lab"        element={<ScienceLab />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Settings panel on public pages */}
      <SettingsPanel />

      <ToastContainer position="top-right" autoClose={3000}
        toastStyle={{ borderRadius:12, fontFamily:"'DM Sans',sans-serif", fontSize:14 }} />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppSettingsProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppSettingsProvider>
    </Provider>
  );
}
