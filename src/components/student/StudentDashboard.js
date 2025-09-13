// src/components/student/pages/StudentCoursesDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Modal from 'react-modal';
import { useAuth } from '../../utils/AuthContext';
import Exit from "../../icons/exit.svg"
import '../../styles/coursesDashboard.css';
import { useConfirmation } from '../../utils/ConfirmationModal';

const API_URL = process.env.REACT_APP_API_URL;

const StudentDashboard = () => {
    const { user } = useAuth();

    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [submitStatus, setSubmitStatus] = useState('');
    const { showSuccess } = useConfirmation();
    const { showError } = useConfirmation();

    const generateCardColors = (courseId) => {
        const colorPairs = [
            { primary: '#1976d2', secondary: '#1565c0' }, // Blue
            { primary: '#388e3c', secondary: '#2e7d32' }, // Green
            { primary: '#f57c00', secondary: '#ef6c00' }, // Orange
            { primary: '#7b1fa2', secondary: '#6a1b9a' }, // Purple
            { primary: '#c2185b', secondary: '#ad1457' }, // Pink
            { primary: '#00796b', secondary: '#00695c' }, // Teal
            { primary: '#5d4037', secondary: '#4e342e' }, // Brown
            { primary: '#455a64', secondary: '#37474f' }, // Blue Grey
        ];
        
        // Create a simple hash from courseId to get consistent index
        let hash = 0;
        for (let i = 0; i < courseId.length; i++) {
            const char = courseId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        const index = Math.abs(hash) % colorPairs.length;
        return colorPairs[index];
    };

    const course = user?.groupId;

    const handleOpenJoinModal = () => {
        setJoinCode('');
        setSubmitStatus('');
        setIsJoinModalOpen(true);
    }
    const handleCloseJoinModal = () => {
        setIsJoinModalOpen(false);
        setJoinCode('');
        setSubmitStatus('');
    };

    const handleJoinSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('Joining...');
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/group/join/${joinCode}`, {
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}` },
            });
            const result = await response.json();
            if (!response.ok) {
                handleCloseJoinModal();
                await showError({
                    title: 'Error joining group',
                    message: result.message || 'An error occured',
                    confirmText: 'Cancel'
                });
                throw new Error(result.message || 'Failed to join course.');
            }

            handleCloseJoinModal();
            await showSuccess({
                title: 'Success',
                message: `Successfully joined "${result.group.name}"!`,
                confirmText: 'Great!'
            });

        } catch (err) {
            setSubmitStatus(`Error: ${err.message}`);
        }
    };


    const courses = user?.groupIds || [];
    console.log(courses);
    
    return (
        <>
            <div className="courses-dashboard">
                <div className="dashboard-header">
                    <h1>My Courses</h1>
                    <div className="header-actions">
                        <button className="action-button" onClick={handleOpenJoinModal}>
                            + Join Course
                        </button>
                    </div>
                </div>

                <div className="courses-grid">
                    {courses.length > 0 ? (
                        courses.map(course => {
                            const colors = generateCardColors(course._id);
                            
                            return (
                                <div 
                                    className="course-card" 
                                    key={course._id}
                                    style={{
                                        '--card-header-bg': colors.primary,
                                        '--card-header-secondary': colors.secondary,
                                        '--card-header-pattern': `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`
                                    }}
                                >
                                    <div className="card-header">
                                        <Link to={`/dashboard/courses/${course._id}`}>
                                            <h3>{course.groupname}</h3>
                                        </Link>
                                    </div>
                                    <div className="card-body">
                                    </div>
                                    <div className="card-footer">
                                        <button className="card-footer-btn">
                                            <img src={Exit} width="20" height="20" alt="Archive" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>You are not currently enrolled in any courses. Join a course to get started!</p>
                    )}
                </div>
            </div>
            
            <Modal
                isOpen={isJoinModalOpen}
                onRequestClose={handleCloseJoinModal}
                contentLabel="Join a Course"
                className="form-modal"
                overlayClassName="form-modal-overlay"
            >
                <h2>Join Course</h2>
                <form onSubmit={handleJoinSubmit}>
                    <div className="form-group">
                        <label>Class Code</label>
                        <p style={{fontSize: '0.9rem', color: '#666', margin: '0 0 1rem 0'}}>
                            Enter the code provided by your teacher.
                        </p>
                        <input 
                            type="text" 
                            placeholder="Enter code" 
                            value={joinCode} 
                            onChange={(e) => setJoinCode(e.target.value)} 
                            required 
                        />
                    </div>
                    {submitStatus && <p className="submit-status">{submitStatus}</p>}
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={handleCloseJoinModal}>Cancel</button>
                        <button type="submit" disabled={submitStatus === 'Joining...'}>
                            {submitStatus === 'Joining...' ? 'Joining...' : 'Join'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default StudentDashboard;