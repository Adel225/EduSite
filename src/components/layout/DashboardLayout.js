// src/components/layout/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import ResponsiveLayout from './ResponsiveLayout';
import Sidebar from '../Sidebar'; // Main teacher sidebar
import AssistantSidebar from '../assistants/AssistantSidebar';
import { API_URL } from '../../config';

const DashboardLayout = ({ children }) => {
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            try {
                // This is the same API call from App.js, but now its purpose is just to get the role
                const response = await fetch(`${API_URL}/student/profile`, {
                    headers: { 'Authorization': `MonaEdu ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUserRole(data.data.role); // e.g., 'main_teacher' or 'assistant'
                }
            } catch (error) {
                console.error("Could not fetch user role for dashboard layout", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUserRole();
    }, []);

    if (loading) {
        return <div>Loading Dashboard...</div>; // Or a proper loading spinner
    }

    // Conditionally choose the correct sidebar based on the user's role
    const SidebarComponent = userRole === 'assistant' ? AssistantSidebar : Sidebar;

    return (
        <ResponsiveLayout SidebarComponent={SidebarComponent}>
            {children}
        </ResponsiveLayout>
    );
};

export default DashboardLayout;