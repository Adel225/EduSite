import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { API_URL } from '../../config';
import '../../styles/assignmentSubmissions.css';
import Modal from 'react-modal';
import PDFAnnotationEditor from '../PDFAnnotationEditor/PDFAnnotationEditor';
// import MarkedPDFViewer from '../PDFAnnotationEditor/MarkedPDFViewer';

const ExamSubmissions = () => {
    const { groupId, examId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedSubmissionForMarking, setSelectedSubmissionForMarking] = useState(null);

    // const [isViewerOpen, setIsViewerOpen] = useState(false);
    // const [selectedSubmissionForViewing, setSelectedSubmissionForViewing] = useState(null);



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
    } finally {
        setLoading(false);
    }
}, [examId, groupId]);

useEffect(() => {
    fetchExamAndSubmissions();
}, [fetchExamAndSubmissions]);

// const handleViewSubmission = async (studentId) => {
//     try {
//         const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//         const response = await fetch(`${API_URL}/exams/submissions?examId=${examId}&groupId=${groupId}&studentId=${studentId}`, {
//                 headers: { 'Authorization': `MonaEdu ${token}` }
//             }
//         );
        
//         const data = await response.json();
        
//         if (data.message === "Submitted exams fetched successfully." && data.data.length > 0) {
//             const submission = data.data[0];
//             if (submission.filePath) {
//                 setSelectedSubmissionForViewing(submission);
//                 setIsViewerOpen(true);
//             } 
//             else {
//                 alert('No PDF file found for this submission.');
//             }
//         } else {
//             alert('No submission found for this student.');
//         }
//     } catch (error) {
//         console.error('Error fetching submission:', error);
//         alert('Error fetching submission. Please try again.');
//     }
// };

// const handleCloseViewer = () => {
//     setIsViewerOpen(false);
//     setSelectedSubmissionForViewing(null);
// };

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
        console.log("api call : " , `${API_URL}/exams/submissions?examId=${examId}&groupId=${groupId}&studentId=${studentId}`)
        console.log(data);

        if (data.message === "Student submission statuses fetched successfully." && data.data.length > 0) {
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
                <td>{student.notes || '-'}</td>
                <td>{student.teacherFeedback || '-'}</td>
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
                        <h2>Marking: {selectedSubmissionForMarking.studentId.firstName} {selectedSubmissionForMarking.studentId.lastName}'s Submission</h2>
                        <button onClick={handleCloseMarkEditor} className="close-modal-btn">×</button>
                    </div>
                    <div className="modal-body">
                        <PDFAnnotationEditor
                            pdfUrl={selectedSubmissionForMarking.filePath}
                            submissionId={selectedSubmissionForMarking._id}
                            initialAnnotationData={selectedSubmissionForMarking.annotationData}
                            initialScore={selectedSubmissionForMarking.score}
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