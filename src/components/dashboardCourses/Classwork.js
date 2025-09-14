    // src/components/courses/Classwork.js
    import React, { useState, useEffect, useRef, useCallback } from 'react';
    import { useParams, useNavigate } from 'react-router-dom';
    import Modal from 'react-modal';
    import '../../styles/classwork.css';
    import AssignmentIcon from "../../icons/assignment.svg";
    import ExamIcon from "../../icons/exams.svg";
    import MaterialIcon from "../../icons/materials.svg";
    import TopicIcon from "../../icons/session.svg";
    import Trash from "../../icons/trash.svg";
    import EditIcon from "../../icons/pencil.svg";
    import { AssignmentModal, ExamModal, MaterialModal } from './CreateModals';
    import { useConfirmation } from '../../utils/ConfirmationModal';

    const API_URL = process.env.REACT_APP_API_URL;

    // Placeholder PlusIcon
    const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    );

    const PAGE_SIZE = 5;

    const Classwork = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
    const createMenuRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState('');
    const { showError } = useConfirmation();
    const { showConfirmation } = useConfirmation();
    const { showSuccess } = useConfirmation();

    const [topics, setTopics] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTopics, setTotalTopics] = useState(0);
    const [hasMoreTopics, setHasMoreTopics] = useState(true);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const [expandedTopic, setExpandedTopic] = useState(null);
    const [topicContents, setTopicContents] = useState({});
    const [contentLoading, setContentLoading] = useState(false);

    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [topicFormData, setTopicFormData] = useState({ name: '', description: '' });
    const [topicSubmitStatus, setTopicSubmitStatus] = useState('');

    // Modal states for creating assignments, exams, and materials
    const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
    const [isExamModalOpen, setIsExamModalOpen] = useState(false);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

    // Edit modal states
const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);

const [examCurrentEditItem, setExamCurrentEditItem] = useState(null);
const [assignmentCurrentEditItem, setAssignmentCurrentEditItem] = useState(null);
// State specifically for the Assignment Edit form
const [assignmentEditData, setAssignmentEditData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    file: null,
    answerFile: null,
    allowSubmissionsAfterDueDate: false,
    description : ''
});

