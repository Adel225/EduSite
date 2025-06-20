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
import Profile from './components/student/pages/Profile';
import Login from './components/auth/login';
import SignUp from './components/auth/SignUp';
import AdminLogin from './components/auth/teacherLogin';
import './App.css';
import Modal from 'react-modal';
import { API_URL } from './config'; // Assuming config.js is in ./src/config.js or ./config.js relative to App.js

Modal.setAppElement('#root');

const GlobalLoadingIndicator = () => (
<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: '#333' }}>
    Loading, please wait...
</div>
);

// This new component will handle the initial auth check and render the main app routes
const AuthInitializerAndMainApp = () => {
const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);
const [isLoading, setIsLoading] = useState(true);
const navigate = useNavigate();
// location can be used if needed to avoid re-running on every navigation, but effect deps manage it here.

useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted component

    const performCheck = async () => {
    // No need to set isLoading(true) here, it's true by default for the component
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
        if (isMounted) {
        setInitialAuthCheckDone(true);
        setIsLoading(false);
        }
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

        if (!isMounted) return; // Component unmounted during fetch

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
        } else { // Token invalid or other API error (e.g., 401, 403)
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        navigate('/login', { replace: true }); // Default to student login on auth failure
        }
    } catch (error) {
        if (isMounted) {
        console.error('Error during initial auth check:', error);
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        // Navigate to login with a generic network error
        navigate('/login', { state: { error: "An network error occurred. Please try again." }, replace: true });
        }
    } finally {
        if (isMounted) {
        setInitialAuthCheckDone(true);
        setIsLoading(false);
        }
    }
    };

    if (!initialAuthCheckDone) { // Ensures the check runs only once initially
        performCheck();
    } else {
        setIsLoading(false); // If check was already done (e.g. HMR), ensure loading is false
    }
    
    return () => {
    isMounted = false; // Cleanup
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [navigate]); // `navigate` is stable. `initialAuthCheckDone` in condition prevents re-runs.

if (isLoading) {
    return <GlobalLoadingIndicator />;
}

// This isAuthenticated function is used by PrivateRoute
const isAuthenticated = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return !!token;
};

const PrivateRoute = ({ children }) => {
    const location = useLocation(); // Location for the PrivateRoute instance
    const auth = isAuthenticated();
    
    // console.log('PrivateRoute - Current path:', location.pathname);
    // console.log('PrivateRoute - Is authenticated:', auth);
    
    if (!auth) {
    // console.log('PrivateRoute - Redirecting to login (original logic: /admin/login)');
    // This is the original redirect logic from your PrivateRoute.
    // For a more robust solution, this could redirect to /login or /admin/login based on `location.pathname`.
    return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // console.log('PrivateRoute - Rendering protected content');
    return children;
};

return (
    <Routes>
    {/* Auth Routes */}
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />

    {/* Dashboard Routes - Wrapped in PrivateRoute */}
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

    {/* Student Routes - Wrapped in PrivateRoute */}
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
                    <Route path="profile" element={<Profile />} />
                </Routes>
                </div>
            </div>
            </>
        </PrivateRoute>
        }
    />

    {/* Catch all route - redirect to login if no specific route matches */}
    {/* This will be hit if initialAuthCheckDone is true, user is not authenticated, 
        and they land on a non-defined path or root before PrivateRoute catches them.
        Or if they are authenticated but land on a completely undefined path not covered by student/* or dashboard/* */}
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