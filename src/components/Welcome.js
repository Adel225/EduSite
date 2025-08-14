// src/components/Welcome.js
import React , { useState , useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/welcome.css';
import {API_URL} from "../config";
import useIntersectionObserver from '../utils/useIntersectionObserver';
import WelcomeHeader from './WelcomeHeader';
import WelcomeFooter from './WelcomeFooter';

const CheckmarkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const BookIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;



const Welcome = () => {
    const navigate = useNavigate();
    const [activeFaq, setActiveFaq] = useState(null);

    const aboutRef = useIntersectionObserver({ threshold: 0.3 });
    const experienceRef = useIntersectionObserver({ threshold: 0.2 });
    const testimonialsRef = useIntersectionObserver({ threshold: 0.3 });
    const whyChooseUsRef = useIntersectionObserver({ threshold: 0.3 });
    const faqsRef = useIntersectionObserver({ threshold: 0.3 });
    const contactRef = useIntersectionObserver({ threshold: 0.3 });

    const heroSlides = [
        {
            imageUrl: 'https://res.cloudinary.com/dwcy6vc23/image/upload/v1755143782/EduSite/toolxox.com-Ei3cN_1_mprt2u.jpg',
            subtitle: 'Turning complex problems into clear, confident solutions for IGCSE success'
        },
        {
            imageUrl: 'https://res.cloudinary.com/dwcy6vc23/image/upload/v1755143777/EduSite/toolxox.com-mEkl9_v9dg7e.jpg',
            subtitle: 'Comprehensive curriculum mastery for Cambridge, Edexcel, and Oxford IGCSE Mathematics'
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prevSlide => (prevSlide + 1) % heroSlides.length);
        }, 10000);
    
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    const testimonialsData = [
        {
            id: 1,
            studentName: 'Adel sameh',
            rating: 5, 
            message: '"Placeholder: Amazing teacher! My grades went up significantly. Highly recommend!"'
        },
        {
            id: 2,
            studentName: 'Ahmed Salah',
            rating: 4,
            message: '"Placeholder: The concepts are explained so clearly. I finally understand topics I struggled with for years."'
        },
        {
            id: 3,
            studentName: '3amo maged',
            rating: 3,
            message: '"Placeholder: The best tutor I\'ve ever had. The sessions are engaging and fun."'
        },
        {
            id: 4,
            studentName: 'It is me',
            rating: 1,
            message: '"Placeholder: A wonderful and supportive learning environment. Thank you!"'
        }
    ];

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

            <WelcomeHeader />

            <main>
            <section className="hero-section" style={{ backgroundImage: `url('${heroSlides[currentSlide].imageUrl}')` }}>
                <div className="hero-content">
                    <h1 className="hero-title">Mathematics, Mastered with Mrs. Mona Abouelazm</h1>
                    <p className="hero-subtitle">{heroSlides[currentSlide].subtitle}</p>
                    <Link to="/signup" className="hero-button">Get Started</Link>
                </div>
            </section>


                <section id="about" className="welcome-section animated-section" ref={aboutRef}>
                    <div className="container about-container">
                        <div className="about-text">
                            <h2 className="section-title">About Mrs. Mona Abouelazm</h2>
                            <p>Over 20 years of experience teaching Mathematics, with expertise in the Cambridge, Edexcel, and Oxford curricula across international schools.</p>
                            <p>My extensive experience ensures a holistic approach that builds critical thinking and problem-solving skills, making mathematics accessible and engaging for every student.</p>
                            <p>Discover how my approach to mathematics goes beyond formulas, equipping your child with the critical thinking skills to succeed.</p>
                            <Link to="/about" className="content-button">Read More</Link>
                            
                        </div>
                        <div className="about-image">
                            <div className="content-image-wrapper soft-rectangle">
                                <img src="https://res.cloudinary.com/dwcy6vc23/image/upload/v1691015553/sample.jpg" alt="Mona AboElazm" />
                            </div>
                        </div>
                    </div>
                </section>

                <section id="experience" className="welcome-section animated-section" ref={experienceRef} style={{backgroundColor: '#f8f9fa'}}>
                    <div className="container">
                        <h2 className="section-title">Master Math, One Step at a Time</h2>
                        <p className="content-subtext">Math isn't just about numbers — it's about understanding, confidence, and problem-solving. Here, you'll have a guide who turns tricky concepts into clear steps, helping you transform confusion into achievement and making every lesson an exciting part of your journey.</p>
                        
                        <div className="content-layout" style={{marginBottom: '4rem'}}>
                            <div className="content-image">
                                <img src="https://res.cloudinary.com/dwcy6vc23/image/upload/v1692917668/a4jpegwtdrrny5fbmrll.png" width="500" height="500" alt="A Unique Approach" />
                            </div>
                            <div className="content-text">
                                <h3>A Fresh Perspective</h3>
                                <p className="content-subtext">Our approach isn’t just about memorizing formulas — it’s about understanding concepts deeply and seeing problems in new ways</p>
                                <p className="content-subtext">By breaking complex ideas into clear, manageable steps, we help students build strong foundations, boost confidence, and develop lifelong problem-solving skills.</p>
                                <p className="content-subtext">With this fresh perspective, challenges become opportunities, and learning math transforms from a chore into an exciting journey toward success in exams, college, and everyday life.</p>
                            </div>
                        </div>

                        <div className="content-layout reverse">
                            <div className="content-image">
                                <img src="https://res.cloudinary.com/dwcy6vc23/image/upload/v1692917668/a4jpegwtdrrny5fbmrll.png" width="500" height="500" alt="Supporting Team" />
                            </div>
                            <div className="content-text">
                                <h3>Experts by Your Side</h3>
                                <p className="content-subtext">Behind every great learning experience is a team that truly cares. Our supporting team is here to answer questions, clarify doubts, and provide encouragement, ensuring that no student feels stuck or left behind.</p>
                                <p className="content-subtext">With dedicated guidance, timely feedback, and a focus on each student’s unique needs, our team helps transform challenges into confidence-building milestones, making your journey through mathematics smoother, more effective, and rewarding.</p>
                            </div>
                        </div>

                    </div>
                </section>

                <section id="testimonials" className="welcome-section testimonials-section" ref={testimonialsRef}>
                    <div className="container">
                        <h2 className="section-title">What My Students Say</h2>
                        <div className="testimonial-grid mobile-only">
                            {testimonialsData.slice(0, 3).map((testimonial) => (
                                <div className="testimonial-card" key={testimonial.id}>
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
                    <div className="testimonial-marquee desktop-only">
                        <div className="testimonial-track">
                            {testimonialsData.map((testimonial) => (
                                <div className="testimonial-card" key={testimonial.id}>
                                    <p>{testimonial.message}</p>
                                    <div className="testimonial-stars">
                                        {'★'.repeat(testimonial.rating)}
                                        {'☆'.repeat(5 - testimonial.rating)}
                                    </div>
                                    <strong>- {testimonial.studentName}</strong>
                                </div>
                            ))}
                            
                            {/* Map over the data AGAIN to create the seamless duplicate set */}
                            {testimonialsData.map((testimonial) => (
                                <div className="testimonial-card" key={`duplicate-${testimonial.id}`} aria-hidden="true">
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
                    <div className="view-all-container">
                        <Link to="/testimonials" className="content-button">View All Testimonials</Link>
                    </div>
                </section>
                
                <section id="why-choose-us" className="welcome-section animated-section" ref={whyChooseUsRef} style={{backgroundColor: '#f8f9fa'}}>
                    <div className="container">
                        <h2 className="section-title">Why Choose Us</h2>
                        <p className="why-choose-us-p">For a solid foundation in IGCSE Mathematics and a passion for problem-solving</p>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <CheckmarkIcon />
                                </div> 
                                <h3>Personalized Learning Journey</h3> 
                                <p>We offer a tailored learning experience that focuses on individual strengths and areas for improvement.</p> 
                                <p>Our dedicated support and targeted practice help students master complex concepts and build confidence.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <BookIcon />
                                </div> 
                                <h3>Continuous Performance Monitoring</h3> 
                                <p>We provide consistent, detailed feedback through regular assessments.</p> 
                                <p>This proactive monitoring keeps students on track toward their goals and ensures parents are well-informed.</p>
                            </div>
                            <div className="feature-card"> 
                                <div className="feature-icon">
                                    <ChartIcon />
                                </div> 
                                <h3>Building a Future-Ready Skillset</h3> 
                                <p>Our curriculum is designed to cultivate the analytical and logical reasoning skills vital for higher education and future careers.</p> 
                                <p>We equip students with the tools to confidently tackle real-world problems.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faqs" className="welcome-section animated-section" ref={faqsRef}>
                    <div className="container faqs-container">
                        <h2 className="section-title">Frequently Asked Questions</h2>
                        
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
                    <div className="view-all-container">
                        <Link to="/faqs" className="content-button">View All FAQs</Link>
                    </div>
                </section>

                <section id="contact" className="welcome-section contact-section animated-section" ref={contactRef}>
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
                        <Link to="/demo" className="cta-button">Watch Now</Link>
                    </div>
                </section>

            </main>
            
            <WelcomeFooter/>
        </div>
    );
};

export default Welcome;