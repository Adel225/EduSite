// src/components/Welcome.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/welcome.css';
import { API_URL } from '../config';

// Placeholder icons - using SVG paths directly for simplicity
const CheckmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;


const Welcome = () => {
    const navigate = useNavigate();

    const [feedback, setFeedback] = useState({
        name: '',
        email: '',
        phone: '',
        grade: '',
        message: '',
    });
    const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });

    const handleFeedbackChange = (e) => {
        const { name, value } = e.target;
        setFeedback(prev => ({ ...prev, [name]: value }));
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ message: 'Sending...', type: 'loading' });
        
        try {
            // Replace with your actual API endpoint for feedback
            const response = await fetch(`${API_URL}/feedback/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedback),
            });

            if (!response.ok) {
                throw new Error('Something went wrong. Please try again.');
            }
            
            setSubmitStatus({ message: 'Thank you for your feedback!', type: 'success' });
            setFeedback({ name: '', email: '', phone: '', grade: '', message: '' }); 

        } catch (error) {
            setSubmitStatus({ message: error.message, type: 'error' });
        }
    };

    const handleLoginClick = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            // If a token exists, go to the loading page.
            // The AuthInitializer will then take over and redirect from there.
            navigate('/redirecting');
        } else {
            // If no token, go to the actual login page.
            navigate('/login');
        }
    };

    return (
        <div className="welcome-page">
            <header className="welcome-header">
                <div className="container">
                    <nav className="welcome-nav">
                        <div className="nav-brand">Mona AboElazm</div>
                        <div className="nav-links">
                        <button onClick={handleLoginClick} className="nav-button login">Login</button>
                            <Link to="/signup" className="nav-button signup">Sign Up</Link>
                        </div>
                    </nav>
                </div>
            </header>

            <main>
                <section className="hero-section">
                    <div className="container">
                        <h1 className="hero-title">Unlock Your Full Potential in Mathematics</h1>
                        <p className="hero-subtitle">Personalized resources and dedicated support for students in grades 9-12.</p>
                        <a href="#contact" className="hero-button">Get Started</a>
                    </div>
                </section>

                <section id="about" className="welcome-section">
                    <div className="container about-container">
                        <div className="about-image">
                            {/* Placeholder for a photo */}
                        </div>
                        <div className="about-text">
                            <h2 className="section-title">About the Teacher</h2>
                            <p>
                                [Placeholder] With a passion for mathematics and years of teaching experience, Mona AboElazm is dedicated to helping students not just learn, but excel. Believing in a personalized approach, the focus is on building a strong conceptual foundation and fostering confidence in every student.
                            </p>
                        </div>
                    </div>
                </section>

                <section id="features" className="welcome-section features-section">
                    <div className="container">
                        <h2 className="section-title text-center">What We Offer</h2>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon"><BookIcon /></div>
                                <h3>Comprehensive Materials</h3>
                                <p>Access a rich library of curated notes, practice problems, and session materials, all in one place.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon"><CheckmarkIcon /></div>
                                <h3>Personalized Feedback</h3>
                                <p>Receive detailed, one-on-one feedback on assignments and exams to pinpoint areas for improvement.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon"><ChartIcon /></div>
                                <h3>Tracked Progress</h3>
                                <p>Monitor your performance and growth over time with a clear view of your scores and submissions.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="contact" className="welcome-section contact-section">
                    <div className="container">
                        <h2 className="section-title text-center">Send Your Feedback</h2>
                        <p className="section-subtitle">Have a question or a suggestion? I'd love to hear from you.</p>
                        <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                            <div className="form-grid">
                                <input type="text" name="name" placeholder="Your Name" value={feedback.name} onChange={handleFeedbackChange} required />
                                <input type="email" name="email" placeholder="Your Email" value={feedback.email} onChange={handleFeedbackChange} required />
                                <input type="tel" name="phone" placeholder="Phone Number" value={feedback.phone} onChange={handleFeedbackChange} />
                                <select name="grade" value={feedback.grade} onChange={handleFeedbackChange} required>
                                    <option value="">Select Grade Level</option>
                                    <option value="9">Grade 9</option>
                                    <option value="10">Grade 10</option>
                                    <option value="11">Grade 11</option>
                                    <option value="12">Grade 12</option>
                                </select>
                            </div>
                            <textarea name="message" placeholder="Your Message" value={feedback.message} onChange={handleFeedbackChange} required></textarea>
                            <button type="submit" className="submit-button">Send Message</button>
                            {submitStatus.message && (
                                <p className={`submit-message ${submitStatus.type}`}>{submitStatus.message}</p>
                            )}
                        </form>
                    </div>
                </section>
            </main>

            <footer className="welcome-footer">
                <p>&copy; 2025 Mona AboElazm. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Welcome;