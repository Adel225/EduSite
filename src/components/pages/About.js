// src/components/pages/About.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/subpages/about.css';  
import '../../styles/welcome.css'; 

const About = () => {
    const heroBackgroundImage = 'https://res.cloudinary.com/dwcy6vc23/image/upload/v1755143782/EduSite/toolxox.com-Ei3cN_1_mprt2u.jpg';
    const teacherPhotoUrl = 'https://res.cloudinary.com/dwcy6vc23/image/upload/v1691015553/sample.jpg';

    return (
        <div className="about-page-container">
            <section className="about-hero-section" style={{ backgroundImage: `url('${heroBackgroundImage}')` }}>
                <div className="container">
                    <h1>About Dr. Mona AboElazm</h1>
                    <p>Know the how and why behind everything.</p>
                </div>
            </section>
            
            <div className="about-main-content">
                <div className="container">
                    <div className="content-layout">
                        <div className="content-text about-detailed-text">
                            <h2>Education is an Activity Directed at Achieving Aims</h2>
                            <p>Over 20 years of experience teaching Mathematics, with expertise in the Cambridge, Edexcel, and Oxford curricula across international schools.</p>
                            <p>My extensive experience ensures a holistic approach that builds critical thinking and problem-solving skills, making mathematics accessible and engaging for every student.</p>
                            <p>Discover how my approach to mathematics goes beyond formulas, equipping your child with the critical thinking skills to succeed.</p>
                            
                            {/* The Call-to-Action Button */}
                            <Link to="/contact" className="content-button" style={{marginTop: '2rem'}}>
                                WATCH FREE DEMO CLASS
                            </Link>
                        </div>
                        <div className="content-image">
                            <div className="content-image-wrapper soft-rectangle">
                                <img src={teacherPhotoUrl} alt="Dr. Mona AboElazm" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;