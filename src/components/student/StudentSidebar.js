// src/components/student/StudentSidebar.js
import React from 'react';
// Import your student-specific icons and NavLink, etc.
import StudentDashboardIcon from '../../icons/dashboard.svg'; // Example, use appropriate icons
import StudentAssignmentsIcon from '../../icons/assignment.svg';
import StudentExamsIcon from '../../icons/exams.svg';
import StudentMaterialsIcon from '../../icons/materials.svg';
import StudentProfileIcon from '../../icons/profile.svg'; // Assuming you have a profile icon
import '../../styles/Sidebar.css'; // Or reuse Sidebar.css if styles are similar
import { NavLink } from 'react-router-dom';

const StudentSidebar = ({ isOpen, onNavLinkClick, isMobile }) => {
  const sidebarClasses = `sidebar student-sidebar ${isMobile ? (isOpen ? 'open' : 'closed') : 'desktop-visible'}`;
  // Added 'student-sidebar' class for potential specific styling

  return (
    <div className={sidebarClasses}>
      <div className='menu'>Student Menu</div><br/><br/>
      <div>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/" end onClick={onNavLinkClick}><img src={StudentDashboardIcon} alt="Dashboard" /> Dashboard</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/assignments" onClick={onNavLinkClick}><img src={StudentAssignmentsIcon} alt="Assignments" /> Assignments</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/exams" onClick={onNavLinkClick}><img src={StudentExamsIcon} alt="Exams" /> Exams</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/materials" onClick={onNavLinkClick}><img src={StudentMaterialsIcon} alt="Materials" /> Materials</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/profile" onClick={onNavLinkClick}><img src={StudentProfileIcon} alt="Profile" /> Profile</NavLink><br/><br/>
      </div>
    </div>
  );
};

export default StudentSidebar;