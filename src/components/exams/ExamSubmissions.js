import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/assignmentSubmissions.css';
import Modal from 'react-modal';
import PDFAnnotationEditor from '../PDFAnnotationEditor/PDFAnnotationEditor';
const API_URL = process.env.REACT_APP_API_URL;

const ExamSubmissions = () => {
    const { groupId, examId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
    const [modalData, setModalData] = useState({ title: '', content: '' });

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedSubmissionForMarking, setSelectedSubmissionForMarking] = useState(null);

    // const [isViewerOpen, setIsViewerOpen] = useState(false);
    // const [selectedSubmissionForViewing, setSelectedSubmissionForViewing] = useState(null);

    const openNotesModal = (title, content) => {
        setModalData({ title, content });
        setIsNotesModalOpen(true);
    };
    const closeNotesModal = () => setIsNotesModalOpen(false);

const fetchExamAndSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(
            `${API_URL}/exams/student/submissions?groupId=${groupId}&examId=${examId}`,
            { headers: { 'Authorization': `MonaEdu ${token}` } }
        );
        const data = await response.json();
        if (data.message === "Student submission statuses fetched successfully") {
            setSubmissions(data.students);
        } else {
            throw new Error(data.message || 'Failed to fetch submissions');
        }
    } catch (err) {
        setError(err.message);
        console.log(err);
    } finally {
        setLoading(false);
    }
}, [examId, groupId]);

useEffect(() => {
    fetchExamAndSubmissions();
}, [fetchExamAndSubmissions]);

const getFilteredAndSortedSubmissions = () => {
    let filtered = [...submissions];
    
    // Apply status filter
    if (statusFilter !== 'all') {
    filtered = filtered.filter(sub => sub.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
    if (sortBy === 'name') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    } else if (sortBy === 'date') {
        const dateA = a.submittedAt || '';
        const dateB = b.submittedAt || '';
        return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
    }
    return 0;
    });

    return filtered;
};

const getSubmissionStats = () => {
    const total = submissions.length;
    const submitted = submissions.filter(sub => sub.status === 'submitted').length;
    const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
    return { total, submitted, percentage };
};

  // --- Functions for PDF Editor Modal ---

const handleOpenMarkEditor = async (studentId) => {
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(
            `${API_URL}/exams/submissions?examId=${examId}&studentId=${studentId}&groupId=${groupId}`,
            { headers: { 'authorization': `MonaEdu ${token}` } }
        );
        const data = await response.json();

        if (data.message === "Submissions fetched successfully." && data.data.length > 0) {
            const submission = data.data[0];
            if (submission.submissions[0].filePath) {
                setSelectedSubmissionForMarking(submission);
                setIsEditorOpen(true);
            } else {
                alert('No PDF file found for this submission.');
            }
        } else {
            alert('No submission found for this student.');
        }
    } catch (error) {
        console.error('Error in handleOpenMarkEditor: ', error);
        alert('Error fetching submission. Please try again.');
    }
};

const handleCloseMarkEditor = () => {
    setIsEditorOpen(false);
    setSelectedSubmissionForMarking(null);
};

const handleSaveSuccess = () => {
    handleCloseMarkEditor();
    fetchExamAndSubmissions();
};

if (loading) return <div className="loading">Loading submissions...</div>;
if (error) return <div className="error">{error}</div>;

const filteredSubmissions = getFilteredAndSortedSubmissions();
const stats = getSubmissionStats();

