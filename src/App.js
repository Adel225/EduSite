import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

// Layout Component
import ResponsiveLayout from './components/layout/ResponsiveLayout'; 
import Welcome from './components/Welcome.js';

// Sidebar Components
import Sidebar from './components/Sidebar'; // Teacher's Sidebar
import StudentSidebar from './components/student/StudentSidebar'; 

// Page/Feature Components (no changes to these imports)
import Exams from './components/exams/exams';
import Assignments from './components/assignments/Assignments';
import Materials from './components/materials/Materials';
import Groups from './components/groups/Groups';
import GroupDetails from './components/groups/GroupDetails';
import AssignmentSubmissions from './components/assignments/AssignmentSubmissions';
import ExamSubmissions from './components/exams/ExamSubmissions';

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

const AuthInitializerAndMainApp = () => {
const [isLoading, setIsLoading] = useState(true);
const navigate = useNavigate();
const location = useLocation();


useEffect(() => {
    let isMounted = true;
    const performCheck = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const currentPath = location.pathname;

      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/student/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `MonaEdu ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!isMounted) return;

        if (response.ok) {
          const profileData = await response.json();
          if (profileData.data) {
            const isTeacher = profileData.data.role === "main_teacher";
            const isAssistant = profileData.data.role === "assistant";
            const isStudent = !!profileData.data.userName;

            if (isTeacher) {
              if (['/login', '/admin/login', '/signup'].includes(currentPath)) {
                navigate('/dashboard/', { replace: true });
              }
            } else if (isStudent) {
              if (['/login', '/admin/login', '/signup', '/redirecting'].includes(currentPath)) {
                navigate('/student/', { replace: true });
              }
            } else { 
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              if (!['/login', '/admin/login', '/signup'].includes(currentPath)) {
                navigate('/login', { state: { error: "The login credentials aren't right." }, replace: true });
              }
            }
          } else { 
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            if (!['/login', '/admin/login', '/signup'].includes(currentPath)) {
              navigate('/login', { state: { error: "Failed to verify login. Please try again." }, replace: true });
            }
          }
        } else { 
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          if (!['/login', '/admin/login', '/signup'].includes(currentPath)) {
              navigate('/login', { replace: true, state: { error: "Session expired or invalid. Please login again." } });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error during initial auth check:', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          if (!['/login', '/admin/login', '/signup'].includes(currentPath)) {
            navigate('/login', { state: { error: "A network error occurred. Please try again." }, replace: true });
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    performCheck();
    
    return () => {
      isMounted = false;
    };
  }, [navigate, location.pathname]); 

if (isLoading) {
    return <GlobalLoadingIndicator />;
}

const isAuthenticated = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
};

const PrivateRoute = ({ children }) => {
    const currentRouteLocation = useLocation(); 
    const auth = isAuthenticated();
    
    if (!auth) {
    return <Navigate to="/login" state={{ from: currentRouteLocation }} replace />;
    }
    return children;
};

return (
    <Routes>
    <Route path="/" element={<Welcome />} />
    <Route path="/redirecting" element={<Redirecting />} />
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />

    {/* TEACHER DASHBOARD ROUTES - USING RESPONSIVE LAYOUT */}
    <Route
        path="/dashboard/*"
        element={
        <PrivateRoute>
            {/* ++ WRAPPED WITH RESPONSIVE LAYOUT, PASSING TEACHER'S SIDEBAR */}
            <ResponsiveLayout SidebarComponent={Sidebar}>
                {/* Original structure of .app, .main-content, and nested Routes is now children */}
                {/* <Header /> is removed from here; ResponsiveLayout handles it. */}
                {/* <div className="app"> -- This class might be handled by ResponsiveLayout or its CSS now */}
                    {/* <Sidebar /> is removed; ResponsiveLayout handles it via SidebarComponent prop */}
                    {/* <div className="main-content"> -- This class might be handled by ResponsiveLayout or its CSS now */}
                        <Routes>
                            <Route path="exams" element={<Exams />} />
                            <Route path="assignments" element={<Assignments />} />
                            <Route path="assignments/grade/:grade/group/:groupId/assignment/:assignmentId" element={<AssignmentSubmissions />} />
                            <Route path="exams/grade/:grade/group/:groupId/exam/:examId" element={<ExamSubmissions />} />
                            
                            <Route path="sessions" element={<Sessions />} />
                            <Route path="sessions/:sessionId" element={<SessionDetails />} />
                            <Route path="materials" element={<Materials />} />
                            <Route path="groups" element={<Groups />} />
                            <Route path="groups/:grade/:group" element={<GroupDetails />} />
                        </Routes>
                    {/* </div> */}
                {/* </div> */}
            </ResponsiveLayout>
        </PrivateRoute>
        }
    />

    {/* STUDENT DASHBOARD ROUTES - USING RESPONSIVE LAYOUT */}
    <Route
        path="/student/*"
        element={
        <PrivateRoute>
            <ResponsiveLayout SidebarComponent={StudentSidebar}>
                        <Routes>
                            <Route index element={<StudentSessions />} />
                            <Route path="assignments" element={<StudentAssignments />} />
                            <Route path="sessions" element={<StudentSessions />} />
                            <Route path="exams" element={<StudentExams />} />
                            <Route path="materials" element={<StudentMaterials />} />
                            <Route path="profile" element={<Profile />} />
                        </Routes>
            </ResponsiveLayout>
        </PrivateRoute>
        } 
    />
    <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);
};

const App = () => {
return (
    <Router>
    <AuthInitializerAndMainApp />
    </Router>
);
};

export default App;