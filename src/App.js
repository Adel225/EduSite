import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/header';
import Dashboard from './components/Dashboard';
import Exams from './components/exams/exams';
import Assignments from './components/assignments/Assignments';
import Materials from './components/materials/Materials';
import Groups from './components/groups/Groups';
import GroupDetails from './components/groups/GroupDetails';
import AssignmentSubmissions from './components/assignments/AssignmentSubmissions';
import ExamSubmissions from './components/exams/ExamSubmissions';
import StudentSidebar from './components/student/StudentSidebar';
import StudentDashboard from './components/student/StudentDashboard';
import StudentAssignments from './components/student/pages/Assignments';
import StudentExams from './components/student/pages/Exams';
import StudentMaterials from './components/student/pages/Materials';
import Profile from './components/student/pages/Profile'; // This is Student's Profile

import Login from './components/auth/login';
import SignUp from './components/auth/SignUp';
import AdminLogin from './components/auth/teacherLogin';
import './App.css';
import Modal from 'react-modal';
import { API_URL } from './config'; // This path is correct as App.js and config.js are both in src/

Modal.setAppElement('#root');

const GlobalLoadingIndicator = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#333' }}>
    Loading, please wait...
  </div>
);

const AuthInitializerAndMainApp = () => {
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const navigate = useNavigate();
  const location = useLocation(); // Get location here to pass to navigate if needed

  useEffect(() => {
    let isMounted = true;

    const performCheck = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
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
            if (profileData.data.Main === true) { // Teacher
              navigate('/dashboard/', { replace: true });
            } else if (profileData.data.userName) { // Student
              navigate('/student/', { replace: true });
            } else { // Ambiguous role
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              navigate('/login', { state: { error: "The login credentials aren't right." }, replace: true });
            }
          } else { // Unexpected response structure
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            navigate('/login', { state: { error: "Failed to verify login. Please try again." }, replace: true });
          }
        } else { // Token invalid or other API error
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          // Based on your answer 5, if token is invalid, redirect to student login.
          // If you want to show a specific error for invalid token, pass it in state.
          navigate('/login', { replace: true, state: { error: "Session expired or invalid. Please login again." } });
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error during initial auth check:', error);
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          navigate('/login', { state: { error: "A network error occurred. Please try again." }, replace: true });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Only run performCheck if we haven't determined the auth state yet (i.e., isLoading is true)
    // This also implicitly means the check runs once on mount.
    if (isLoading) {
        performCheck();
    }
    
    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // `isLoading` removed from deps to prevent re-triggering on its own change. Effect runs once.

  if (isLoading) {
    return <GlobalLoadingIndicator />;
  }

  const isAuthenticated = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
  };

  const PrivateRoute = ({ children }) => {
    const currentRouteLocation = useLocation(); // Use a different name to avoid conflict with outer scope location
    const auth = isAuthenticated();
    
    if (!auth) {
      // Original logic: Redirect to admin login for any private route if not authenticated.
      // This might need refinement if you want different unauth redirects for student vs teacher areas.
      return <Navigate to="/admin/login" state={{ from: currentRouteLocation }} replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        path="/dashboard/*"
        element={
          <PrivateRoute>
            <>
              <Header />
              <div className="app">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="exams" element={<Exams />} />
                    <Route path="assignments" element={<Assignments />} />
                    <Route path="assignments/grade/:grade/group/:groupId/assignment/:assignmentId" element={<AssignmentSubmissions />} />
                    <Route path="exams/grade/:grade/group/:groupId/exam/:examId" element={<ExamSubmissions />} />
                    <Route path="materials" element={<Materials />} />
                    <Route path="groups" element={<Groups />} />
                    <Route path="groups/:grade/:group" element={<GroupDetails />} />
                  </Routes>
                </div>
              </div>
            </>
          </PrivateRoute>
        }
      />

      <Route
        path="/student/*"
        element={
          <PrivateRoute>
            <>
              <Header />
              <div className="app">
                <StudentSidebar />
                <div className="main-content">
                  <Routes>
                    <Route index element={<StudentDashboard />} />
                    <Route path="assignments" element={<StudentAssignments />} />
                    <Route path="exams" element={<StudentExams />} />
                    <Route path="materials" element={<StudentMaterials />} />
                    <Route path="profile" element={<Profile />} /> {/* Uses the imported student Profile */}
                  </Routes>
                </div>
              </div>
            </>
          </PrivateRoute>
        }
      />
      {/* 
        Catch-all route:
        If the initial auth check is done, and the user is not authenticated (no token),
        and they try to access a path not explicitly handled (like '/'), this will redirect to '/login'.
        If they are authenticated, they should have been redirected to their dashboard by AuthInitializerAndMainApp.
        If they are authenticated and type a completely random URL, this will also redirect to '/login'.
        You might want to change this to a <NotFound /> component or redirect to their dashboard if authenticated.
        For now, it aligns with your original catch-all.
      */}
      <Route path="*" element={<Navigate to="/login" replace />} />
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