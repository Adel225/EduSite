import React from 'react';
import { HashRouter  as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import Profile from './components/student/pages/Profile';
import TeacherProfile from './components/teacher/Profile';
import Login from './components/auth/login';
import SignUp from './components/auth/SignUp';
import AdminLogin from './components/auth/teacherLogin';
import './App.css';
import Modal from 'react-modal';
Modal.setAppElement('#root');

const App = () => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
  };

  const PrivateRoute = ({ children }) => {
    const location = useLocation();
    const auth = isAuthenticated();
    
    console.log('PrivateRoute - Current path:', location.pathname);
    console.log('PrivateRoute - Is authenticated:', auth);
    
    if (!auth) {
      console.log('PrivateRoute - Redirecting to login');
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    console.log('PrivateRoute - Rendering protected content');
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            <>
              <Header />
              <div className="app">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="exams" element={<PrivateRoute><Exams /></PrivateRoute>} />
                    <Route path="assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
                    <Route path="assignments/grade/:grade/group/:groupId/assignment/:assignmentId" element={<PrivateRoute><AssignmentSubmissions /></PrivateRoute>} />
                    <Route path="exams/grade/:grade/group/:groupId/exam/:examId" element={<PrivateRoute><ExamSubmissions /></PrivateRoute>} />
                    <Route path="materials" element={<PrivateRoute><Materials /></PrivateRoute>} />
                    <Route path="groups" element={<PrivateRoute><Groups /></PrivateRoute>} />
                    <Route path="groups/:grade/:group" element={<PrivateRoute><GroupDetails /></PrivateRoute>} />
                    <Route path="profile" element={<PrivateRoute><TeacherProfile /></PrivateRoute>} />
                  </Routes>
                </div>
              </div>
            </>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <>
              <Header />
              <div className="app">
                <StudentSidebar />
                <div className="main-content">
                  <Routes>
                    <Route index element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
                    <Route path="assignments" element={<PrivateRoute><StudentAssignments /></PrivateRoute>} />
                    <Route path="exams" element={<PrivateRoute><StudentExams /></PrivateRoute>} />
                    <Route path="materials" element={<PrivateRoute><StudentMaterials /></PrivateRoute>} />
                    <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  </Routes>
                </div>
              </div>
            </>
          }
        />

        {/* Catch all route - redirect to login if no specific route matches and not authenticated */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;