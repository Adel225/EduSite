// src/components/pages/FAQs.js
import React, { useState } from 'react';
import '../../styles/subpages/faqs.css';
import '../../styles/welcome.css'; 

const FAQs = () => {
    // State to manage which FAQ is currently open
    const [activeFaq, setActiveFaq] = useState(null);

    const faqsData = [
        {
            id: 1,
            question: 'Q: Why should I choose you as my tutor?',
            answer: 'Placeholder answer: With years of specialized experience, a proven track record of student success, and a passion for making math understandable, I provide a learning experience that goes beyond the textbook.'
        },
        {
            id: 2,
            question: 'Q: What sets you apart from other tutors?',
            answer: 'Placeholder answer: My approach is highly personalized. I focus on identifying each student\'s unique strengths and weaknesses to build a tailored curriculum that fosters both confidence and competence.'
        },
        {
            id: 3,
            question: 'Q: What does your course include?',
            answer: 'Placeholder answer: Courses include live interactive sessions, a comprehensive library of materials and notes, regular assignments with personalized feedback, and continuous progress tracking.'
        },
        {
            id: 4,
            question: 'Q: What makes your students excel in their exams?',
            answer: 'Placeholder answer: We focus on deep conceptual understanding rather than rote memorization. By teaching problem-solving strategies and critical thinking skills, students are equipped to handle any question that comes their way.'
        },
    ];

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const heroBackgroundImage = 'https://res.cloudinary.com/dwcy6vc23/image/upload/v1755143777/EduSite/toolxox.com-mEkl9_v9dg7e.jpg';

    return (
        <div className="faqs-page-container">
            <section className="faqs-hero-section" style={{ backgroundImage: `url('${heroBackgroundImage}')` }}>
                <div className="container">
                    <h1>Frequently Asked Questions</h1>
                </div>
            </section>
            
            <div className="faqs-main-content">
                <div className="container faqs-container">
                    {faqsData.map((faq) => (
                        <div className={`faq-item ${activeFaq === faq.id ? 'active' : ''}`} key={faq.id}>
                            <div className="faq-question" onClick={() => toggleFaq(faq.id)}>
                                <span>{faq.question}</span>
                                <span className="faq-icon">{activeFaq === faq.id ? '×' : '+'}</span>
                            </div>
                            <div className="faq-answer">
                                <p>{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQs;