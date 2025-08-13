// src/components/Welcome.js
import React , { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/welcome.css';
import {API_URL} from "../config";

const CheckmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;


const FacebookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 50 50">
<path d="M25,3C12.85,3,3,12.85,3,25c0,11.03,8.125,20.137,18.712,21.728V30.831h-5.443v-5.783h5.443v-3.848 c0-6.371,3.104-9.168,8.399-9.168c2.536,0,3.877,0.188,4.512,0.274v5.048h-3.612c-2.248,0-3.033,2.131-3.033,4.533v3.161h6.588 l-0.894,5.783h-5.694v15.944C38.716,45.318,47,36.137,47,25C47,12.85,37.15,3,25,3z"></path>
</svg>;
const InstagramIcon = () => <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 24 24">
<path d="M 8 3 C 5.243 3 3 5.243 3 8 L 3 16 C 3 18.757 5.243 21 8 21 L 16 21 C 18.757 21 21 18.757 21 16 L 21 8 C 21 5.243 18.757 3 16 3 L 8 3 z M 8 5 L 16 5 C 17.654 5 19 6.346 19 8 L 19 16 C 19 17.654 17.654 19 16 19 L 8 19 C 6.346 19 5 17.654 5 16 L 5 8 C 5 6.346 6.346 5 8 5 z M 17 6 A 1 1 0 0 0 16 7 A 1 1 0 0 0 17 8 A 1 1 0 0 0 18 7 A 1 1 0 0 0 17 6 z M 12 7 C 9.243 7 7 9.243 7 12 C 7 14.757 9.243 17 12 17 C 14.757 17 17 14.757 17 12 C 17 9.243 14.757 7 12 7 z M 12 9 C 13.654 9 15 10.346 15 12 C 15 13.654 13.654 15 12 15 C 10.346 15 9 13.654 9 12 C 9 10.346 10.346 9 12 9 z"></path>
</svg>;
const WhatsAppIcon = () => <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 50 50">
<path d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 29.079097 3.1186875 32.88588 4.984375 36.208984 L 2.0371094 46.730469 A 1.0001 1.0001 0 0 0 3.2402344 47.970703 L 14.210938 45.251953 C 17.434629 46.972929 21.092591 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 21.278025 46 17.792121 45.029635 14.761719 43.333984 A 1.0001 1.0001 0 0 0 14.033203 43.236328 L 4.4257812 45.617188 L 7.0019531 36.425781 A 1.0001 1.0001 0 0 0 6.9023438 35.646484 C 5.0606869 32.523592 4 28.890107 4 25 C 4 13.390466 13.390466 4 25 4 z M 16.642578 13 C 16.001539 13 15.086045 13.23849 14.333984 14.048828 C 13.882268 14.535548 12 16.369511 12 19.59375 C 12 22.955271 14.331391 25.855848 14.613281 26.228516 L 14.615234 26.228516 L 14.615234 26.230469 C 14.588494 26.195329 14.973031 26.752191 15.486328 27.419922 C 15.999626 28.087653 16.717405 28.96464 17.619141 29.914062 C 19.422612 31.812909 21.958282 34.007419 25.105469 35.349609 C 26.554789 35.966779 27.698179 36.339417 28.564453 36.611328 C 30.169845 37.115426 31.632073 37.038799 32.730469 36.876953 C 33.55263 36.755876 34.456878 36.361114 35.351562 35.794922 C 36.246248 35.22873 37.12309 34.524722 37.509766 33.455078 C 37.786772 32.688244 37.927591 31.979598 37.978516 31.396484 C 38.003976 31.104927 38.007211 30.847602 37.988281 30.609375 C 37.969311 30.371148 37.989581 30.188664 37.767578 29.824219 C 37.302009 29.059804 36.774753 29.039853 36.224609 28.767578 C 35.918939 28.616297 35.048661 28.191329 34.175781 27.775391 C 33.303883 27.35992 32.54892 26.991953 32.083984 26.826172 C 31.790239 26.720488 31.431556 26.568352 30.914062 26.626953 C 30.396569 26.685553 29.88546 27.058933 29.587891 27.5 C 29.305837 27.918069 28.170387 29.258349 27.824219 29.652344 C 27.819619 29.649544 27.849659 29.663383 27.712891 29.595703 C 27.284761 29.383815 26.761157 29.203652 25.986328 28.794922 C 25.2115 28.386192 24.242255 27.782635 23.181641 26.847656 L 23.181641 26.845703 C 21.603029 25.455949 20.497272 23.711106 20.148438 23.125 C 20.171937 23.09704 20.145643 23.130901 20.195312 23.082031 L 20.197266 23.080078 C 20.553781 22.728924 20.869739 22.309521 21.136719 22.001953 C 21.515257 21.565866 21.68231 21.181437 21.863281 20.822266 C 22.223954 20.10644 22.02313 19.318742 21.814453 18.904297 L 21.814453 18.902344 C 21.828863 18.931014 21.701572 18.650157 21.564453 18.326172 C 21.426943 18.001263 21.251663 17.580039 21.064453 17.130859 C 20.690033 16.232501 20.272027 15.224912 20.023438 14.634766 L 20.023438 14.632812 C 19.730591 13.937684 19.334395 13.436908 18.816406 13.195312 C 18.298417 12.953717 17.840778 13.022402 17.822266 13.021484 L 17.820312 13.021484 C 17.450668 13.004432 17.045038 13 16.642578 13 z M 16.642578 15 C 17.028118 15 17.408214 15.004701 17.726562 15.019531 C 18.054056 15.035851 18.033687 15.037192 17.970703 15.007812 C 17.906713 14.977972 17.993533 14.968282 18.179688 15.410156 C 18.423098 15.98801 18.84317 16.999249 19.21875 17.900391 C 19.40654 18.350961 19.582292 18.773816 19.722656 19.105469 C 19.863021 19.437122 19.939077 19.622295 20.027344 19.798828 L 20.027344 19.800781 L 20.029297 19.802734 C 20.115837 19.973483 20.108185 19.864164 20.078125 19.923828 C 19.867096 20.342656 19.838461 20.445493 19.625 20.691406 C 19.29998 21.065838 18.968453 21.483404 18.792969 21.65625 C 18.639439 21.80707 18.36242 22.042032 18.189453 22.501953 C 18.016221 22.962578 18.097073 23.59457 18.375 24.066406 C 18.745032 24.6946 19.964406 26.679307 21.859375 28.347656 C 23.05276 29.399678 24.164563 30.095933 25.052734 30.564453 C 25.940906 31.032973 26.664301 31.306607 26.826172 31.386719 C 27.210549 31.576953 27.630655 31.72467 28.119141 31.666016 C 28.607627 31.607366 29.02878 31.310979 29.296875 31.007812 L 29.298828 31.005859 C 29.655629 30.601347 30.715848 29.390728 31.224609 28.644531 C 31.246169 28.652131 31.239109 28.646231 31.408203 28.707031 L 31.408203 28.708984 L 31.410156 28.708984 C 31.487356 28.736474 32.454286 29.169267 33.316406 29.580078 C 34.178526 29.990889 35.053561 30.417875 35.337891 30.558594 C 35.748225 30.761674 35.942113 30.893881 35.992188 30.894531 C 35.995572 30.982516 35.998992 31.07786 35.986328 31.222656 C 35.951258 31.624292 35.8439 32.180225 35.628906 32.775391 C 35.523582 33.066746 34.975018 33.667661 34.283203 34.105469 C 33.591388 34.543277 32.749338 34.852514 32.4375 34.898438 C 31.499896 35.036591 30.386672 35.087027 29.164062 34.703125 C 28.316336 34.437036 27.259305 34.092596 25.890625 33.509766 C 23.114812 32.325956 20.755591 30.311513 19.070312 28.537109 C 18.227674 27.649908 17.552562 26.824019 17.072266 26.199219 C 16.592866 25.575584 16.383528 25.251054 16.208984 25.021484 L 16.207031 25.019531 C 15.897202 24.609805 14 21.970851 14 19.59375 C 14 17.077989 15.168497 16.091436 15.800781 15.410156 C 16.132721 15.052495 16.495617 15 16.642578 15 z"></path>
</svg>;

const Welcome = () => {
    const navigate = useNavigate();
    const [activeFaq, setActiveFaq] = useState(null);

    const handleLoginClick = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            navigate('/redirecting');
        } else {
            navigate('/login');
        }
    };

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

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
            const response = await fetch(`${API_URL}/feedback/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedback),
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => null);
                throw new Error(errorResult?.message || 'Something went wrong. Please try again.');
            }
            
            setSubmitStatus({ message: 'Thank you for your feedback!', type: 'success' });
            setFeedback({ name: '', email: '', phone: '', grade: '', message: '' });

        } catch (error) {
            setSubmitStatus({ message: error.message, type: 'error' });
        }
    };

    return (
        <div className="welcome-page">
            <div className="top-bar">
                <div className="top-bar-content">
                    <div className="social-links">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FacebookIcon /> Facebook</a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><InstagramIcon /> Instagram</a>
                    </div>
                    <div className="contact-info">
                        <a href="https://wa.me/971508162674" target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> +971 50 816 2674</a>
                    </div>
                </div>
            </div>

            <header className="welcome-header">
                    <nav className="welcome-nav">
                        <Link to="/" className="nav-brand">Mona AboElazm</Link>
                        <div className="nav-links">
                            <Link to="/">Home</Link>
                            <Link to="/courses">Courses</Link>
                            <Link to="/testimonials">Student Testimonials</Link>
                            <Link to="/about">About Us</Link>
                            <Link to="/faqs">FAQs</Link>
                            <Link to="/contact">Contact Us</Link>
                            <button onClick={handleLoginClick} className="nav-button login">Login</button>
                            <Link to="/signup" className="nav-button signup">Sign Up</Link>
                        </div>
                    </nav>
            </header>

            <main>
                <section className="hero-section">
                    <div className="container">
                        <h1 className="hero-title">Placeholder: Welcome to Your Future in Math</h1>
                        <p className="hero-subtitle">Placeholder: Discover a new way of learning that is engaging, effective, and tailored to you.</p>
                        <Link to="/signup" className="hero-button">Get Started Today</Link>
                    </div>
                </section>


                <section id="about" className="welcome-section">
                    <div className="container about-container">
                        <div className="about-text">
                            {/* The h2 now correctly uses the generic .section-title class */}
                            <h2 className="section-title">About The Teacher</h2>
                            <p>Placeholder for your biography...</p>
                            <Link to="/about" className="content-button">Read More</Link>
                        </div>
                        <div className="about-image">
                            <div className="content-image-wrapper soft-rectangle">
                                <img src="https://res.cloudinary.com/dwcy6vc23/image/upload/v1691015553/sample.jpg" alt="Mona AboElazm" />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="experience" className="welcome-section" style={{backgroundColor: '#f8f9fa'}}>
                     <div className="container">
                        <h2 className="section-title">An Exciting Educational Experience</h2>
                        
                        {/* --- First Item (Image on Left, Text on Right) --- */}
                        <div className="content-layout" style={{marginBottom: '4rem'}}>
                            <div className="content-image">
                                <img src="https://res.cloudinary.com/dwcy6vc23/image/upload/v1692917668/a4jpegwtdrrny5fbmrll.png" alt="A Unique Approach" />
                            </div>
                            <div className="content-text">
                                <h3>A Unique Approach</h3>
                                <p>Placeholder text explaining your unique teaching methods. We make even the trickiest concepts crystal clear using relatable analogies and proven strategies that are designed to build a deep, lasting understanding.</p>
                            </div>
                        </div>

                        <div className="content-layout reverse">
                             <div className="content-image">
                                <img src="https://res.cloudinary.com/dwcy6vc23/image/upload/v1692917668/a4jpegwtdrrny5fbmrll.png" alt="Supporting Team" />
                            </div>
                            <div className="content-text">
                                <h3>Our Supporting Team</h3>
                                <p>Placeholder text about the dedicated support team that assists students on their academic journey. We are always available to help answer questions and provide the encouragement students need to succeed.</p>
                            </div>
                        </div>

                    </div>
                </section>

                <section id="testimonials" className="welcome-section testimonials-section">
                    <div className="container">
                        <h2 className="section-title">What My Students Say</h2>
                        <div className="testimonial-grid">
                            <div className="testimonial-card">
                                <p>"Placeholder: Amazing teacher! My grades went up significantly. Highly recommend!"</p>
                                <div className="testimonial-stars">★★★★★</div>
                                <strong>- Student A</strong>
                            </div>
                            <div className="testimonial-card">
                                <p>"Placeholder: The concepts are explained so clearly. I finally understand topics I struggled with for years."</p>
                                <div className="testimonial-stars">★★★★★</div>
                                <strong>- Student B</strong>
                            </div>
                             <div className="testimonial-card">
                                <p>"Placeholder: The best tutor I've ever had. The sessions are engaging and fun."</p>
                                <div className="testimonial-stars">★★★★★</div>
                                <strong>- Student C</strong>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section id="why-choose-us" className="welcome-section" style={{backgroundColor: '#f8f9fa'}}>
                    <div className="container">
                        <h2 className="section-title">Why Choose Us</h2>
                        <div className="features-grid">
                            <div className="feature-card"> <div className="feature-icon"><CheckmarkIcon /></div> <h3>Student-Centric Approach</h3> <p>Placeholder text.</p> </div>
                            <div className="feature-card"> <div className="feature-icon"><BookIcon /></div> <h3>Regular Feedback</h3> <p>Placeholder text.</p> </div>
                            <div className="feature-card"> <div className="feature-icon"><ChartIcon /></div> <h3>Essential Skill Development</h3> <p>Placeholder text.</p> </div>
                        </div>
                    </div>
                </section>

                <section id="faqs" className="welcome-section">
                    <div className="container faqs-container">
                        <h2 className="section-title">Frequently Asked Questions</h2>
                        
                        {/* --- HIGHLIGHT: The new interactive FAQ list --- */}
                        <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}>
                            <div className="faq-question" onClick={() => toggleFaq(1)}>
                                <span>Q: Placeholder question one?</span>
                                <span className="faq-icon">{activeFaq === 1 ? '-' : '+'}</span>
                            </div>
                            <div className="faq-answer">
                                <p>Placeholder answer for the first question. This text explains the details in a clear and concise way.</p>
                            </div>
                        </div>

                        <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}>
                            <div className="faq-question" onClick={() => toggleFaq(2)}>
                                <span>Q: Placeholder question two?</span>
                                <span className="faq-icon">{activeFaq === 2 ? '-' : '+'}</span>
                            </div>
                            <div className="faq-answer">
                                <p>Placeholder answer for the second question, providing more valuable information to prospective students and parents.</p>
                            </div>
                        </div>

                    </div>
                </section>

                <section id="contact" className="welcome-section contact-section">
                    <div className="container">
                        <h2 className="section-title">Get In Touch</h2>
                        <p className="section-subtitle">Have a Feedback or a suggestion? I'd love to hear from you.</p>
                        
                        <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                            <div className="form-grid">
                                <input type="text" name="name" placeholder="Your Name" value={feedback.name} onChange={handleFeedbackChange} required />
                                <input type="email" name="email" placeholder="Your Email" value={feedback.email} onChange={handleFeedbackChange} required />
                                <input type="tel" name="phone" placeholder="Phone Number" value={feedback.phone} onChange={handleFeedbackChange} />
                                <select name="grade" value={feedback.grade} onChange={handleFeedbackChange} required>
                                    <option value="" disabled>Select Grade Level</option>
                                    <option value="9">Grade 6</option>
                                    <option value="9">Grade 7</option>
                                    <option value="9">Grade 8</option>
                                    <option value="9">Grade 9</option>
                                    <option value="10">Grade 10</option>
                                    <option value="11">Grade 11</option>
                                    <option value="12">Grade 12</option>
                                </select>
                            </div>
                            <textarea name="message" placeholder="Your Message" value={feedback.message} onChange={handleFeedbackChange} required></textarea>
                            <button type="submit" className="submit-button" disabled={submitStatus.type === 'loading'}>
                                {submitStatus.type === 'loading' ? 'Sending...' : 'Send Message'}
                            </button>

                            {submitStatus.message && (
                                <p className={`submit-message ${submitStatus.type}`}>{submitStatus.message}</p>
                            )}
                        </form>
                    </div>
                </section>
                
                <section className="demo-cta">
                    <div className="container">
                        <h2>REGISTER FOR THE FREE DEMO CLASS</h2>
                        <Link to="/contact" className="cta-button">Watch Now</Link>
                    </div>
                </section>

            </main>
            
            <footer className="welcome-footer">
                <div className="container">
                    <div className="footer-grid">
                        <div className="footer-col"><h4>Quick Links</h4><ul><li><Link to="/about">About us</Link></li><li><Link to="/courses">Courses</Link></li><li><Link to="/testimonials">Testimonials</Link></li><li><Link to="/contact">Contact Us</Link></li></ul></div>
                        <div className="footer-col"><h4>Our Courses</h4><ul><li><Link to="#">Course A</Link></li><li><Link to="#">Course B</Link></li></ul></div>
                        <div className="footer-col"><h4>Stay Connected</h4><ul><li><a href="#">Facebook</a></li><li><a href="#">Instagram</a></li></ul></div>
                        <div className="footer-col"><h4>Contact Us</h4> <a href="https://wa.me/971508162674" target="_blank" rel="noopener noreferrer"><img src="https://img.icons8.com/?size=100&id=Funux8t3F8Ig&format=png&color=FFFFFF" width="20" height="20" /> +971 50 816 2674</a> </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 Mona AboElazm. All Rights Reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Welcome;