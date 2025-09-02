
// src/components/Sidebar.js
import React from 'react';
import ExamsIcon from '../icons/exams.svg';
import AssignmentIcon from '../icons/assignment.svg';
import MaterialsIcon from '../icons/materials.svg';
import GroupsIcon from '../icons/groups.svg';
import Box from '../icons/boxBlack.svg';
import Course from '../icons/lesson.svg';
import SessionIcon from '../icons/session.svg'
import AssistantIcon from '../icons/user.svg';
import CoursesIcon from '../icons/bell.svg';
import '../styles/Sidebar.css'; // Ensure this CSS is adapted
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onNavLinkClick, isMobile }) => {
  // Determine classes based on props
  // 'sidebar' is the base class for its own specific styles
  // 'open' class is added when it should be visible on mobile
  // 'desktop-visible' class is added when on desktop (can be used to override mobile-first hidden states)
  const sidebarClasses = `sidebar ${isMobile ? (isOpen ? 'open' : 'closed') : 'desktop-visible'}`;

  return (
    <div className={sidebarClasses}> {/* Apply dynamic classes */}
      <div className='menu'>Menu</div><br/><br/>
      <div>
        {/* <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/sessions" onClick={onNavLinkClick}><img src={SessionIcon} alt="Sessions" /> Sessions</NavLink><br/><br/> */}
        {/* <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/exams" onClick={onNavLinkClick}><img src={ExamsIcon} alt="Exams" /> Exams</NavLink><br/><br/> */}
        {/* <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/assignments" onClick={onNavLinkClick}><img src={AssignmentIcon} alt="Assignments" /> Assignments</NavLink><br/><br/> */}
        {/* <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/materials" onClick={onNavLinkClick}><img src={MaterialsIcon} alt="Materials" /> Materials</NavLink><br/><br/> */}
        {/* <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/groups" onClick={onNavLinkClick}><img src={GroupsIcon} alt="Groups" /> Groups</NavLink><br/><br/> */}

        
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/courses" onClick={onNavLinkClick}>
            <img src={Course} alt="Courses" /> Courses
        </NavLink><br/><br/>


        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/assistants" onClick={onNavLinkClick}><img src={AssistantIcon} alt="Assistants" /> Assistants</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/courses-requests-managment" onClick={onNavLinkClick}><img src={CoursesIcon} alt="courses requests" /> Courses requests</NavLink><br/><br/>


        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/archived-courses" onClick={onNavLinkClick}>
            <img src={Box} alt="Archived Courses" /> Archived Courses
        </NavLink><br/><br/>


      </div>
    </div>
  );
};

export default Sidebar;
