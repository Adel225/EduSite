// src/components/courses/CoursesDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/coursesDashboard.css';
import Trending from "../../icons/arrow-trend-up.svg"
import Restore from "../../icons/time-past.svg"
import Threedots from "../../icons/menu-dots-vertical.svg"
import Modal from 'react-modal'
import { useConfirmation } from '../../utils/ConfirmationModal';
const API_URL = process.env.REACT_APP_API_URL;



const ArchivedCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showError } = useConfirmation();
    const { user } = useAuth();
    const [openMenuId, setOpenMenuId] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [courseToAction, setCourseToAction] = useState(null); 
    const [actionToConfirm, setActionToConfirm] = useState(null); 

    const fetchArchivedCourses = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/group/all?isArchived=true`, {
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            const data = await response.json();
            if (data.Message === "Done") {
                setCourses(data.groups || []);
            } else {
                throw new Error(data.Message || "Failed to fetch courses");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArchivedCourses();
    }, [fetchArchivedCourses]);

     // --- HIGHLIGHT: New functions to manage the confirmation modal ---
    const openConfirmationModal = (course, action) => {
        setCourseToAction(course);
        setActionToConfirm(action);
        setIsConfirmModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setIsConfirmModalOpen(false);
        setCourseToAction(null);
        setActionToConfirm(null);
    };

    const handleConfirmAction = () => {
        if (actionToConfirm === 'archive') {
            handleRestore(courseToAction);
        }
        closeConfirmationModal();
    };

    
    const handleDelete = async (groupid) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!window.confirm("Delete this group?")) return;
        try {
        const res = await fetch(`${API_URL}/group/deletegroup`, {
            method: "DELETE",
            headers: {
            "Content-Type": "application/json",
            Authorization: `MonaEdu ${token}`,
            },
            body: JSON.stringify({ groupid }),
        });
        if (!res.ok) throw new Error("Failed to delete group");
            await fetchArchivedCourses();
        } catch (err) {
            console.log(err);
            await showError({
                title: 'Error deleting group',
                message: err.message || 'An error occured while deleting the group',
                confirmText: 'Try Again'
            });
        }
    };


    const handleRestore = async (course) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await fetch(`${API_URL}/group/archive`, {
                method: 'PATCH',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: course._id, archivedOrRestore: false }) 
            });
            fetchArchivedCourses(); 
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };


    const handleGradebook = (course) => alert(`Opening gradebook for ${course.groupname}`);


    if (loading) return <div>Loading courses...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <>
            <div className="courses-dashboard">
                <div className="dashboard-header">
                    <h1>Archived Courses</h1>
                </div>

                <div className="courses-grid">
                    {courses.map(course => (
                        <div className="course-card" key={course._id}>
                            <div className="card-header">
                                <Link to={`/dashboard/courses/${course._id}`}>
                                    <h3>{course.groupname}</h3>
                                </Link>
                                
                            </div>
                            <div className="card-body">
                                {/* Placeholder for section/subject info */}
                                {/* <p style={{color: '#777', fontSize: '0.9rem'}}>Section/Subject Placeholder</p> */}
                            </div>
                            <div className="card-footer">
                                <button className="card-footer-btn" onClick={() => handleGradebook(course)}>
                                    <img src={Trending} width="20" length="20" alt="Courses" />
                                </button>
                                {user?.role === 'main_teacher' && (
                                    <button className="card-footer-btn" onClick={() => openConfirmationModal(course, 'archive')}>
                                        <img src={Restore} width="20" length="20" alt="Archive" />
                                    </button>
                                )}
                                {user?.role === 'main_teacher' && (
                                    <div className="card-menu-container">
                                        <button 
                                            className="card-footer-btn" 
                                            title="More options"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === course._id ? null : course._id);
                                            }}
                                        >
                                            <img src={Threedots} width="20" length="20" alt="settings" />
                                        </button>
                                        {openMenuId === course._id && (
                                            <div className="card-menu-dropdown">
                                                {/* <button onClick={() => handleEdit(course)}>Edit</button> */}
                                                <button onClick={() => handleDelete(course._id)} className="delete">Delete</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>





             {/* --- HIGHLIGHT: Add the Confirmation Modal --- */}
            <Modal
                isOpen={isConfirmModalOpen}
                onRequestClose={closeConfirmationModal}
                contentLabel="Confirm Action"
                className="confirmation-modal"
                overlayClassName="form-modal-overlay" 
            >
                <h3>Are you sure?</h3>
                <p>
                    {actionToConfirm === 'archive' && `This course will be restored upon confirmation.`}
                </p>
                <div className="confirmation-actions">
                    <button className="cancel-btn-confirm" onClick={closeConfirmationModal}>Cancel</button>
                    <button className="confirm-btn-restore" onClick={handleConfirmAction}>
                        Yes, Restore
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default ArchivedCourses;