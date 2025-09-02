// src/components/assistants/AssistantSidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext'; 

// Re-use existing icons
import SessionsIcon from '../../icons/session.svg';
import '../../styles/Sidebar.css';

const AssistantSidebar = ({ isOpen, onNavLinkClick, isMobile }) => {
// const { user } = useAuth(); 

const sidebarClasses = `sidebar ${isMobile ? (isOpen ? 'open' : 'closed') : 'desktop-visible'}`;


// const hasPermission = (category) => {
//     return user?.permissions?.[category] && user.permissions[category].length > 0;
// };

return (
    <div className={sidebarClasses}>
    <div className='menu'>Assistant Menu</div><br/><br/>
        <div>
            <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/courses" onClick={onNavLinkClick}>
                <img src={SessionsIcon} alt="Courses" /> Courses
            </NavLink><br/><br/>
        </div>
    </div>
);
};

export default AssistantSidebar;