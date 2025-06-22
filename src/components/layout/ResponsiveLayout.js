// src/components/layout/ResponsiveLayout.js (create this new file and folder if needed)
import React, { useState, useEffect } from 'react';
import Header from '../header'; 
import './ResponsiveLayout.css'; 

const ResponsiveLayout = ({ SidebarComponent, children }) => {
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Common breakpoint

const toggleSidebar = () => {
    if (isMobile) { // Only toggle if on mobile view
    setIsSidebarOpen(!isSidebarOpen);
    }
};

// Close sidebar if a link is clicked (for mobile)
const handleNavLinkClick = () => {
    if (isMobile && isSidebarOpen) {
    setIsSidebarOpen(false);
    }
};

useEffect(() => {
    const handleResize = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile) { // If resizing to desktop
        setIsSidebarOpen(false); // Ensure sidebar isn't stuck "open" from mobile state
    }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
}, []);

return (
    <div className="layout-wrapper"> {/* This wrapper should not have conflicting overflow */}
      <Header onToggleSidebar={toggleSidebar} isMobile={isMobile} /> {/* Sticky Header */}
      <div className="app"> {/* Flex container for sidebar and content */}
        <SidebarComponent isOpen={isSidebarOpen} onNavLinkClick={handleNavLinkClick} isMobile={isMobile} />
        {isMobile && isSidebarOpen && <div className="overlay" onClick={toggleSidebar}></div>}
        <main className="main-content"> {/* MAIN SCROLLABLE CONTENT AREA */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;