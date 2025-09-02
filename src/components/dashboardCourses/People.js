// src/components/courses/People.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Modal from 'react-modal';
import '../../styles/people.css';
import '../../styles/courseRequests.css'; 
import Trash from "../../icons/trash.svg";
import { useConfirmation } from '../../utils/ConfirmationModal';

const API_URL = process.env.REACT_APP_API_URL;

// Placeholder Icons
const InviteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>;


const People = () => {
    const { courseId } = useParams();
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [unassignedStudents, setUnassignedStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showError } = useConfirmation();
    const { showConfirmation } = useConfirmation();
    const { showSuccess } = useConfirmation();

    // State for user interactions
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [studentsToInvite, setStudentsToInvite] = useState(new Set());

    const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

    const fetchEnrolledStudents = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/group/id?_id=${courseId}`, { headers: { 'Authorization': `MonaEdu ${token}` } });
            const data = await response.json();
            if (data.Message === "Done") {
                setEnrolledStudents(data.group.enrolledStudents || []);
            } else {
                throw new Error(data.Message || "Failed to fetch enrolled students.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchEnrolledStudents();
    }, [fetchEnrolledStudents]);
    
    const handleOpenInviteModal = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/student/unassigned`, { headers: { 'Authorization': `MonaEdu ${token}` } });
            const data = await response.json();
            if (data.Message === "No Student Attached to it") {
                setUnassignedStudents([]);
            }
            else if (data.Message === "Unassigned students fetched successfully") {
                setUnassignedStudents(data.students || []);
            }
            setIsInviteModalOpen(true);
        } catch (err) {
            await showError({
                title: 'Error fetching unassigned students',
                message: `Error: ${err.message}` || 'An error occured while fetching unassigned students!',
                confirmText: 'Cancel'
            });
        }
    };

    const handleCloseInviteModal = () => {
        setIsInviteModalOpen(false);
        setStudentsToInvite(new Set());
    };

    const handleAddSubmit = async () => {
        const studentIds = Array.from(studentsToInvite);
        if (studentIds.length === 0) return;
        
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/group/addstudent`, {
                method: 'PUT',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    groupid: courseId, 
                    studentIds: [studentIds]
                })
            });

            if (response.ok) {
                handleCloseInviteModal();
                await showSuccess({
                    title: 'Success',
                    message: `Successfully added ${studentIds.length} student(s).`,
                    confirmText: 'Great!'
                });
                fetchEnrolledStudents();
            } else {
                handleCloseInviteModal();
                await showError({
                    title: 'Error adding student(s)',
                    message: `Error: ${response.message}` || 'An error occured while deleting this student!',
                    confirmText: 'Cancel'
                });
            }
        } catch (err) {
            await showError({
                title: 'Error adding student(s)',
                message: `Error: ${err.message}` || 'An error occured while deleting this student!',
                confirmText: 'Cancel'
            });
        }
    };

    const handleRemoveStudent = async (studentId, studentName) => {
        const confirmed = await showConfirmation({
            title: 'Delete Student',
            message: 'Are you sure you want to delete this student?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'warning'
        });
        if (confirmed) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/group/removestudent`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `MonaEdu ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        groupid: courseId,
                        studentid: [studentId] 
                    })
                });

                if (!response.ok) {
                    const result = await response.json().catch(() => null);
                    throw new Error(result?.Message || 'Failed to remove student.');
                }
                
                await showSuccess({
                    title: 'Success',
                    message: `Successfully removed ${studentName}.`,
                    confirmText: 'Great!'
                });
                fetchEnrolledStudents(); 
            } catch (err) {
                await showError({
                    title: 'Error deleting student',
                    message: `Error: ${err.message}` || 'An error occured while deleting this student!',
                    confirmText: 'Cancel'
                });
            }
        }
    };

    const handleBulkRemove = async () => {
        const studentIds = Array.from(selectedStudents);
        if (studentIds.length === 0) return;

        const confirmed = await showConfirmation({
            title: 'Delete Students',
            message: 'Are you sure you want to delete these students?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'warning'
        });

        if (confirmed) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/group/removestudent`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `MonaEdu ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        groupid: courseId,
                        studentid: studentIds 
                    })
                });
                
                if (!response.ok) {
                    const result = await response.json().catch(() => null);
                    throw new Error(result?.Message || 'Failed to remove students.');
                }
                
                await showSuccess({
                    title: 'Success',
                    message: `Successfully removed ${studentIds.length} student(s).`,
                    confirmText: 'Great!'
                });
                setSelectedStudents(new Set());
                fetchEnrolledStudents();
            } catch (err) {
                await showError({
                    title: 'Error deleteing students',
                    message: `Error: ${err.message}` || 'An error occured while deleting these students!',
                    confirmText: 'Cancel'
                });
            }
        }
    };
    
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(new Set(enrolledStudents.map(s => s._id)));
        } else {
            setSelectedStudents(new Set());
        }
    };
    
    const handleSelectStudent = (studentId) => {
        const newSelection = new Set(selectedStudents);
        if (newSelection.has(studentId)) newSelection.delete(studentId);
        else newSelection.add(studentId);
        setSelectedStudents(newSelection);
    };

    if (loading) return <div>Loading students...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <>
            <div className="people-page">
                <section className="students-section">
                    <div className="people-section-header">
                        <h2>Students</h2>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <span>{enrolledStudents.length} students</span>
                            <button className="invite-btn" title="Invite students" onClick={handleOpenInviteModal}>
                                <InviteIcon />
                            </button>
                        </div>
                    </div>

                    <div className="action-bar">
                        <label className="table-checkbox-label">
                            <input type="checkbox" onChange={handleSelectAll} ref={el => { if (el) { el.checked = enrolledStudents.length > 0 && selectedStudents.size === enrolledStudents.length; el.indeterminate = selectedStudents.size > 0 && selectedStudents.size < enrolledStudents.length; }}} />
                            <span className="custom-checkbox"></span>
                        </label>

                        {/* --- HIGHLIGHT: New Actions Dropdown Button --- */}
                        {selectedStudents.size > 0 && (
                            <div className="actions-dropdown">
                                <button className="actions-dropdown-button" onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}>
                                    Actions <span>▼</span>
                                </button>
                                {isActionsMenuOpen && (
                                    <div className="actions-dropdown-menu">
                                        <button onClick={() => { handleBulkRemove(); setIsActionsMenuOpen(false); }}>Remove</button>
                                        {/* Add other future actions here */}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <ul className="student-list">
                        {enrolledStudents.map(student => (
                            <li key={student._id} className="student-list-item">
                                <label className="table-checkbox-label">
                                    <input type="checkbox" checked={selectedStudents.has(student._id)} onChange={() => handleSelectStudent(student._id)} />
                                    <span className="custom-checkbox centered"></span>
                                </label>
                                <div className="student-avatar">{student.firstName.charAt(0)}</div>
                                <span className="student-name">{student.firstName} {student.lastName}</span>
                                <button 
                                    className="card-menu-btn" 
                                    onClick={() => handleRemoveStudent(student._id, `${student.firstName} ${student.lastName}`)}
                                >
                                    <img src={Trash} width="20" length="20" alt="remove" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <Modal isOpen={isInviteModalOpen} onRequestClose={handleCloseInviteModal} className="form-modal invite-modal" overlayClassName="form-modal-overlay">
                <h2>Invite Students</h2>
                <div className="form-group">
                    <label>Select students to invite:</label>
                    <ul className="student-list">
                        {unassignedStudents.map(student => (
                            <li key={student._id} className="student-list-item">
                                <label className="table-checkbox-label">
                                    <input type="checkbox" checked={studentsToInvite.has(student._id)} onChange={() => {
                                        const newSet = new Set(studentsToInvite);
                                        if(newSet.has(student._id)) newSet.delete(student._id);
                                        else newSet.add(student._id);
                                        setStudentsToInvite(newSet);
                                    }}/>
                                    <span className="custom-checkbox"></span>
                                </label>
                                <span className="student-name left">{student.firstName} {student.lastName} ({student.email})</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={handleCloseInviteModal}>Cancel</button>
                    <button type="button" className="save-btn" onClick={handleAddSubmit}>Add</button>
                </div>
            </Modal>
        </>
    );
};

export default People;