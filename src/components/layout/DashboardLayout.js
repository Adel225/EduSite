// src/components/layout/DashboardLayout.js
import React from 'react';
import { useAuth } from '../../utils/AuthContext'; 
import ResponsiveLayout from './ResponsiveLayout';
import Sidebar from '../Sidebar'; // The main teacher's sidebar
import AssistantSidebar from '../assistants/AssistantSidebar'; // Our new dynamic assistant sidebar

const DashboardLayout = ({ children }) => {
    const { user, isLoading } = useAuth(); // Get user info and loading status instantly

    // Display a loading indicator while the initial user check is happening
    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                Loading User...
            </div>
        );
    }

    // --- HIGHLIGHT: The Core Logic ---
    // Conditionally choose the correct sidebar component based on the user's role.
    // Default to the main teacher's Sidebar if the role isn't 'assistant'.
    const SidebarComponent = user?.role === 'assistant' ? AssistantSidebar : Sidebar;

    return (
        <ResponsiveLayout SidebarComponent={SidebarComponent}>
            {children}
        </ResponsiveLayout>
    );
};

export default DashboardLayout;