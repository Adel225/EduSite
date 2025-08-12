import React from 'react';
import '../components/auth/auth.css'; 

const Redirecting = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>You're already logged in. Redirecting...</p>
        </div>
    );
};

export default Redirecting;