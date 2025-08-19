// src/components/header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext'; 
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
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login'); 
  };

  return (
    <div className="header">
      {isMobile && (
        <button className="hamburger-button" onClick={onToggleSidebar}>
          <HamburgerIcon />
        </button>
      )}
      <Link to="/" className="header-brand-link">
          <h1 className="header-name">MathSphere</h1>
      </Link>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Header;