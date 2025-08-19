// src/components/layout/DashboardLayout.js
import React from 'react';
import { useAuth } from '../../utils/AuthContext'; 
import ResponsiveLayout from './ResponsiveLayout';
import Sidebar from '../Sidebar'; 
import AssistantSidebar from '../assistants/AssistantSidebar'; 

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

    const SidebarComponent = user?.role === 'assistant' ? AssistantSidebar : Sidebar;

    return (
        <ResponsiveLayout SidebarComponent={SidebarComponent}>
            {children}
        </ResponsiveLayout>
    );
};

export default DashboardLayout;