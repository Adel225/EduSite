// src/components/student/pages/JoinCourse.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';


const API_URL = process.env.REACT_APP_API_URL;

const JoinCourse = () => {
    const { inviteCode } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Joining course...');

    useEffect(() => {
        const join = async () => {
            if (!inviteCode) {
                setStatus('Invalid invite link.');
                return;
            }
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/group/join/${inviteCode}`, {
                    method: 'POST',
                    headers: { 'Authorization': `MonaEdu ${token}` },
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to join the course.');

                setStatus(`Successfully joined "${result.group.name}"! Redirecting...`);
                // Redirect to the main student dashboard after a short delay
                setTimeout(() => navigate('/student/courses', { replace: true }), 2000);

            } catch (err) {
                setStatus(`Error: ${err.message}`);
            }
        };

        join();
    }, [inviteCode, navigate]);

    return (
        <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <h2>{status}</h2>
        </div>
    );
};

export default JoinCourse;