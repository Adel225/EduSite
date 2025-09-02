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
                    {course ? (
                        <div className="course-card" key={course._id}>
                            <div className="card-header">
                                <Link to={`/student/courses/${course._id}`}>
                                    <h3>{course.groupname}</h3>
                                </Link>
                                
                            </div>
                            <div className="card-body">
                                {/* Placeholder for section/subject info */}
                                {/* <p style={{color: '#777', fontSize: '0.9rem'}}>Section/Subject Placeholder</p> */}
                            </div>
                            <div className="card-footer">
                                <button className="card-footer-btn">
                                    <img src={Exit} width="20" length="20" alt="Archive" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p>You are not currently enrolled in any course. Join a course to get started!</p>
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