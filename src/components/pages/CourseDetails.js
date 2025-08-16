// src/components/pages/CourseDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Modal from 'react-modal';
import '../../styles/subpages/coursedetails.css'; 
import '../../styles/welcome.css'; 


const coursesDetailsData = {
    'igcse-mathematics': {
        name: 'IGCSE Mathematics',
        longDescription: 'Our IGCSE Mathematics course provides a comprehensive mastery of the Cambridge, Edexcel, and Oxford curricula. We focus on building a strong foundation in core mathematical principles to ensure students are prepared for success in their examinations and beyond.',
        learningOutcomes: [
            'Master algebra, geometry, and trigonometry concepts.',
            'Develop strong problem-solving and analytical skills.',
            'Gain confidence in handling complex exam-style questions.',
            'Prepare thoroughly for all components of the IGCSE exams.'
        ],
        courseFormat: 'Weekly online sessions, 24/7 material access, and personalized assignment feedback.'
    },
    'a-level-mathematics': {
        name: 'A-Level Mathematics',
        longDescription: 'This course covers advanced topics in pure mathematics, statistics, and mechanics, designed to challenge students and prepare them for university-level studies.',
        learningOutcomes: [ 'Calculus Mastery', 'Advanced Statistics', 'Mechanics Principles' ],
        courseFormat: 'Bi-weekly intensive sessions, advanced problem sets.'
    },
    'sat-math-prep': {
        name: 'SAT Math Prep',
        longDescription: 'This course covers advanced topics in pure mathematics, statistics, and mechanics, designed to challenge students and prepare them for university-level studies.',
        learningOutcomes: [ 'Calculus Mastery', 'Advanced Statistics', 'Mechanics Principles' ],
        courseFormat: 'Bi-weekly intensive sessions, advanced problem sets.'
    },
};

const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

const CourseDetails = () => {
    const { courseName } = useParams(); 
    const [course, setCourse] = useState(null);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    
    const [enrollmentData, setEnrollmentData] = useState({ name: '', email: '', phone: '' });
    const [submitStatus, setSubmitStatus] = useState({ message: '', type: '' });

    useEffect(() => {
        const currentCourse = coursesDetailsData[courseName];
        setCourse(currentCourse);
    }, [courseName]);

    const handleEnrollSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ message: 'Sending...', type: 'loading' });
        console.log("Enrolling:", { ...enrollmentData, courseName: course.name });
        setTimeout(() => {
            setSubmitStatus({ message: 'Enrollment request sent successfully!', type: 'success' });
            setIsEnrollModalOpen(false);
        }, 1500);
    };

    if (!course) {
        return (
            <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
                <h1>Course Not Found</h1>
                <p>The course you are looking for does not exist.</p>
                <Link to="/courses" className="content-button">← View All Courses</Link>
            </div>
        );
    }

    return (
        <>
            <div className="course-details-page">
                <section className="course-details-hero" style={{ backgroundImage: `url('https://res.cloudinary.com/dwcy6vc23/image/upload/v1755143777/EduSite/toolxox.com-mEkl9_v9dg7e.jpg')` }}>
                    <div className="container">
                        <h1>{course.name}</h1>
                    </div>
                </section>

                <div className="container">
                    <div className="details-grid">
                        <div className="course-main-details">
                            <h2>Detailed Description</h2>
                            <p>{course.longDescription}</p>
                            
                            <h2>What You'll Learn</h2>
                            <ul className="learning-outcomes-list">
                                {course.learningOutcomes.map((outcome, index) => (
                                    <li key={index}><CheckIcon /> {outcome}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="course-sidebar">
                            <div className="course-sidebar-item">
                                <h4>Course Format</h4>
                                <p>{course.courseFormat}</p>
                            </div>
                            <div className="course-sidebar-item">
                                <button className="content-button enroll-now-btn" onClick={() => setIsEnrollModalOpen(true)}>
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isEnrollModalOpen}
                onRequestClose={() => setIsEnrollModalOpen(false)}
                contentLabel="Enroll Now"
                className="form-modal"
                overlayClassName="form-modal-overlay"
            >
                <h2>Enroll in: {course.name}</h2>
                <form onSubmit={handleEnrollSubmit}>
                    <div className="form-group"><label>Your Name *</label><input type="text" value={enrollmentData.name} onChange={(e) => setEnrollmentData({...enrollmentData, name: e.target.value})} required/></div>
                    <div className="form-group"><label>Your Email *</label><input type="email" value={enrollmentData.email} onChange={(e) => setEnrollmentData({...enrollmentData, email: e.target.value})} required/></div>
                    <div className="form-group"><label>Phone Number *</label><input type="tel" value={enrollmentData.phone} onChange={(e) => setEnrollmentData({...enrollmentData, phone: e.target.value})} required/></div>
                    
                    <button type="submit" className="submit-button" disabled={submitStatus.type === 'loading'}>
                        {submitStatus.type === 'loading' ? 'Sending...' : 'Enroll Now'}
                    </button>
                    {submitStatus.message && <p className={`submit-message ${submitStatus.type}`}>{submitStatus.message}</p>}
                </form>
            </Modal>
        </>
    );
};

export default CourseDetails;