return (
    <div className="assignment-submissions-page">
    <div className="submissions-stats">
        <div className="stat-card">
        <h3>Submission Statistics</h3>
        <p>{stats.submitted} submitted out of {stats.total} total students</p>
        <p className="percentage">{stats.percentage}% submission rate</p>
        </div>
    </div>

    <div className="filters-section">
        <div className="filter-group">
        <label>Status:</label>
        <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
        >
            <option value="all">All</option>
            <option value="submitted">Submitted</option>
            <option value="not submitted">Not Submitted</option>
        </select>
        </div>

        <div className="filter-group">
        <label>Sort by:</label>
        <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
        >
            <option value="name">Name</option>
            <option value="date">Submission Date</option>
        </select>
        <button 
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
            {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
        </div>
    </div>

    <div className="submissions-table-container">
        <table className="submissions-table">
        <thead>
            <tr>
            <th>Student Name</th>
            <th>Status</th>
            <th>Submission Date</th>
            <th>Student Notes</th>
            <th>Feedback</th>
            <th>Grade</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {filteredSubmissions.map((student) => (
            <tr key={student._id}>
                <td>{student.firstName} {student.lastName}</td>
                <td>
                <span className={`status-badge ${student.status === 'submitted' ? 'submitted' : 'not-submitted'}`}>
                    {student.status}
                </span>
                </td>
                <td>{student.submittedAt ? new Date(student.submittedAt).toLocaleDateString() : '-'}</td>
                <td>
                    {student.notes ? (
                        <button className="view-notes-btn" onClick={() => openNotesModal('Student Notes', student.notes)}>View</button>
                    ) : ('-')}
                </td>
                <td>
                    {student.teacherFeedback ? (
                        <button className="view-notes-btn" onClick={() => openNotesModal('Teacher Feedback', student.teacherFeedback)}>View</button>
                    ) : ('-')}
                </td>
                <td>{student.score || '-'}</td>
                <td>
                <div className="action-buttons">
                    {/* <button 
                    className="view-btn"
                    onClick={() => handleViewSubmission(student._id)}
                    disabled={student.status !== 'submitted'}
                    >
                    View
                    </button> */}
                    <button 
                    className="mark-btn"
                    onClick={() => handleOpenMarkEditor(student._id)}
                    disabled={student.status !== 'submitted'}
                    >
                    Mark / View
                    </button>
                </div>
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>

    <Modal
        isOpen={isNotesModalOpen}
        onRequestClose={closeNotesModal}
        contentLabel="Submission Details"
        className="notes-modal"
        overlayClassName="notes-modal-overlay"
    >
        <div className="notes-modal-header">
            <h3>{modalData.title}</h3>
            <button className="close-modal-btn" onClick={closeNotesModal}>×</button>
        </div>
        <div className="notes-modal-body">
            <p>{modalData.content}</p>
        </div>
    </Modal>


    {/* --- PDF Editor Modal --- */}
    {selectedSubmissionForMarking && (
                <Modal
                    isOpen={isEditorOpen}
                    onRequestClose={handleCloseMarkEditor}
                    contentLabel="Mark Exam Submission PDF"
                    className="pdf-editor-modal"
                    overlayClassName="pdf-editor-modal-overlay"
                >
                    <div className="modal-header">
                        <h2>Marking: {selectedSubmissionForMarking.firstName} {selectedSubmissionForMarking.lastName}'s Submission</h2>
                        <button onClick={handleCloseMarkEditor} className="close-modal-btn">×</button>
                    </div>
                    <div className="modal-body">
                        <PDFAnnotationEditor
                            pdfUrl={selectedSubmissionForMarking.submissions[0].filePath}
                            submissionId={selectedSubmissionForMarking.submissions[0]._id}
                            initialAnnotationData={selectedSubmissionForMarking.submissions[0].annotationData}
                            initialScore={selectedSubmissionForMarking.submissions[0].score}
                            onSaveSuccess={handleSaveSuccess}
                            markType="exam" 
                        />
                    </div>
                </Modal>
            )}
            {/* {selectedSubmissionForViewing && (
                <Modal
                    isOpen={isViewerOpen}
                    onRequestClose={handleCloseViewer}
                    contentLabel="View Marked Submission"
                    className="pdf-viewer-modal" // Use a class for full-screen styling
                    overlayClassName="pdf-viewer-modal-overlay"
                >
                    <MarkedPDFViewer
                        pdfUrl={selectedSubmissionForViewing.filePath}
                        annotationData={selectedSubmissionForViewing.annotationData}
                    />
                </Modal>
            )} */}
    </div>
);
};

export default ExamSubmissions; 