// State specifically for the Exam Edit form
const [examEditData, setExamEditData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    file: null,
    allowSubmissionsAfterDueDate: false
});
const [editSubmitStatus, setEditSubmitStatus] = useState('');
const [editError, setEditError] = useState('');


    // Close create dropdown if click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (createMenuRef.current && !createMenuRef.current.contains(event.target))  setIsCreateMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Utility function to convert date to datetime-local format
    const toDatetimeLocal = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    };

    // Fetch topics (page) — append when append=true
    const fetchTopics = async (page = 1, append = false) => {
        if (!courseId) return;
        if (!append) {
        setLoading(true);
        setError(null);
        } else {
        setLoadingMore(true);
        }

        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(
            `${API_URL}/sections?groupId=${courseId}&page=${page}&size=${PAGE_SIZE}`,
            {
            headers: { 'Authorization': `MonaEdu ${token}` }
            }
        );

        if (!response.ok) {
            // Try to parse message for better error output
            let errorText = `Failed to fetch topics (status ${response.status})`;
            try {
            const tmp = await response.json();
            if (tmp && tmp.message) errorText = tmp.message;
            } catch (e) {}
            throw new Error(errorText);
        }

        const data = await response.json();
        if (data.message === "Sections fetched successfully") {
            const newTopics = data.data || [];
            const fetchedTotal = data.total ?? 0;
            const fetchedTotalPages = data.totalPages ?? 1;
            const fetchedCurrentPage = data.currentPage ?? page;

            if (append) {
            setTopics(prevTopics => [...prevTopics, ...newTopics]);
            } else {
            setTopics(newTopics);
            }

            setCurrentPage(fetchedCurrentPage);
            setTotalPages(fetchedTotalPages);
            setTotalTopics(fetchedTotal);
            setHasMoreTopics(fetchedCurrentPage < fetchedTotalPages);

        } else {
            throw new Error(data.message || "Could not parse topics.");
        }
        } catch (err) {
        setError(err.message);
        if (!append) {
            setTopics([]);
        }
        } finally {
        setLoading(false);
        setLoadingMore(false);
        }
    };

    const loadMoreTopics = useCallback(() => {
        if (loadingMore || !hasMoreTopics || currentPage >= totalPages) return;
        fetchTopics(currentPage + 1, true);
    }, [loadingMore, hasMoreTopics, currentPage, totalPages]);

    const handleToggleTopic = async (topicId) => {
        if (expandedTopic === topicId) {
        setExpandedTopic(null);
        setTopicContents(prev => ({ ...prev, [topicId]: [] }));
        return;
        }

        setExpandedTopic(topicId);
        setContentLoading(true);
        setError(null);

        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/sections/${topicId}`, {
            headers: { 'Authorization': `MonaEdu ${token}` }
        });
        if (!response.ok) throw new Error("Failed to load topic content.");

        const data = await response.json();
        console.log(data.data.content );
        if (data.message === "Section content fetched successfully.") {
            setTopicContents(prev => ({ ...prev, [topicId]: data.data.content || [] }));
        } else {
            throw new Error(data.message || "Could not parse topic content.");
        }
        } catch (err) {
        setError(err.message);
        } finally {
        setContentLoading(false);
        }
    };

    useEffect(() => {
        setTopics([]);
        setCurrentPage(1);
        setTotalPages(1);
        setTotalTopics(0);
        setHasMoreTopics(true);
        setExpandedTopic(null);
        setTopicContents({});
        fetchTopics(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const handleDelete = async (sessionIdToDelete) => {
        if (!window.confirm('Are you sure you want to delete this session?')) return;
        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/sections/${sessionIdToDelete}`, {
            method: 'DELETE',
            headers: {
            'Authorization': `MonaEdu ${token}`,
            },
        });

        if (!response.ok) {
            let errText = `Failed to delete (status ${response.status})`;
            try {
                const tmp = await response.json();
            if (tmp && tmp.message) errText = tmp.message;
            } catch (e) {}
            throw new Error(errText);
        }

        setTopics(prevTopics => prevTopics.filter(topic => topic._id !== sessionIdToDelete));
        setTotalTopics(prev => Math.max(0, prev - 1));

        if (expandedTopic === sessionIdToDelete) {
            setExpandedTopic(null);
        }

        setTopicContents(prev => {
            const updated = { ...prev };
            delete updated[sessionIdToDelete];
            return updated;
        });

        } catch (err) {
        console.error('Error deleting session:', err);
        alert('An error occurred while deleting the session.');
        }
    };

    const handleOpenTopicModal = () => {
        setIsCreateMenuOpen(false);
        setTopicFormData({ name: '', description: '' });
        setTopicSubmitStatus('');
        setIsTopicModalOpen(true);
    };

    const handleCloseTopicModal = () => {
        setIsTopicModalOpen(false);
    };

    // Handlers for opening assignment, exam, and material modals
    const handleOpenAssignmentModal = () => {
        setIsCreateMenuOpen(false);
        setIsAssignmentModalOpen(true);
    };

    const handleOpenExamModal = () => {
        setIsCreateMenuOpen(false);
        setIsExamModalOpen(true);
    };

    const handleOpenMaterialModal = () => {
        setIsCreateMenuOpen(false);
        setIsMaterialModalOpen(true);
    };

    // Success callback to refresh topics after creation
    const handleCreationSuccess = () => {
        fetchTopics(1, false);
    };

    // Handle clicking on assignments and exams to navigate to their submissions pages
    const handleAssignmentClick = (assignmentId) => {
        navigate(`/dashboard/assignments/${courseId}/assignment/${assignmentId}`);
    };

    const handleExamClick = (examId) => {
        navigate(`/dashboard/exams/${courseId}/exam/${examId}`);
    };

    const handleTopicSubmit = async (e) => {
        e.preventDefault();
        if (!topicFormData.name) {
        setTopicSubmitStatus('Topic name is required.');
        return;
        }
        setTopicSubmitStatus('Creating topic...');

        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const topicData = {
            name: topicFormData.name,
            description: topicFormData.description,
            groupIds: [courseId]
        };

        const response = await fetch(`${API_URL}/sections/create`, {
            method: 'POST',
            headers: {
            'Authorization': `MonaEdu ${token}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(topicData)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to create topic');

        if (result.message === "Section container created successfully.") {
            setTopicSubmitStatus('Topic created successfully!');
            const newTopic = result.data;
            setTopics(prevTopics => [newTopic, ...prevTopics]);
            setTotalTopics(prev => prev + 1);
            setTimeout(handleCloseTopicModal, 1000);
        } else {
            throw new Error('Unexpected response from server');
        }
        } catch (err) {
        setTopicSubmitStatus(`Error: ${err.message}`);
        }
    };

    // Assignment/Exam Edit Handlers
    const handleEditAssignment = (assignment) => {
        // console.log(assignment)
        setAssignmentCurrentEditItem(assignment);
        setAssignmentEditData({
            name: assignment.name ,
            startDate: toDatetimeLocal(assignment.startDate || assignment.startdate),
            endDate: toDatetimeLocal(assignment.endDate || assignment.enddate),
            file: null,
            answerFile: null,
            description : assignment.teacherNotes,
            allowSubmissionsAfterDueDate: assignment.allowSubmissionsAfterDueDate || false
        });
        setEditSubmitStatus('');
        setEditError('');
        setIsEditAssignmentModalOpen(true);
    };

    const handleEditExam = (exam) => {
        setExamCurrentEditItem(exam);
        setExamEditData({
            name: exam.name || exam.Name || '',
            startDate: toDatetimeLocal(exam.startDate || exam.startdate),
            endDate: toDatetimeLocal(exam.endDate || exam.enddate),
            file: null,
            allowSubmissionsAfterDueDate: exam.allowSubmissionsAfterDueDate || false
        });
        setEditSubmitStatus('');
        setEditError('');
        setIsEditExamModalOpen(true);
    };


    const handleEditAssignmentSubmit = async (e) => {
        e.preventDefault();
        setEditSubmitStatus('Updating assignment...');
        setEditError('');
    
        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const formDataToSend = new FormData();
    
        // use whichever id exists (._id or .id)
        const assignmentIdToSend = assignmentCurrentEditItem._id ?? assignmentCurrentEditItem.id;
        formDataToSend.append('assignmentId', assignmentIdToSend);
    
        formDataToSend.append('name', assignmentEditData.name);
        formDataToSend.append('teacherNotes', assignmentEditData.description);
        formDataToSend.append('startDate', assignmentEditData.startDate);
        formDataToSend.append('endDate', assignmentEditData.endDate);
        formDataToSend.append('allowSubmissionsAfterDueDate', assignmentEditData.allowSubmissionsAfterDueDate);
    
        if (assignmentEditData.file) {
            formDataToSend.append('file', assignmentEditData.file);
        }
        if (assignmentEditData.answerFile) {
            formDataToSend.append('answerFile', assignmentEditData.answerFile);
        }
    
        const response = await fetch(`${API_URL}/assignments/edit`, {
            method: 'PUT',
            headers: { 'Authorization': `MonaEdu ${token}` },
            body: formDataToSend,
        });
    
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update assignment');
    
        setEditSubmitStatus('Assignment updated successfully!');
    
        // --- robust local update: match by either _id or id and update item fields ---
        setTopicContents(prevContents => {
            const newContents = {};
            const editedId = assignmentCurrentEditItem._id ?? assignmentCurrentEditItem.id;
    
            Object.keys(prevContents).forEach(topicId => {
            newContents[topicId] = prevContents[topicId].map(item => {
                const candidateIds = [item._id, item.id].filter(Boolean);
                if (candidateIds.includes(editedId)) {
                // update common fields so UI reflects changes immediately
                return {
                    ...item,
                    name: assignmentEditData.name,
                    startDate: assignmentEditData.startDate ?? item.startDate,
                    endDate: assignmentEditData.endDate ?? item.endDate,
                    allowSubmissionsAfterDueDate: assignmentEditData.allowSubmissionsAfterDueDate ?? item.allowSubmissionsAfterDueDate
                };
                }
                return item;
            });
            });
    
            return newContents;
        });
    
        setTimeout(() => setIsEditAssignmentModalOpen(false), 1500);
        } catch (err) {
        setEditError(err.message || 'Error updating assignment.');
        setEditSubmitStatus('');
        }
    };

    const handleEditExamSubmit = async (e) => {
        e.preventDefault();
        setEditSubmitStatus('Updating exam...');
        setEditError('');
    
        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const formDataToSend = new FormData();
    
        // use whichever id exists (._id or .id)
        const examIdToSend = examCurrentEditItem._id ?? examCurrentEditItem.id;
        formDataToSend.append('examId', examIdToSend);
    
        formDataToSend.append('Name', examEditData.name);
        formDataToSend.append('startdate', examEditData.startDate);
        formDataToSend.append('enddate', examEditData.endDate);
        formDataToSend.append('allowSubmissionsAfterDueDate', examEditData.allowSubmissionsAfterDueDate);
        formDataToSend.append('groupIds', courseId);
    
        if (examEditData.file) {
            formDataToSend.append('file', examEditData.file);
        }
    
        const response = await fetch(`${API_URL}/exams/edit`, {
            method: 'PUT',
            headers: { 'Authorization': `MonaEdu ${token}` },
            body: formDataToSend,
        });
    
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update exam');
    
        setEditSubmitStatus('Exam updated successfully!');
    
        // --- robust local update: match by either _id or id and update item fields ---
        setTopicContents(prevContents => {
            const newContents = {};
            const editedId = examCurrentEditItem._id ?? examCurrentEditItem.id;
        
            Object.keys(prevContents).forEach(topicId => {
            newContents[topicId] = prevContents[topicId].map(item => {
                const candidateIds = [item._id, item.id].filter(Boolean);
                if (candidateIds.includes(editedId)) {
                return {
                    ...item,
                    // Update both versions of each field so UI reflects changes immediately
                    Name: examEditData.name,
                    name: examEditData.name,
                    startdate: examEditData.startDate ?? item.startdate,
                    startDate: examEditData.startDate ?? item.startDate,
                    enddate: examEditData.endDate ?? item.enddate,
                    endDate: examEditData.endDate ?? item.endDate,
                    allowSubmissionsAfterDueDate:
                    examEditData.allowSubmissionsAfterDueDate ?? item.allowSubmissionsAfterDueDate
                };
                }
                return item;
            });
            });
        
            return newContents;
        });
    
        setTimeout(() => setIsEditExamModalOpen(false), 1500);
        } catch (err) {
        setEditError(err.message || 'Error updating exam.');
        setEditSubmitStatus('');
        }
    };

    // Delete Handlers
    const handleDeleteAssignment = async (assignment) => {
        const confirmed = await showConfirmation({
            title: 'Delete Assignment',
            message: 'Are you sure you want to delete this assignment?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });
        
        if (confirmed) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/assignments/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `MonaEdu ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ assignmentId: assignment.id }),
                });
                
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to delete assignment');
    
                // Update local state
                setTopicContents(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(topicId => {
                        updated[topicId] = updated[topicId].filter(item => item.id !== assignment.id);
                    });
                    return updated;
                });
                
                await showSuccess({
                    title: 'Success',
                    message: `Successfully deleted the assignment`,
                    confirmText: 'Great!'
                });
            } catch (err) {
                await showError({
                    title: 'Error ',
                    message: `Error: ${err.message}` || 'An error occurred while deleting.',
                    confirmText: 'Cancel'
                });
            }
        }
    };

    const handleDeleteExam = async (exam) => {
        const confirmed = await showConfirmation({
            title: 'Delete Assignment',
            message: 'Are you sure you want to delete this exam?',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });
        
        if (confirmed) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/exams/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `MonaEdu ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ examId: exam.id }),
                });
                
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Failed to delete exam');
    
                // Update local state
                setTopicContents(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(topicId => {
                        updated[topicId] = updated[topicId].filter(item => item.id !== exam.id);
                    });
                    return updated;
                });
                
                await showSuccess({
                    title: 'Success',
                    message: `Successfully deleted the exam`,
                    confirmText: 'Great!'
                });
            } catch (err) {
                await showError({
                    title: 'Error ',
                    message: `Error: ${err.message}` || 'An error occurred while deleting.',
                    confirmText: 'Cancel'
                });
            }
        }
    };

    const getItemIcon = (type) => {
        switch(type) {
        case 'assignment': return <img src={AssignmentIcon} width="20" height="20" alt="Assignment" />;
        case 'exam': return <img src={ExamIcon} width="20" height="20" alt="Exam" />;
        case 'material': return <img src={MaterialIcon} width="20" height="20" alt="Material" />;
        default: return <img src={TopicIcon} width="20" height="20" alt="Topic" />;
        }
    };

    // filtered topics by search term
    const filteredTopics = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="classwork-page">
        <div className="classwork-header" ref={createMenuRef}>
            <button className="create-btn" onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}>
                <PlusIcon /> Create
            </button>

            {isCreateMenuOpen && (
            <div className="create-dropdown">
                <button onClick={handleOpenAssignmentModal}>
                    <img src={AssignmentIcon} width="20" height="20" alt="Assignment" /> Assignment
                </button>
                <button onClick={handleOpenExamModal}>
                    <img src={ExamIcon} width="20" height="20" alt="Exam" /> Exam
                </button>
                <button onClick={handleOpenMaterialModal}>
                    <img src={MaterialIcon} width="20" height="20" alt="Material" /> Material
                </button>
                <hr style={{margin: '0.5rem 0', borderTop: '1px solid #eee', borderBottom: 'none'}}/>
                <button onClick={handleOpenTopicModal}>
                    <img src={TopicIcon} width="20" height="20" alt="Topic" /> Topic
                </button>
            </div>
            )}
        </div>

        <div className="search-bar-container">
            <input
            type="text"
            className="classwork-search-input"
            placeholder="Search for a topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="classwork-content">
            {loading ? <p>Loading topics...</p> : error ? <div className="error">{error}</div> : topics.length > 0 ? (
            filteredTopics.map((topic) => (
                <div key={topic._id} className="topic-card">
                <div className="topic-header" onClick={() => handleToggleTopic(topic._id)}>
                    <div className="topic-title">
                    <h2>{topic.name}</h2>
                    {topic.description && <p className="topic-description">{topic.description}</p>}
                    </div>
                    <button
                    className="delete-btn1"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(topic._id);
                    }}
                    title="Delete topic"
                    >
                    <img src={Trash} width="20" height="20" alt="Delete"/>
                    </button>
                </div>

                <div className={`topic-content ${expandedTopic === topic._id ? 'expanded' : ''}`}>
                    {contentLoading && expandedTopic === topic._id && (
                    <p className="loading-placeholder">Loading content...</p>
                    )}

                    {topicContents[topic._id] && topicContents[topic._id].map(item => (
                    <div key={item._id} className="classwork-item">
                        <div 
                            className={`classwork-item-info ${(item.type === 'assignment' || item.type === 'exam') ? 'clickable' : ''}`}
                            onClick={() => {
                                if (item.type === 'assignment') {
                                    handleAssignmentClick(item.id);
                                } else if (item.type === 'exam') {
                                    handleExamClick(item.id);
                                }
                            }}
                        >
                        <div className={`classwork-item-icon type-${item.type}`}>
                            {getItemIcon(item.type)}
                        </div>
                        <span className="classwork-item-name">{item.name || item.Name}</span>
                        {(item.type === 'assignment' || item.type === 'exam') && (
                            <span className="clickable-indicator">→</span>
                        )}
                        </div>

                        <div className="classwork-item-actions">
                            {(item.type === 'assignment' || item.type === 'exam') && (
                                <>
                                    <button 
                                        className="edit-btn space-right"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.type === 'assignment')  handleEditAssignment(item);
                                            else if (item.type === 'exam') handleEditExam(item);
                                        }}
                                        title={`Edit ${item.type}`}
                                    >
                                        <img src={EditIcon} width="16" height="16" alt="Edit"/>
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.type === 'assignment') handleDeleteAssignment(item);
                                            else if (item.type === 'exam') handleDeleteExam(item);
                                        }}
                                        title={`Delete ${item.type}`}
                                    >
                                        <img src={Trash} width="16" height="16" alt="Delete"/>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            ))
            ) : (
            <p>No topics have been created for this course yet.</p>
            )}

            {/* ----- Load More area ----- */}
            {!loading && topics.length > 0 && (
            <div className="load-more-container">
                {hasMoreTopics ? (
                <button
                    className="load-more-btn"
                    onClick={loadMoreTopics}
                    disabled={loadingMore}
                >
                    {loadingMore ? 'Loading...' : 'Load more'} 
                </button>
                ) : (
                <p className="no-more-topics">No more topics.</p>
                )}
            </div>
            )}
        </div>

        <Modal
            isOpen={isTopicModalOpen}
            onRequestClose={handleCloseTopicModal}
            contentLabel="Create New Topic"
            className="form-modal"
            overlayClassName="form-modal-overlay"
        >
            <h2>Create Topic</h2>
            <form onSubmit={handleTopicSubmit}>
            <div className="form-group">
                <label>Topic Name</label>
                <input
                type="text"
                value={topicFormData.name}
                onChange={(e) => setTopicFormData({...topicFormData, name: e.target.value})}
                placeholder="e.g., Unit 1: Algebra"
                required
                />
            </div>
            <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                value={topicFormData.description}
                onChange={(e) => setTopicFormData({...topicFormData, description: e.target.value})}
                placeholder="Add a brief description for this topic"
                />
            </div>

            {topicSubmitStatus && <p className="submit-status">{topicSubmitStatus}</p>}

            <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseTopicModal}>Cancel</button>
                <button type="submit" disabled={topicSubmitStatus.includes('Creating...')}>
                {topicSubmitStatus.includes('Creating...') ? 'Creating...' : 'Create'}
                </button>
            </div>
            </form>
        </Modal>

        {/* Assignment Creation Modal */}
        <AssignmentModal
            isOpen={isAssignmentModalOpen}
            onClose={() => setIsAssignmentModalOpen(false)}
            courseId={courseId}
            onSuccess={handleCreationSuccess}
        />

        {/* Exam Creation Modal */}
        <ExamModal
            isOpen={isExamModalOpen}
            onClose={() => setIsExamModalOpen(false)}
            courseId={courseId}
            onSuccess={handleCreationSuccess}
        />

        {/* Material Creation Modal */}
        <MaterialModal
            isOpen={isMaterialModalOpen}
            onClose={() => setIsMaterialModalOpen(false)}
            courseId={courseId}
            onSuccess={handleCreationSuccess}
        />

        {/* Edit Assignment Modal */}
            <Modal
                isOpen={isEditAssignmentModalOpen}
                onRequestClose={() => setIsEditAssignmentModalOpen(false)}
                contentLabel="Edit Assignment"
                className="form-modal"
                overlayClassName="form-modal-overlay"
            >
                <div className="modal-header">
                    <h2>Edit Assignment</h2>
                    <button onClick={() => setIsEditAssignmentModalOpen(false)} className="close-modal-btn">×</button>
                </div>
                
                <form onSubmit={handleEditAssignmentSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Assignment Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={assignmentEditData.name}
                            onChange={(e) => setAssignmentEditData({...assignmentEditData, name: e.target.value})}
                            placeholder="Enter assignment name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={assignmentEditData.description}
                            onChange={(e) => setAssignmentEditData({...assignmentEditData, description: e.target.value})}
                            placeholder="Edit assignment description"
                        />
                    </div>

                    <div className="form-group">
                        <label>Assignment File (PDF) - Optional</label>
                        <input
                            type="file"
                            name="file"
                            accept=".pdf"
                            onChange={(e) => setAssignmentEditData({...assignmentEditData, file: e.target.files[0]})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Answer File (PDF) - Optional</label>
                        <input
                            type="file"
                            name="answerFile"
                            accept=".pdf"
                            onChange={(e) => setAssignmentEditData({...assignmentEditData, answerFile: e.target.files[0]})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Date & Time *</label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={assignmentEditData.startDate}
                            onChange={(e) => setAssignmentEditData({...assignmentEditData, startDate: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>End Date & Time *</label>
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={assignmentEditData.endDate}
                            onChange={(e) => setAssignmentEditData({...assignmentEditData, endDate: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="allowSubmissionsAfterDueDate"
                                checked={assignmentEditData.allowSubmissionsAfterDueDate}
                                onChange={(e) => setAssignmentEditData({...assignmentEditData, allowSubmissionsAfterDueDate: e.target.checked})}
                                style={{ marginRight: '0.5rem' }} /* Adds space between box and text */
                            />
                            Allow submissions after due date
                        </label>
                    </div>

                    {editError && <div className="error-message">{editError}</div>}
                    {editSubmitStatus && <div className="submit-status">{editSubmitStatus}</div>}

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => setIsEditAssignmentModalOpen(false)}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={editSubmitStatus && editSubmitStatus !== ''}
                        >
                            {editSubmitStatus && editSubmitStatus !== '' ? editSubmitStatus : 'Update Assignment'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Exam Modal */}
            <Modal
                isOpen={isEditExamModalOpen}
                onRequestClose={() => setIsEditExamModalOpen(false)}
                contentLabel="Edit Exam"
                className="form-modal"
                overlayClassName="form-modal-overlay"
            >
                <div className="modal-header">
                    <h2>Edit Exam</h2>
                    <button onClick={() => setIsEditExamModalOpen(false)} className="close-modal-btn">×</button>
                </div>
                
                <form onSubmit={handleEditExamSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Exam Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={examEditData.name}
                            onChange={(e) => setExamEditData({...examEditData, name: e.target.value})}
                            placeholder="Enter exam name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Exam File (PDF) - Optional</label>
                        <input
                            type="file"
                            name="file"
                            accept=".pdf"
                            onChange={(e) => setExamEditData({...examEditData, file: e.target.files[0]})}
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Date & Time *</label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={examEditData.startDate}
                            onChange={(e) => setExamEditData({...examEditData, startDate: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>End Date & Time *</label>
                        <input
                            type="datetime-local"
                            name="endDate"
                            value={examEditData.endDate}
                            onChange={(e) => setExamEditData({...examEditData, endDate: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label>
                            <input
                                type="checkbox"
                                name="allowSubmissionsAfterDueDate"
                                checked={examEditData.allowSubmissionsAfterDueDate}
                                onChange={(e) => setExamEditData({...examEditData, allowSubmissionsAfterDueDate: e.target.checked})}
                                style={{ marginRight: '0.5rem' }} /* Adds space between box and text */
                            />
                            Allow submissions after due date
                        </label>
                    </div>

                    {editError && <div className="error-message">{editError}</div>}
                    {editSubmitStatus && <div className="submit-status">{editSubmitStatus}</div>}

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => setIsEditExamModalOpen(false)}>
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={editSubmitStatus && editSubmitStatus !== ''}
                        >
                            {editSubmitStatus && editSubmitStatus !== '' ? editSubmitStatus : 'Update Exam'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
    };

    export default Classwork;
