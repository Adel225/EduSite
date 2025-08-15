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
            question: 'Q: How will your lessons help me improve my maths grades?',
            answer: 'My lessons are designed to break down complex IGCSE maths concepts into simple, easy-to-follow steps. You’ll receive targeted practice, clear explanations, and strategies for tackling tricky exam questions so you can boost both your confidence and your marks.'
        },
        {
            id: 2,
            question: 'Q: What makes your teaching style different?',
            answer: 'I focus on building a solid foundation first — strengthening core skills before moving to advanced problem-solving. Lessons are interactive, personalised, and adapted to your pace, ensuring no topic is left unclear.'
        },
        {
            id: 3,
            question: 'Q: Have your students achieved top results before?',
            answer: 'Yes — many of my students have moved from struggling with maths to achieving A* grades. Their progress comes from consistent practice, focused feedback, and learning how to approach exam questions effectively.'
        },
        {
            id: 4,
            question: 'Q: What exactly will I get when I join your course?',
            answer: 'You’ll get structured lesson plans, concise revision notes, topic-by-topic worksheets, exam-style questions, and live support. Every resource is aligned with the Cambridge and Edexcel IGCSE syllabus to keep you exam-ready.'
        },
        {
            id: 5,
            question: 'Q: How can I be sure I’ll see results?',
            answer: 'If you attend lessons regularly, complete the homework, and apply the techniques we cover, you’ll see steady improvement — and if you put in consistent effort, top grades are within reach.'
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