// src/components/pages/Testimonials.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/subpages/testimonials.css'; // Import the new CSS file

const Testimonials = () => {
    // This is the same simulated data from Welcome.js.
    // Later, you will replace this with a useEffect and useState to fetch from your API.
    const testimonialsData = [
        { id: 1, studentName: 'Adel', rating: 5, message: '"Amazing teacher! My grades went up significantly. Highly recommend!"' },
        { id: 2, studentName: 'Sameh', rating: 5, message: '"The concepts are explained so clearly. I finally understand topics I struggled with for years."' },
        { id: 3, studentName: 'Yousef', rating: 5, message: '"The best tutor I\'ve ever had. The sessions are engaging and fun."' },
        { id: 4, studentName: 'Adam', rating: 4, message: '"A wonderful and supportive learning environment. Thank you!"' },
        { id: 5, studentName: 'Ahmed', rating: 5, message: '"The personalized feedback on assignments was incredibly helpful for my progress."' },
        { id: 6, studentName: 'Salah', rating: 4, message: '"Dr. Mona makes complex topics feel simple and approachable. Couldn\'t have passed without her."' },
    ];

    return (
        <div className="testimonials-page-container">
            <div className="container">
                <Link to="/" className="back-to-home-btn">← Back to Home</Link>
                
                <div className="testimonials-header">
                    <h1 className="section-title">What My Students Say</h1>
                    <p className="section-subtitle">
                        We are proud to share the positive impact we've had. Here is a collection of feedback from our students.
                    </p>
                </div>
                
                <div className="testimonials-grid">
                    {testimonialsData.map((testimonial) => (
                        <div className="testimonial-card-full" key={testimonial.id}>
                            <p>{testimonial.message}</p>
                            <div className="testimonial-stars">
                                {'★'.repeat(testimonial.rating)}
                                {'☆'.repeat(5 - testimonial.rating)}
                            </div>
                            <strong>- {testimonial.studentName}</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Testimonials;