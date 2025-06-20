import React from 'react';
import Dashboard from '../../icons/dashboard.svg';
import Exams from '../../icons/exams.svg';
import assignment from '../../icons/assignment.svg';
import Materials from '../../icons/materials.svg';
import Profile from '../../icons/profile.svg';
import { NavLink } from 'react-router-dom';
import '../../styles/Sidebar.css';

const StudentSidebar = () => {
  return (
    <div className="sidebar">
      <div className='menu'>Menu</div><br/><br/>
      <div>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student" end>
          <img src={Dashboard} alt=" Dashboard" /> Dashboard
        </NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/exams">
          <img src={Exams} alt=" Exams" /> Exams
        </NavLink><br/><br/>                                                              
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/assignments">
          <img src={assignment} alt=" Assignments" />Assignments
        </NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/materials">
          <img src={Materials} alt=" Materials" />Materials
        </NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/student/profile">
          <img src={Profile} alt=" Profile" />Profile
        </NavLink><br/><br/>
      </div>
    </div>
  );
};

export default StudentSidebar;