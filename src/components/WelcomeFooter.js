// src/components/WelcomeFooter.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/welcome.css'; // Share the same CSS

const WelcomeFooter = () => {
    return (
        <footer className="welcome-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-col"><h4>Quick Links</h4><ul><li><Link to="/about">About us</Link></li><li><Link to="/courses">Courses</Link></li><li><Link to="/testimonials">Testimonials</Link></li><li><Link to="/contact">Contact Us</Link></li></ul></div>
                        <div className="footer-col"><h4>Our Courses</h4>
                            <ul>
                                <li><Link to="#">Course A</Link></li>
                                <li><Link to="#">Course B</Link></li>
                                <li><Link to="#">Course A</Link></li>
                                <li><Link to="#">Course B</Link></li>
                                <li><Link to="#">Course A</Link></li>
                                <li><Link to="#">Course B</Link></li>
                            </ul>
                        </div>
                        <div className="footer-col"><h4>Stay Connected</h4><ul><li><a href="https://www.facebook.com/profile.php?id=61550633945227">Facebook</a></li><li><a href="#">Instagram</a></li></ul></div>
                        <div className="footer-col"><h4>Contact Us</h4> <a href="https://wa.me/971508162674" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/?size=100&id=Funux8t3F8Ig&format=png&color=FFFFFF" width="20" height="20" /> +971 50 816 2674</a> </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 Mona Abouelazm. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
    );
};

export default WelcomeFooter;