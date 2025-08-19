// src/hooks/useFeedbackForm.js
import { useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL;

const useFeedbackForm = () => {
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

    // Return everything the form needs to operate
    return {
        feedback,
        submitStatus,
        handleFeedbackChange,
        handleFeedbackSubmit,
    };
};

export default useFeedbackForm;