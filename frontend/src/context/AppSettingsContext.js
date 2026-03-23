import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

/* ═══════════════════════════════════════════════════════════════════
   APP SETTINGS CONTEXT
   Manages:
     • language  — 'en' | 'hi'
     • themeMode — 'light' | 'dark'
   Persists to localStorage.
   ═══════════════════════════════════════════════════════════════════ */

const AppSettingsContext = createContext(null);

export const useAppSettings = () => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be inside AppSettingsProvider');
  return ctx;
};

/* ─── Translation strings ───────────────────────────────────────── */
const TRANSLATIONS = {
  en: {
    // Navigation
    dashboard: 'Dashboard', students: 'Students', teachers: 'Teachers',
    classes: 'Classes', calendar: 'Calendar', tasks: 'Task Management', gallery: 'Photo Gallery', attendance: 'Attendance',
    fees: 'Fee Management', timetable: 'Timetable', homework: 'Homework', notices: 'Notice Board', library: 'Library', transport: 'Transport',
    results: 'My Results', content: 'Study Materials', tests: 'Online Tests',
    exams: 'Manage Exams', updateResults: 'Update Results', uploadContent: 'Upload Content',
    myTasks: 'My Tasks', profile: 'My Profile', scienceLab: 'Science Lab',

    // Settings
    settings: 'Settings', language: 'Language', appearance: 'Appearance',
    lightMode: 'Light Mode', darkMode: 'Dark Mode', english: 'English', hindi: 'Hindi',

    // Common
    save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete',
    add: 'Add', search: 'Search', loading: 'Loading...', error: 'Error',
    success: 'Success', close: 'Close', upload: 'Upload', view: 'View',
    name: 'Name', email: 'Email', phone: 'Phone', address: 'Address',
    gender: 'Gender', dob: 'Date of Birth', joinDate: 'Joining Date',
    qualification: 'Qualification', designation: 'Designation', subject: 'Subject',
    bio: 'Bio / About', photo: 'Photo', uploadPhoto: 'Upload Photo',
    changePhoto: 'Change Photo', admNo: 'Admission Number', class: 'Class',
    section: 'Section', rollNo: 'Roll Number', guardian: 'Guardian Name',
    guardianPhone: 'Guardian Phone', academicYear: 'Academic Year',

    // Teacher/Student profile
    teacherDetails: 'Teacher Details', studentDetails: 'Student Details',
    personalInfo: 'Personal Information', academicInfo: 'Academic Information',
    contactInfo: 'Contact Information', achievements: 'Achievements',
    qualifications: 'Qualifications', experience: 'Experience (years)',
    addTeacher: 'Add Teacher', editTeacher: 'Edit Teacher',
    addStudent: 'Add Student', editStudent: 'Edit Student',
    viewProfile: 'View Profile', editProfile: 'Edit Profile',
    saveChanges: 'Save Changes', firstName: 'First Name', lastName: 'Last Name',

    // Science Lab
    scienceLabTitle: 'Science Laboratory', theorySection: 'Theory',
    practicalSection: 'Practical Work', teacherSection: 'Teacher Instructions',
    studentSection: 'Student Guide', experiment: 'Experiment',
    objective: 'Objective', materials: 'Materials Required',
    procedure: 'Procedure', precautions: 'Safety Precautions',
    observations: 'Observations', conclusion: 'Conclusion',
    labRules: 'Laboratory Rules', apparatus: 'Apparatus',
    chemicals: 'Chemicals', safetyFirst: 'Safety First',

    // Portal
    adminPanel: 'Admin Panel', teacherPanel: 'Teacher Panel',
    studentPanel: 'Student Panel', logout: 'Logout',
    welcomeBack: 'Welcome back', notifications: 'Notifications',
  },

  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड', students: 'छात्र', teachers: 'शिक्षक',
    classes: 'कक्षाएं', calendar: 'कैलेंडर', tasks: 'कार्य प्रबंधन', gallery: 'फोटो गैलरी', attendance: 'उपस्थिति',
    fees: 'शुल्क प्रबंधन', timetable: 'समय सारिणी', homework: 'गृहकार्य', notices: 'सूचना पट्ट', library: 'पुस्तकालय', transport: 'परिवहन',
    results: 'मेरे परिणाम', content: 'अध्ययन सामग्री', tests: 'ऑनलाइन परीक्षण',
    exams: 'परीक्षा प्रबंधन', updateResults: 'परिणाम अपडेट करें', uploadContent: 'सामग्री अपलोड करें',
    myTasks: 'मेरे कार्य', profile: 'मेरी प्रोफ़ाइल', scienceLab: 'विज्ञान प्रयोगशाला',

    // Settings
    settings: 'सेटिंग्स', language: 'भाषा', appearance: 'दिखावट',
    lightMode: 'लाइट मोड', darkMode: 'डार्क मोड', english: 'अंग्रेज़ी', hindi: 'हिन्दी',

    // Common
    save: 'सहेजें', cancel: 'रद्द करें', edit: 'संपादित करें', delete: 'हटाएं',
    add: 'जोड़ें', search: 'खोजें', loading: 'लोड हो रहा है...', error: 'त्रुटि',
    success: 'सफलता', close: 'बंद करें', upload: 'अपलोड करें', view: 'देखें',
    name: 'नाम', email: 'ईमेल', phone: 'फ़ोन', address: 'पता',
    gender: 'लिंग', dob: 'जन्म तिथि', joinDate: 'ज्वाइनिंग तिथि',
    qualification: 'योग्यता', designation: 'पदनाम', subject: 'विषय',
    bio: 'परिचय / जानकारी', photo: 'फोटो', uploadPhoto: 'फोटो अपलोड करें',
    changePhoto: 'फोटो बदलें', admNo: 'प्रवेश संख्या', class: 'कक्षा',
    section: 'अनुभाग', rollNo: 'रोल नंबर', guardian: 'अभिभावक का नाम',
    guardianPhone: 'अभिभावक का फ़ोन', academicYear: 'शैक्षणिक वर्ष',

    // Teacher/Student profile
    teacherDetails: 'शिक्षक विवरण', studentDetails: 'छात्र विवरण',
    personalInfo: 'व्यक्तिगत जानकारी', academicInfo: 'शैक्षणिक जानकारी',
    contactInfo: 'संपर्क जानकारी', achievements: 'उपलब्धियां',
    qualifications: 'योग्यताएं', experience: 'अनुभव (वर्ष)',
    addTeacher: 'शिक्षक जोड़ें', editTeacher: 'शिक्षक संपादित करें',
    addStudent: 'छात्र जोड़ें', editStudent: 'छात्र संपादित करें',
    viewProfile: 'प्रोफ़ाइल देखें', editProfile: 'प्रोफ़ाइल संपादित करें',
    saveChanges: 'परिवर्तन सहेजें', firstName: 'पहला नाम', lastName: 'अंतिम नाम',

    // Science Lab
    scienceLabTitle: 'विज्ञान प्रयोगशाला', theorySection: 'सिद्धांत',
    practicalSection: 'प्रयोगात्मक कार्य', teacherSection: 'शिक्षक निर्देश',
    studentSection: 'छात्र मार्गदर्शिका', experiment: 'प्रयोग',
    objective: 'उद्देश्य', materials: 'आवश्यक सामग्री',
    procedure: 'प्रक्रिया', precautions: 'सुरक्षा सावधानियां',
    observations: 'अवलोकन', conclusion: 'निष्कर्ष',
    labRules: 'प्रयोगशाला नियम', apparatus: 'उपकरण',
    chemicals: 'रसायन', safetyFirst: 'सुरक्षा पहले',

    // Portal
    adminPanel: 'एडमिन पैनल', teacherPanel: 'शिक्षक पैनल',
    studentPanel: 'छात्र पैनल', logout: 'लॉग आउट',
    welcomeBack: 'वापसी पर स्वागत', notifications: 'सूचनाएं',
  },
};

export function AppSettingsProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem('sp_lang') || 'en'
  );
  const [themeMode, setThemeModeState] = useState(
    () => localStorage.getItem('sp_theme') || 'light'
  );

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('sp_lang', lang);
  };

  const setThemeMode = (mode) => {
    setThemeModeState(mode);
    localStorage.setItem('sp_theme', mode);
  };

  const t = useMemo(() => TRANSLATIONS[language] || TRANSLATIONS.en, [language]);

  const value = useMemo(() => ({
    language, setLanguage,
    themeMode, setThemeMode,
    t,
    isDark: themeMode === 'dark',
  }), [language, themeMode, t]);

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export default AppSettingsContext;
