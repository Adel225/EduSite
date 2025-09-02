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
    import { AssignmentModal, ExamModal, MaterialModal } from './CreateModals';

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


    // Close create dropdown if click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (createMenuRef.current && !createMenuRef.current.contains(event.target))  setIsCreateMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
            `${API_URL}/sections?groupIds=${courseId}&page=${page}&size=${PAGE_SIZE}`,
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
                            <div className="dropdown" >
                                <button className="card-menu-btn">
                                    &#x22EE;
                                </button>
                            </div>
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
        </div>
    );
    };

    export default Classwork;
