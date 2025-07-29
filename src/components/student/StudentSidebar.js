// src/components/student/StudentSidebar.js
import React from 'react';
import StudentDashboardIcon from '../../icons/dashboard.svg'; 
import StudentAssignmentsIcon from '../../icons/assignment.svg';
import StudentExamsIcon from '../../icons/exams.svg';
import StudentMaterialsIcon from '../../icons/session.svg';
import StudentSessionsIcon from '../../icons/materials.svg';
import StudentProfileIcon from '../../icons/profile.svg';
import { NavLink } from 'react-router-dom';

const StudentSidebar = ({ isOpen, onNavLinkClick, isMobile }) => {
  const sidebarClasses = `sidebar student-sidebar ${isMobile ? (isOpen ? 'open' : 'closed') : 'desktop-visible'}`;
  // Added 'student-sidebar' class for potential specific styling

  return (
    <div className={sidebarClasses}>
      <div className='menu'>Student Menu</div><br/><br/>
      <div>
        {/* <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/" end onClick={onNavLinkClick}><img src={StudentDashboardIcon} alt="Dashboard" /> Dashboard</NavLink><br/><br/> */}
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/sessions" onClick={onNavLinkClick}><img src={StudentSessionsIcon} alt="Sessions" /> Sessions</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/assignments" onClick={onNavLinkClick}><img src={StudentAssignmentsIcon} alt="Assignments" /> Assignments</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/exams" onClick={onNavLinkClick}><img src={StudentExamsIcon} alt="Exams" /> Exams</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/materials" onClick={onNavLinkClick}><img src={StudentMaterialsIcon} alt="Materials" /> Materials</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/profile" onClick={onNavLinkClick}><img src={StudentProfileIcon} alt="Profile" /> Profile</NavLink><br/><br/>
      </div>
    </div>
  );
};

export default StudentSidebar;