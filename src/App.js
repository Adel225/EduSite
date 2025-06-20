// App.js
import React, { useEffect } from 'react'; // Added useEffect for AppContent
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
import TeacherProfile from './components/teacher/Profile'; // Assuming you meant TeacherProfile here
import Login from './components/auth/login';
import SignUp from './components/auth/SignUp';
import AdminLogin from './components/auth/teacherLogin';
import './App.css';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const isAuthenticated = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    // FUTURE: Add logic here to differentiate student vs admin tokens if stored under same key
    // For now, any token means "somebody" is authenticated.
    return !!token;
};

const PrivateRoute = ({ children, isForAdmin = false }) => { // Added isForAdmin
    const location = useLocation();
    const auth = isAuthenticated();

    if (!auth) {
        // If trying to access a route that requires auth, redirect to the appropriate login
        const redirectTo = isForAdmin ? "/admin/login" : "/login";
        console.log(`PrivateRoute: Not authenticated. Redirecting from ${location.pathname} to ${redirectTo}`);
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }
    return children;
};

// New component to contain the main logic and routes, so it can use router hooks
const AppContent = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Effect for initial session check on app load
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const currentHash = location.hash; // e.g., '#/', '#/login', '#/student/dashboard'

        console.log("AppContent useEffect: Initial session check. Token:", token ? "Yes" : "No", "Hash:", currentHash);

        if (token) {
            if (currentHash === '#/login' || currentHash === '' || currentHash === '#/') {
                console.log("AppContent useEffect: Token found, navigating to /student/ from", currentHash);
                navigate('/student/'); // This becomes /#/student/
            } 
            else if (currentHash === '#/admin/login') {
              navigate('/dashboard/');
            }
        } else {
            // No token.
            // If user is at the root path ('/' or '#/') and not authenticated, redirect to student login.
            if (currentHash === '' || currentHash === '#/') {
                console.log("AppContent useEffect: No token, on root, navigating to /login.");
                navigate('/login'); // This becomes /#/login
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on AppContent mount. navigate/location are stable from Router context.


    return (
        <Routes>
            {/* Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Admin/Teacher Dashboard Routes */}
            <Route
                path="/dashboard/*"
                element={
                    <PrivateRoute isForAdmin={true}>
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
                                    <Route path="profile" element={<TeacherProfile />} /> {/* Admin's profile */}
                                    <Route path="*" element={<Navigate to="/dashboard/" replace />} /> {/* Fallback within admin section */}
                                </Routes>
                            </div>
                        </div>
                    </PrivateRoute>
                }
            />

            {/* Student Routes */}
            <Route
                path="/student/*"
                element={
                    <PrivateRoute isForAdmin={false}> {/* Or just <PrivateRoute> if default is student */}
                        <Header />
                        <div className="app">
                            <StudentSidebar />
                            <div className="main-content">
                                <Routes>
                                    <Route index element={<StudentDashboard />} />
                                    <Route path="assignments" element={<StudentAssignments />} />
                                    <Route path="exams" element={<StudentExams />} />
                                    <Route path="materials" element={<StudentMaterials />} />
                                    <Route path="profile" element={<Profile />} /> {/* Student's profile */}
                                    <Route path="*" element={<Navigate to="/student/" replace />} /> {/* Fallback within student section */}
                                </Routes>
                            </div>
                        </div>
                    </PrivateRoute>
                }
            />
            
            {/* Default route for the entire app - if no other top-level route matches */}
            <Route path="/" element={isAuthenticated() ? <Navigate to="/student/" replace /> : <Navigate to="/login" replace />} />
            
            {/* Catch-all for any truly unknown paths, redirect to the main default logic */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => {
    // isAuthenticated can be defined here or passed down if AppContent needs it directly,
    // but PrivateRoute uses it effectively.
    return (
        <Router>
            <AppContent /> {/* Render AppContent which contains all routes and uses router hooks */}
        </Router>
    );
};

export default App;