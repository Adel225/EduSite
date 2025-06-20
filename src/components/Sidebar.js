import React from 'react';
import Dashboard from '../icons/dashboard.svg';
import Exams from '../icons/exams.svg';
import assignment from '../icons/assignment.svg';
import Materials from '../icons/materials.svg';
import Groups from '../icons/groups.svg';
import '../styles/Sidebar.css';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  
  return (
    <div className="sidebar">
      <div className='menu'>Menu</div><br/><br/> 
      <div>
        
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard" end><img src={Dashboard} alt="Dashboard" /> Dashboard</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/exams"><img src={Exams} alt="Exams" /> Exams</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/assignments"><img src={assignment} alt="Assignments" /> Assignments</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/materials"><img src={Materials} alt="Materials" /> Materials</NavLink><br/><br/>
        <NavLink className={({ isActive }) => (isActive ? 'active-link' : 'li')} to="/dashboard/groups"><img src={Groups} alt="Groups" /> Groups</NavLink><br/><br/>
      </div>
    </div>
  );
};

export default Sidebar;