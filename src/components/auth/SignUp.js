import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './auth.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        parentEmail: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        parentPhoneNumber: '',
        grade: 9
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        password: false,
        confirmPassword: false
    });

    const handleChange = (e) => {
        const value = e.target.name === 'grade' ? parseInt(e.target.value, 10) : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate phone numbers
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(formData.phoneNumber)) {
            setError('Student phone number must be 10 digits');
            return;
        }
        if (!phoneRegex.test(formData.parentPhoneNumber)) {
            setError('Parent phone number must be 10 digits');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email) || !emailRegex.test(formData.parentEmail)) {
            setError('Please enter valid email addresses');
            return;
        }
        
        setLoading(true);

        try {
            const submittedData = {
                userName: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                parentemail: formData.parentEmail,
                password: formData.password,
                cPassword: formData.confirmPassword,
                phone: formData.phoneNumber,
                parentphone: formData.parentPhoneNumber,
                grade: parseInt(formData.grade, 10)
            };
            
            console.log('Submitting signup data:', submittedData);
            
            const response = await fetch('https://backend-edu-site-5cnm.vercel.app/student/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submittedData)
            });

            const data = await response.json();
            
            if (data.Message === "Done " || data.Message === "Done") {
                // Show success message and redirect to login
                alert('Registration successful! Please check your email and proceed to login.');
                navigate('/login');
            } else if (data.message === "User with this email, username, or phone already exists.") {
                setError('Email, username, or phone number is already registered');
            } else {
                setError(data.Message || 'An unknown error occurred.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred during registration.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false); 
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Create Account</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="firstName">First Name:</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name:</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Student Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="parentEmail">Parent Email:</label>
                        <input
                            type="email"
                            id="parentEmail"
                            name="parentEmail"
                            value={formData.parentEmail}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Student Phone Number:</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            placeholder="10 digits number"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="parentPhoneNumber">Parent Phone Number:</label>
                        <input
                            type="tel"
                            id="parentPhoneNumber"
                            name="parentPhoneNumber"
                            value={formData.parentPhoneNumber}
                            onChange={handleChange}
                            required
                            placeholder="10 digits number"
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="grade">Grade:</label>
                        <select
                            id="grade"
                            name="grade"
                            value={formData.grade}
                            onChange={handleChange}
                            required
                            className="form-input"
                        >
                            <option value={9}>Grade 6</option>
                            <option value={9}>Grade 7</option>
                            <option value={9}>Grade 8</option>
                            <option value={9}>Grade 9</option>
                            <option value={10}>Grade 10</option>
                            <option value={11}>Grade 11</option>
                            <option value={12}>Grade 12</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <div className="password-input-container">
                            <input
                                type={showPasswords.password ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                            <span 
                                className="password-toggle-icon"
                                onClick={() => togglePasswordVisibility('password')}
                            >
                                {showPasswords.password ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <div className="password-input-container">
                            <input
                                type={showPasswords.confirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="form-input"
                            />
                            <span 
                                className="password-toggle-icon"
                                onClick={() => togglePasswordVisibility('confirmPassword')}
                            >
                                {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? <div className="loading-spinner-small"></div> : 'Sign Up'}
                    </button>
                </form>
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;