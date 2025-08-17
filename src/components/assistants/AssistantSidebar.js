// src/components/assistants/AssistantSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext'; 

// Re-use existing icons
import SessionsIcon from '../../icons/session.svg';
import ExamsIcon from '../../icons/exams.svg';
import AssignmentIcon from '../../icons/assignment.svg';
import MaterialsIcon from '../../icons/materials.svg';
import GroupsIcon from '../../icons/groups.svg';
import '../../styles/Sidebar.css';

const AssistantSidebar = ({ isOpen, onNavLinkClick, isMobile }) => {
const { user } = useAuth(); // Get the globally stored user data

const sidebarClasses = `sidebar ${isMobile ? (isOpen ? 'open' : 'closed') : 'desktop-visible'}`;

// Helper to check if a permission category exists and is not empty
const hasPermission = (category) => {
    return user?.permissions?.[category] && user.permissions[category].length > 0;
};

return (
    <div className={sidebarClasses}>
    <div className='menu'>Assistant Menu</div><br/><br/>
    <div>
        {/* --- HIGHLIGHT: Each NavLink is now wrapped in a conditional check --- */}

        {hasPermission('sections') && (
            <><NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/sessions" onClick={onNavLinkClick}><img src={SessionsIcon} alt="Sessions" /> Sessions</NavLink><br/><br/></>
        )}
        
        {hasPermission('exams') && (
            <><NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/exams" onClick={onNavLinkClick}><img src={ExamsIcon} alt="Exams" /> Exams</NavLink><br/><br/></>
        )}
        
        {hasPermission('assignments') && (
            <><NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/assignments" onClick={onNavLinkClick}><img src={AssignmentIcon} alt="Assignments" /> Assignments</NavLink><br/><br/></>
        )}
        
        {hasPermission('materials') && (
            <><NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/materials" onClick={onNavLinkClick}><img src={MaterialsIcon} alt="Materials" /> Materials</NavLink><br/><br/></>
        )}
        
        {hasPermission('groups') && (
            <><NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/groups" onClick={onNavLinkClick}><img src={GroupsIcon} alt="Groups" /> Groups</NavLink><br/><br/></>
        )}
        
    </div>
    </div>
);
};

export default AssistantSidebar;