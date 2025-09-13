// src/components/courses/CoursesDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import '../../styles/coursesDashboard.css';
import Trending from "../../icons/arrow-trend-up.svg"
import Box from "../../icons/box.svg"
import Threedots from "../../icons/menu-dots-vertical.svg"
import Modal from 'react-modal'
import { useConfirmation } from '../../utils/ConfirmationModal';
const API_URL = process.env.REACT_APP_API_URL;


const size = 20;


const CoursesDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showConfirmation } = useConfirmation();
    const { showError } = useConfirmation();
    const { showSuccess } = useConfirmation();
    const { user } = useAuth();
    const [openMenuId, setOpenMenuId] = useState(null);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [courseToAction, setCourseToAction] = useState(null); 
    const [actionToConfirm, setActionToConfirm] = useState(null); 

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        name: ''
    });
    const [submitStatus, setSubmitStatus] = useState('');

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

    const fetchCourses = useCallback(async (page = 1, append = false) => {
        if (!append) setLoading(true);
        else setLoadingMore(true);
        
        setError(null);
        
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/group/all?page=${page}&size=${size}`, { // Using size=3 as an example
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            const data = await response.json();
            if (data.Message === "Done") {
                const newCourses = data.groups || [];
                
                if (append) {
                    setCourses(prev => [...prev, ...newCourses]);
                } else {
                    setCourses(newCourses);
                }
                
                // --- THIS IS THE FIX ---
                // Access pagination fields directly from the 'data' object
                setCurrentPage(data.currentPage || page);
                setTotalPages(data.totalPages || 1);

            } else {
                throw new Error(data.Message || "Failed to fetch courses");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const loadMoreCourses = () => {
        if (!loadingMore && currentPage < totalPages) {
            fetchCourses(currentPage + 1, true);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);


    const closeConfirmationModal = () => {
        setIsConfirmModalOpen(false);
        setCourseToAction(null);
        setActionToConfirm(null);
    };

    const handleConfirmAction = () => {
        if (actionToConfirm === 'archive') {
            handleArchive(courseToAction);
        }
        closeConfirmationModal();
    };

    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateFormData({ name: '' });
        setSubmitStatus('');
    };


    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSubmitStatus('Creating...');
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/group/create`, { 
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupname: createFormData.name,
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to create course');

            setSubmitStatus('');
            handleCloseCreateModal();
            await showSuccess({
                title: 'Success',
                message: 'Course created successfully!',
                confirmText: 'Great!'
            });
            fetchCourses(); 
        } catch (err) {
            setSubmitStatus(`Error: ${err.message}`);
        }
    };

    
    // const handleEdit = (course) => alert(`Editing ${course.groupname}`);
    
    const handleDelete = async (groupid) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
            const confirmed = await showConfirmation({
                title: 'Delete Course',
                message: 'This action cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel',
                type: 'danger'
            });
        
            if (!confirmed) return;
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
            await fetchCourses();
        } catch (err) {
            console.log(err);
            await showError({
                title: 'Error deleting group',
                message: err.message || 'An error occured while deleting the group',
                confirmText: 'Try Again'
            });
        }
    };

    const handleArchive = async (course) => {
        const confirmed = await showConfirmation({
            title: 'Archive Course',
            message: 'This Course will be Archived.',
            confirmText: 'Archive',
            cancelText: 'Cancel',
            type: 'warning'
        });
        if (confirmed) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/group/archive`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `MonaEdu ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        _id: course._id,
                        archivedOrRestore: true, 
                    }),
                });
    
                if (!response.ok) {
                    const result = await response.json().catch(() => null);
                    throw new Error(result?.Message || 'Failed to archive course.');
                }
                
                fetchCourses(); 
            } catch (err) {
                console.log(err);
                await showError({
                    title: 'Error archiving group',
                    message: err.message || 'An error occured while archiving the group',
                    confirmText: 'Cancel'
                });
            }
        }
    };


    if (loading) return <div>Loading courses...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <>
            <div className="courses-dashboard">
                <div className="dashboard-header">
                    <h1>Courses</h1>
                    {user?.role === 'main_teacher' && (
                        <div className="header-actions">
                            <button className="action-button" onClick={handleOpenCreateModal}>+ Create Course</button>
                        </div>
                    )}
                </div>

                <div className="courses-grid">
                    {courses.map(course => {
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
                                    <p>{course.studentCount || 0} students</p>
                                </div>
                                <div className="card-footer">
                                    <button className="card-footer-btn">
                                        <img src={Trending} width="20" height="20" alt="Courses" />
                                    </button>
                                    {user?.role === 'main_teacher' && (
                                        <button className="card-footer-btn" onClick={() => handleArchive(course)}>
                                            <img src={Box} width="20" height="20" alt="Archive" />
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
                                                <img src={Threedots} width="20" height="20" alt="settings" />
                                            </button>
                                            {openMenuId === course._id && (
                                                <div className="card-menu-dropdown">
                                                    <button onClick={() => handleDelete(course._id)} className="delete">Delete</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- HIGHLIGHT: Add the "Load More" button section --- */}
                    {!loading && courses.length > 0 && (
                        <div className="load-more-container">
                            {currentPage < totalPages ? (
                                <button
                                    className="load-more-btn"
                                    onClick={loadMoreCourses}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Courses'}
                                </button>
                            ) : (
                                <p className="no-more-items">You've reached the end of the list.</p>
                            )}
                        </div>
                    )}
            </div>




            <Modal
                isOpen={isCreateModalOpen}
                onRequestClose={handleCloseCreateModal}
                contentLabel="Create New Course"
                className="form-modal"
                overlayClassName="form-modal-overlay"
            >
                <h2>Create Course</h2>
                <form onSubmit={handleCreateCourse}>
                    <div className="form-group">
                        <label>Course Name (required)</label>
                        <input type="text" value={createFormData.name} onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})} required />
                    </div>
                    
                    {submitStatus && <p className="submit-status">{submitStatus}</p>}

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={handleCloseCreateModal}>Cancel</button>
                        <button type="submit" disabled={submitStatus === 'Creating...'}>
                            {submitStatus === 'Creating...' ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>




             {/* --- HIGHLIGHT: Add the Confirmation Modal --- */}
            <Modal
                isOpen={isConfirmModalOpen}
                onRequestClose={closeConfirmationModal}
                contentLabel="Confirm Action"
                className="confirmation-modal"
                overlayClassName="form-modal-overlay" // Reuse overlay style
            >
                <h3>Are you sure?</h3>
                <p>
                    {actionToConfirm === 'archive' && `Archiving this course will remove it from the main dashboard. You can restore it later from the "Archived Courses" page.`}
                </p>
                <div className="confirmation-actions">
                    <button className="cancel-btn-confirm" onClick={closeConfirmationModal}>Cancel</button>
                    <button className="confirm-btn-archive" onClick={handleConfirmAction}>
                        Yes, Archive
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default CoursesDashboard;