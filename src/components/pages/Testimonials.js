// src/components/pages/Testimonials.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/subpages/testimonials.css';
import '../../styles/welcome.css'; 

const Testimonials = () => {

    const testimonialsData = [
        { id: 1, studentName: 'Adel', rating: 5, message: '"Amazing teacher! My grades went up significantly. Highly recommend!"' },
        { id: 2, studentName: 'Sameh', rating: 5, message: '"The concepts are explained so clearly. I finally understand topics I struggled with for years."' },
        { id: 3, studentName: 'Yousef', rating: 5, message: '"The best tutor I\'ve ever had. The sessions are engaging and fun."' },
        { id: 4, studentName: 'Adam', rating: 4, message: '"A wonderful and supportive learning environment. Thank you!"' },
        { id: 5, studentName: 'Ahmed', rating: 5, message: '"The personalized feedback on assignments was incredibly helpful for my progress."' },
        { id: 6, studentName: 'Salah', rating: 4, message: '"Dr. Mona makes complex topics feel simple and approachable. Couldn\'t have passed without her."' },
    ];

    // Replace with the link to your background image
    const heroBackgroundImage = 'https://res.cloudinary.com/dwcy6vc23/image/upload/v1755143777/EduSite/toolxox.com-mEkl9_v9dg7e.jpg';

    return (
        <div className="testimonials-page-container">
            <section className="testimonials-hero-section" style={{ backgroundImage: `url('${heroBackgroundImage}')` }}>
                <div className="container">
                    <h1>Testimonials</h1>
                </div>
            </section>
            
            <div className="testimonials-main-content">
                <div className="container">
                    <div className="testimonials-grid">
                        {testimonialsData.map((testimonial) => (
                            <div className="testimonial-card-full" key={testimonial.id}>
                                <p>{testimonial.message}</p>
                                <div>
                                    <div className="testimonial-stars">
                                        {'★'.repeat(testimonial.rating)}
                                        {'☆'.repeat(5 - testimonial.rating)}
                                    </div>
                                    <strong>- {testimonial.studentName}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Testimonials;

