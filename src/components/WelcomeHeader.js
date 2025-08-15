// src/components/WelcomeHeader.js
import React, { useState } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import '../styles/welcome.css'; // We'll share the same CSS


const WelcomeHeader = () => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useNavigate();

    const closeNav = () => setIsNavOpen(false);

    const handleLoginClick = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) navigate('/redirecting');
        else navigate('/login');
    };

    return (
        <>
            <div className="top-bar">
                <div className="top-bar-content">
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/?size=100&id=118467&format=png&color=FFFFFF" width="24" height="24" /> Facebook</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/?size=100&id=59813&format=png&color=FFFFFF" width="24" height="24" /> Instagram</a>
                    </div>
                    <div className="contact-info">
                        <a href="https://wa.me/971508162674" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/?size=100&id=Funux8t3F8Ig&format=png&color=FFFFFF" width="24" height="24" />+971 50 816 2674</a>
                    </div>
                </div>
            </div>

            <header className="welcome-header">
                {/* <div className="container"> */}
                    <nav className="welcome-nav">
                        <Link to="/" className="nav-brand">MathSphere</Link>
                        <div className="nav-links desktop-only">
                            <NavLink to="/">Home</NavLink>
                            <NavLink to="/courses">Courses</NavLink>
                            <NavLink to="/testimonials">Student Testimonials</NavLink>
                            <NavLink to="/about">About Us</NavLink>
                            <NavLink to="/faqs">FAQs</NavLink>
                            <NavLink to="/contact">Contact Us</NavLink>
                            <button onClick={handleLoginClick} className="nav-button login">Login</button>
                            <Link to="/signup" className="nav-button signup">Sign Up</Link>
                            </div>
                            <div className="hamburger mobile-only" onClick={() => setIsNavOpen(true)}>
                                ☰
                        </div>
                    </nav>
                {/* </div> */}
            </header>

            {/* Sidebar Menu */}
            <div className={`mobile-sidebar ${isNavOpen ? 'open' : ''}`} onClick={closeNav}>
                <div className="sidebar-content" onClick={(e) => e.stopPropagation()}>
                    <div className="close-btn" onClick={closeNav}>×</div>
                    <NavLink to="/" onClick={closeNav}>Home</NavLink>
                    <NavLink to="/courses" onClick={closeNav}>Courses</NavLink>
                    <NavLink to="/testimonials" onClick={closeNav}>Student Testimonials</NavLink>
                    <NavLink to="/about" onClick={closeNav}>About Us</NavLink>
                    <NavLink to="/faqs" onClick={closeNav}>FAQs</NavLink>
                    <NavLink to="/contact" onClick={closeNav}>Contact Us</NavLink>
                    <button onClick={() => { handleLoginClick(); closeNav(); }} className="nav-button login">Login</button>
                    <Link to="/signup" onClick={closeNav} className="nav-button signup">Sign Up</Link>
                </div>
            </div>
        </>
    );
};

export default WelcomeHeader;