// src/components/header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css'; // Ensure this CSS is adapted

// Simple Hamburger SVG Icon (or use an icon library)
const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M4 12H20M4 18H20" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Accept onToggleSidebar and isMobile as props
const Header = ({ onToggleSidebar, isMobile }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="header">
      {isMobile && (
        <button className="hamburger-button" onClick={onToggleSidebar}>
          <HamburgerIcon />
        </button>
      )}
      <h1 className="header-name">Mona AboElazm</h1> 
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Header;