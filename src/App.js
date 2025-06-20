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
const location = useLocation();

useEffect(() => {
    // ...
    const performCheck = async () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('AuthCheck: Token:', token); // Check if token exists

        if (!token) {
            if (isMounted) setIsLoading(false);
            console.log('AuthCheck: No token found, setting isLoading false.');
            return;
        }

        try {
            console.log('AuthCheck: Fetching /student/profile');
            const response = await fetch(`${API_URL}/student/profile`, { /* ... */ });
            console.log('AuthCheck: API Response Status:', response.status);
            console.log('AuthCheck: API Response OK?:', response.ok);

            if (!isMounted) return;

            if (response.ok) {
                const profileData = await response.json();
                console.log('AuthCheck: API Profile Data:', JSON.stringify(profileData, null, 2)); // Log the WHOLE structure

                if (profileData.data) {
                    console.log('AuthCheck: profileData.data.Main:', profileData.data.Main);
                    console.log('AuthCheck: profileData.data.confirmEmail:', profileData.data.confirmEmail);

                    if (profileData.data.Main !== undefined && profileData.data.Main) {
                        console.log('AuthCheck: Navigating to /dashboard/ (Teacher)');
                        navigate('/dashboard/', { replace: true });
                    } 
                    else if (profileData.data.confirmEmail) {
                        console.log('AuthCheck: Navigating to /student/ (Student)');
                        navigate('/student/', { replace: true });
                    } 
                    else {
                        console.log('AuthCheck: Ambiguous role, navigating to /login');
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                        navigate('/login', { state: { error: "The login credentials aren't right." }, replace: true });
                    }
                } else {
                    console.log('AuthCheck: Unexpected response structure (no profileData.data), navigating to /login');
                    navigate('/login');
                }
            } else {
                console.log('AuthCheck: Token invalid or API error, navigating to /login');
                const errorBody = await response.text(); // See if there's an error message from API
                console.log('AuthCheck: API Error Body:', errorBody);
                navigate('/login');
            }
        } catch (error) {
            if (isMounted) {
                console.error('AuthCheck: Error during initial auth check:', error);
                navigate('/login');
            }
        } finally {
            if (isMounted) {
                console.log('AuthCheck: Setting isLoading to false.');
                setIsLoading(false);
            }
        }
    };

    if (isLoading) { // This condition is good
        console.log('AuthCheck: isLoading is true, performing check.');
        performCheck();
    } else {
        console.log('AuthCheck: isLoading is false, not performing check on this render.');
    }

    // ...
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [navigate]); // Keeping `isLoading` out of deps is correct here to run once.


if (isLoading) {
    return <GlobalLoadingIndicator />;
}

const isAuthenticated = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
};
const PrivateRoute = ({ children, redirectTo }) => { // Added redirectTo prop
  const currentRouteLocation = useLocation();
  const auth = isAuthenticated();
  
  if (!auth) {
    return <Navigate to={redirectTo} state={{ from: currentRouteLocation }} replace />; // Uses redirectTo
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
            <PrivateRoute redirectTo="/login"> 

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
            <PrivateRoute redirectTo="/login">

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