// src/components/auth/login.js (example path)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './auth.css'; 
import { useAuth } from '../../utils/AuthContext'; 
const API_URL = process.env.REACT_APP_API_URL;

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth(); 


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); 
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/student/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.token) {
                // --- HIGHLIGHT: Call the central login function. No more navigating from here. ---
                await login(data.token, rememberMe);
                // The AppRoutes component will now detect the user change and handle the redirect.
            } else {
                setError(data.Message || 'Login failed');
                setLoading(false); // Stop loading ONLY on failure
            }
        } catch (err) {
            setError('An error occurred during login. Please check your connection.');
            console.error('Login error:', err);
            setLoading(false); // Stop loading ONLY on failure
        }
        // On success, the loading spinner will continue until the page redirects.
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome Back</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-input"
                            />
                            <span 
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                    </div>
                    <div className="form-group remember-me">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span>Remember Me</span>
                        </label>
                    </div>
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? <div className="loading-spinner-small"></div> : 'Login'}
                    </button>
                </form>
                <div className="auth-footer">
                    <div className="signup-link">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </div>
                    <div className="teacher-login">
                        <Link to="/admin/login" className="teacher-login-link">Login as Teacher</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;