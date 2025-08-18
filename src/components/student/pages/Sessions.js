import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config';
import '../../../styles/studentSessions.css';
import Modal from 'react-modal';
import PDFViewer from '../../PDFAnnotationEditor/PDFViewer'; 

// You can reuse icons from the teacher's section
import ExamIconSrc from '../../../icons/exams.svg';
import AssignmentIconSrc from '../../../icons/assignment.svg';
import MaterialIconSrc from '../../../icons/materials.svg';
import "../../../styles/materialViewer.css"

Modal.setAppElement('#root');

const StudentSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for the accordion functionality
    const [expandedSessionId, setExpandedSessionId] = useState(null);
    const [sessionContent, setSessionContent] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);

    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [pdfUrlToView, setPdfUrlToView] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [mobileModalView, setMobileModalView] = useState('info'); 

    useEffect(() => {
        const fetchStudentDataAndSessions = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');

                const profileRes = await fetch(`${API_URL}/student/profile`, {
                    headers: { 'Authorization': `MonaEdu ${token}` }
                });
                if (!profileRes.ok) throw new Error('Could not fetch student profile.');
                const profileData = await profileRes.json();
                const groupId = profileData.data?.groupId?._id;

                if (!groupId) throw new Error('Student is not assigned to a group.');
                const sessionsRes = await fetch(`${API_URL}/sections?groupId=${groupId}`, {
                    headers: { 'Authorization': `MonaEdu ${token}` }
                });
                if (!sessionsRes.ok) throw new Error('Could not fetch sessions for your group.');
                const sessionsData = await sessionsRes.json();
                
                setSessions(sessionsData.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDataAndSessions();
    }, []);

    const handleToggleSession = async (sessionId) => {
        if (expandedSessionId === sessionId) {
            setExpandedSessionId(null);
            setSessionContent([]);
            return;
        }

        setExpandedSessionId(sessionId);
        setContentLoading(true);
        setError(null); 

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/sections/${sessionId}`, {
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            if (!response.ok) throw new Error('Failed to load session content.');
            const data = await response.json();
            setSessionContent(data.data.content || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setContentLoading(false);
        }
    };
    
    const downloadAssignment = async (assignmentId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/assignments/download?assignmentId=${assignmentId}`, {
                method: 'GET',
                headers: { 'Authorization': `MonaEdu ${token}` }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                if (data.message && data.message.includes('This Assignment is not available at this time')) {
                    window.alert('This assignment is currently outside of its scheduled time.');
                } else {
                    window.alert(data.message || 'Failed to download assignment.');
                }
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `assignment-${assignmentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading assignment:', error);
            setError('Failed to download assignment');
        }
    };

    const downloadExam = async (examId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/exams/download?examId=${examId}`, { 
                method: 'GET',
                headers: { 'Authorization': `MonaEdu ${token}` }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                if (data.message && data.message.includes('This exam is not available at this time')) {
                    window.alert('This exam is currently outside of its scheduled time.');
                } else {
                    window.alert(data.message || 'Failed to download exam.');
                }
                return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `exam-${examId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading exam:', error);
            setError('Failed to download exam');
        }
    };

    const viewMaterial = async (materialId) => {
        setIsMaterialModalOpen(true);
        setModalLoading(true);
        setError(null);
        setMobileModalView('info');
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/material/${materialId}`, {
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch material details.');
            const data = await response.json();
            setSelectedMaterial(data);
            
            if (data.files && data.files.length > 0) {
                setPdfUrlToView(data.files[0].url);
            } else {
                setPdfUrlToView(''); 
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setModalLoading(false);
        }
    };
    
    const closeMaterialModal = () => {
        setIsMaterialModalOpen(false);
        setSelectedMaterial(null);
        setPdfUrlToView('');
    };

    const handleItemClick = (item) => {
        switch (item.type) {
            case 'material':
                viewMaterial(item.id);
                break;
            case 'assignment':
                downloadAssignment(item.id);
                break;
            case 'exam':
                downloadExam(item.id);
                break;
            default:
                alert('Unknown item type.');
        }
    };

    const getItemIcon = (type) => {
        switch (type) {
            case 'exam': return ExamIconSrc;
            case 'assignment': return AssignmentIconSrc;
            case 'material': return MaterialIconSrc;
            default: return MaterialIconSrc;
        }
    };

    if (loading) return <div className="loading">Loading your sessions...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <>
            <div className="sessions-student-page">
            <h1>Your Sessions</h1>
            {sessions.length > 0 ? (
                sessions.map(session => (
                    <div key={session._id} className="session-accordion">
                        <div 
                            className={`session-header ${expandedSessionId === session._id ? 'expanded' : ''}`}
                            onClick={() => handleToggleSession(session._id)}
                        >
                            <div className="session-header-title">
                                <h2>{session.name}</h2>
                                <p>{session.description}</p>
                            </div>
                            <span className="session-toggle-icon">▼</span>
                        </div>
                        {expandedSessionId === session._id && (
                            <div className="session-content">
                                {contentLoading ? <div className="loading">Loading content...</div> : (
                                    <ul className="session-content-list">
                                        {sessionContent.length > 0 ? sessionContent.map(item => (
                                            <li key={item.id} className="session-content-item">
                                                <div className="item-details">
                                                    <img src={getItemIcon(item.type)} alt={`${item.type} icon`} className="item-icon" />
                                                    <span className="item-name">{item.name}</span>
                                                </div>
                                                <button className="view-item-btn" onClick={() => handleItemClick(item)}>
                                                    {item.type === 'material' ? 'View' : 'Download'}
                                                </button>
                                            </li>
                                        )) : <p>No items linked to this session yet.</p>}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <p>No sessions have been assigned to your group yet.</p>
            )}
        </div>
        <Modal
                isOpen={isMaterialModalOpen} // or isMaterialModalOpen for StudentSessions
                onRequestClose={closeMaterialModal} // or closeMaterialModal for StudentSessions
                contentLabel="View Material"
                className="material-modal"
                overlayClassName="material-modal-overlay"
            >
                {modalLoading ? <div className="loading">Loading...</div> : (
                    selectedMaterial && (
                        <>
                            <div className="material-modal-header">
                                <h2>{selectedMaterial.name}</h2>
                                <button onClick={closeMaterialModal} className="close-modal-btn">×</button>
                            </div>
                            
                            <div className={`material-modal-body ${mobileModalView === 'pdf' ? 'view-pdf' : ''}`}>
                                <div className="content-sidebar">
                                    <p className="material-description">{selectedMaterial.description}</p>
                                    
                                    <div className="resource-section">
                                        <h3>Files</h3>
                                        {selectedMaterial.files && selectedMaterial.files.length > 0 ? (
                                            <ul className="resource-list">
                                                {selectedMaterial.files.map((file, idx) => (
                                                    <li key={idx} className="resource-item">
                                                        <button className={pdfUrlToView === file.url ? 'active' : ''} onClick={() => setPdfUrlToView(file.url)}>
                                                            {file.originalName || `File ${idx + 1}`}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="no-resources-message">No files provided.</p>}
                                    </div>

                                    <div className="resource-section">
                                        <h3>Links</h3>
                                        {selectedMaterial.Links && selectedMaterial.Links.length > 0 ? (
                                            <ul className="resource-list">
                                                {selectedMaterial.Links.map((link, idx) => (
                                                    <li key={idx} className="resource-item link-item">
                                                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="no-resources-message">No links provided.</p>}
                                    </div>
                                </div>
                                
                                <div className="pdf-viewer-main">
                                    {pdfUrlToView ? <PDFViewer pdfUrl={pdfUrlToView} /> : <div className="loading">No PDF to display.</div>}
                                </div>
                            </div>

                            <div className="mobile-view-switcher">
                                <button className={mobileModalView === 'info' ? 'active' : ''} onClick={() => setMobileModalView('info')}>Info</button>
                                <button className={mobileModalView === 'pdf' ? 'active' : ''} onClick={() => setMobileModalView('pdf')}>PDF Viewer</button>
                            </div>
                        </>
                    )
                )}
            </Modal>
        </>
    );
};

export default StudentSessions;