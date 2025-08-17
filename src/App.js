import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import ScrollToTop from './utils/ScrollToTop.js';
import { useAuth } from '../src/utils/AuthContext.js';

// Layout Component
import ResponsiveLayout from './components/layout/ResponsiveLayout'; 
import DashboardLayout from './components/layout/DashboardLayout';
import Welcome from './components/Welcome.js';
import Courses from './components/pages/Courses';
import CourseDetails from './components/pages/CourseDetails'; 
import Testimonials from './components/pages/Testimonials';
import About from './components/pages/About';
import FAQs from './components/pages/FAQs';
import Contact from './components/pages/Contact';
import Demo from './components/pages/Demo';
import Layout from './components/Layout'; 

import { AuthProvider } from './utils/AuthContext.js';

// Sidebar Components
// import Sidebar from './components/Sidebar'; // Teacher's Sidebar
import StudentSidebar from './components/student/StudentSidebar'; 

// Page/Feature Components (no changes to these imports)
import Exams from './components/exams/exams';
import Assignments from './components/assignments/Assignments';
import Materials from './components/materials/Materials';
import Groups from './components/groups/Groups';
import GroupDetails from './components/groups/GroupDetails';
import AssignmentSubmissions from './components/assignments/AssignmentSubmissions';
import ExamSubmissions from './components/exams/ExamSubmissions';
import Assistants from './components/assistants/Assistants';

import Sessions from './components/sessions/sessions';
import SessionDetails from './components/sessions/sessionDetails';


// Student Pages
import StudentDashboard from './components/student/StudentDashboard';
import StudentAssignments from './components/student/pages/Assignments';
import StudentExams from './components/student/pages/Exams';
import StudentMaterials from './components/student/pages/Materials';
import Profile from './components/student/pages/Profile';
import StudentSessions from './components/student/pages/Sessions'; 

import Redirecting from './utils/Redirecting.js';

// Auth Components
import Login from './components/auth/login';
import SignUp from './components/auth/SignUp';
import AdminLogin from './components/auth/teacherLogin';

// Styles & Config
import './App.css';
import Modal from 'react-modal';
import { API_URL } from './config';

// Header component - ResponsiveLayout will import and use this.
// If ResponsiveLayout handles its own Header import, this one might be redundant
// unless Header is used elsewhere outside of ResponsiveLayout.
// For now, keeping it as ResponsiveLayout might rely on this path.
import Header from './components/header';


Modal.setAppElement('#root');

const GlobalLoadingIndicator = () => (
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#333' }}>
    Loading, please wait...
</div>
);


const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  // The AuthProvider is now handling the initial loading state for the whole app
  if (isLoading) {
      return <GlobalLoadingIndicator />;
  }

  // This component now only defines the routing rules based on the user's status.
  // The redirect logic is handled by the PrivateRoute components.
  return (
      <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Welcome />} />
          <Route path="/courses" element={<Layout><Courses /></Layout>} />
          <Route path="/testimonials" element={<Layout><Testimonials /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/faqs" element={<Layout><FAQs /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/courses/:courseName" element={<Layout><CourseDetails /></Layout>} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/redirecting" element={<Redirecting />} />
          
          {/* Auth Routes */}
          <Route path="/admin/login" element={!user ? <AdminLogin /> : <Navigate to="/dashboard/sessions" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/student/sessions" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/redirecting" />} />

          {/* Private Teacher/Assistant Route */}
          <Route
              path="/dashboard/*"
              element={
                  user && (user.role === 'main_teacher' || user.role === 'assistant') ? 
                  <DashboardLayout><DashboardRoutes /></DashboardLayout> : 
                  <Navigate to="/admin/login" />
              }
          />

          {/* Private Student Route */}
          <Route
              path="/student/*"
              element={
                  user && user.userName ? 
                  <ResponsiveLayout SidebarComponent={StudentSidebar}><StudentRoutes /></ResponsiveLayout> : 
                  <Navigate to="/login" />
              }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

// --- HIGHLIGHT: Add these two new components for cleaner routing ---

const DashboardRoutes = () => (
  <Routes>
      <Route path="sessions" element={<Sessions />} />
      <Route path="sessions/:sessionId" element={<SessionDetails />} />
      <Route path="exams" element={<Exams />} />
      <Route path="exams/grade/:grade/group/:groupId/exam/:examId" element={<ExamSubmissions />} />
      <Route path="assignments" element={<Assignments />} />
      <Route path="assignments/grade/:grade/group/:groupId/assignment/:assignmentId" element={<AssignmentSubmissions />} />
      <Route path="materials" element={<Materials />} />
      <Route path="groups" element={<Groups />} />
      <Route path="groups/:grade/:group" element={<GroupDetails />} />
      <Route path="assistants" element={<Assistants />} />
  </Routes>
);

const StudentRoutes = () => (
  <Routes>
      <Route index element={<StudentSessions />} />
      <Route path="sessions" element={<StudentSessions />} />
      <Route path="assignments" element={<StudentAssignments />} />
      <Route path="exams" element={<StudentExams />} />
      <Route path="materials" element={<StudentMaterials />} />
      <Route path="profile" element={<Profile />} />
  </Routes>
);

const App = () => {
return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes  />
      </AuthProvider>
    </Router>
);
};

export default App;