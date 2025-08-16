// src/components/pages/Courses.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import useFeedbackForm from '../../utils/useFeedbackForm';
import '../../styles/subpages/courses.css';
import '../../styles/welcome.css'; // For shared button/form styles

// Placeholder Icons
const CourseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10v6M12 2v20M20.39 18.39A5 5 0 0 0 17 12A5 5 0 0 0 7 12a5 5 0 0 0 3.39 4.61"/></svg>;
const CustomIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>;


const Courses = () => {
    const coursesData = [
        { id: 1, name: 'IGCSE Mathematics', slug: 'igcse-mathematics', description: 'Comprehensive curriculum mastery for Cambridge, Edexcel, and Oxford.' },
        { id: 2, name: 'A-Level Mathematics', slug: 'a-level-mathematics', description: 'Advanced topics in pure mathematics, statistics, and mechanics.' },
        { id: 3, name: 'SAT Math Prep', slug: 'sat-math-prep', description: 'Targeted strategies and practice for the SAT mathematics sections.' },
        { id: 4, name: 'IGCSE Mathematics', slug: 'igcse-mathematics', description: 'Comprehensive curriculum mastery for Cambridge, Edexcel, and Oxford.' },
        { id: 5, name: 'A-Level Mathematics', slug: 'a-level-mathematics', description: 'Advanced topics in pure mathematics, statistics, and mechanics.' },
        { id: 6, name: 'SAT Math Prep', slug: 'sat-math-prep', description: 'Targeted strategies and practice for the SAT mathematics sections.' },
    ];
    
    const { feedback, submitStatus, handleFeedbackChange, handleFeedbackSubmit } = useFeedbackForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const heroBackgroundImage = 'https://res.cloudinary.com/dwcy6vc23/image/upload/v1755143777/EduSite/toolxox.com-mEkl9_v9dg7e.jpg'; 

    return (
        <>
            <div className="courses-page-container">
                <section className="courses-hero-section" style={{ backgroundImage: `url('${heroBackgroundImage}')` }}>
                    <div className="container">
                        <h1>Our Courses</h1>
                    </div>
                </section>

                <div className="courses-main-content">
                    <div className="courses-grid">
                        {coursesData.map(course => (
                            <div className="course-card" key={course.id}>
                                <div className="course-icon"><CourseIcon /></div>
                                <h3>{course.name}</h3>
                                <p>{course.description}</p>
                                <Link to={`/courses/${course.slug}`} className="content-button">View Details</Link>
                            </div>
                        ))}
                        <div className="course-card custom">
                            <div className="course-icon"><CustomIcon /></div>
                            <h3>Need Something Different?</h3>
                            <p>We can create a personalized curriculum tailored to your specific needs and learning goals.</p>
                            <button className="content-button" onClick={() => setIsModalOpen(true)}>Request a Custom Course</button>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Custom Course Request"
                className="form-modal"
                overlayClassName="form-modal-overlay"
            >
                <h2>Custom Course Inquiry</h2>
                <form onSubmit={handleFeedbackSubmit}>
                    <div className="form-grid">
                        <input type="text" name="name" placeholder="Your Name *" value={feedback.name} onChange={handleFeedbackChange} required />
                        <input type="email" name="email" placeholder="Your Email *" value={feedback.email} onChange={handleFeedbackChange} required />
                        <input type="tel" name="phone" placeholder="Phone Number *" value={feedback.phone} onChange={handleFeedbackChange} required />
                        <select name="grade" value={feedback.grade} onChange={handleFeedbackChange} required>
                            <option value="" disabled>Select Grade Level *</option>
                            <option value="6">Grade 6</option>
                            <option value="7">Grade 7</option>
                            <option value="8">Grade 8</option>
                            <option value="9">Grade 9</option>
                            <option value="10">Grade 10</option>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                        </select>
                    </div>
                    <textarea name="message" placeholder="Please describe the topics you need help with... *" value={feedback.message} onChange={handleFeedbackChange} required></textarea>
                    <button type="submit" className="submit-button" disabled={submitStatus.type === 'loading'}>
                        {submitStatus.type === 'loading' ? 'Sending...' : 'Send Request'}
                    </button>
                    {submitStatus.message && <p className={`submit-message ${submitStatus.type}`}>{submitStatus.message}</p>}
                </form>
            </Modal>
        </>
    );
};

export default Courses;