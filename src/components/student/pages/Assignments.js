import React, { useState, useEffect } from 'react';
import '../../../styles/exams.css';
const API_URL = process.env.REACT_APP_API_URL;

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);
    const [submitStatus, setSubmitStatus] = useState('');
    const [loadingDownloads, setLoadingDownloads] = useState({});

    useEffect(() => {
        fetchAssignments();
    }, []);

    const isDeadlinePassed = (endDateString) => {
        if (!endDateString) {
            return false;
        }
        const deadline = new Date(endDateString);
        const now = new Date();
        return now > deadline;
    };

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/assignments/all`, {
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            });
            const data = await response.json();
            
            if (data.message === "Assignments fetched successfully") {
                setAssignments(data.assignments);
            } else {
                setError('Failed to fetch assignments');
            }
        } catch (err) {
            setError('Error loading assignments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAssignment || !file) {
            setSubmitStatus('Please select an assignment and upload a file');
            return;
        }

        setSubmitting(true);
        setSubmitStatus('');

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            // Create FormData and append all fields
            const formData = new FormData();
            formData.append('assignmentId', selectedAssignment);
            formData.append('notes', notes || '');
            formData.append('file', file);

            const response = await fetch(`${API_URL}/assignments/submit`, {
                method: 'POST',
                headers: {
                    'Authorization': `MonaEdu ${token}` 
                },
                body: formData
            });

            const data = await response.json();

            if (data.message === "Cannot submit because the deadline has passed.") {
                alert("Submission deadline has passed!");
                setSelectedAssignment('');
                setNotes('');
                setFile(null);
            }
            else if (data.message === "Assignment submitted successfully" || data.message === "Assignment submitted successfully.") {
                setSubmitStatus('Assignment submitted successfully');
                setSelectedAssignment('');
                setNotes('');
                setFile(null);
            } else if (data.message === "The submission window for your group is closed.") {
                alert("This assignment is not available yet!");
            }
            else {
                setError(data.message || 'Failed to submit Assignment');
                setSubmitStatus('');
            }
        } catch (err) {
            console.error('Error submitting assignment:', err);
            setError(err.message || 'Error submitting assignment');
            setSubmitStatus('');
        } finally {
            setSubmitting(false);
        }
    };

    const downloadAssignment = async (assignmentId) => {
        setLoadingDownloads(prev => ({ ...prev, [assignmentId]: true }));
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/assignments/download?assignmentId=${assignmentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            });

            if (!response.ok) {
                try {
                    const data = await response.json();
                    if (data && data.message && data.message.includes('This Assignment is not available at this time')) {
                        window.alert('This assignment is out of range');
                        return;
                    }
                    if (data && data.message) {
                        setError(data.message);
                    } else {
                        setError('Failed to download assignment');
                    }
                } catch (jsonErr) {
                    setError('Failed to download assignment');
                }
                throw new Error('Failed to download assignment');
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                if (data && data.message && data.message.includes('This Assignment is not available at this time')) {
                    window.alert('This Assignment is not available at this time');
                    return;
                }
                if (data && data.message) {
                    setError(data.message);
                    return;
                }
            }

            // Get the blob from the response
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
            alert(error.message);
        } finally {
            setLoadingDownloads(prev => ({ ...prev, [assignmentId]: false }));
        }
    };

    const downloadAnswerKey = async (assignmentId) => {
        const loadingKey = `${assignmentId}-answer`;
        setLoadingDownloads(prev => ({ ...prev, [loadingKey]: true }));
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/assignments/download-answer?assignmentId=${assignmentId}`, {
                method: 'GET',
                headers: { 'Authorization': `MonaEdu ${token}` }
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to download answer key.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `answer-key-${assignmentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading answer key:', error);
            alert(error.message);
        } finally {
            setLoadingDownloads(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No date set';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            // Format as "June 19, 2025, 10:15 AM" in UTC
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'UTC'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    if (loading) return <div className="loading">Loading assignments...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="exams-page">
            <div className="assignments-left">
                <h2>Available Assigments</h2>
                {assignments.length === 0 ? (
                    <div className="no-exams">No Assigments yet</div>
                ) : (
                    <div className="student-exams-list">
                        {assignments.map((assignment) => (
                            <div key={assignment._id} className="student-exam-card">
                                <h3>{assignment.name}</h3>
                                <p>{assignment.teacherNotes}</p>
                                <div className="student-exam-dates">
                                    <p>Start: {formatDate(assignment.startDate)}</p>
                                    <p>End: {formatDate(assignment.endDate)}</p>
                                </div>
                                <div className='exam-actions'>
                                    {isDeadlinePassed(assignment.endDate) && (
                                        <button className="action-btn view-answer-btn" onClick={() => downloadAnswerKey(assignment._id)} disabled={loadingDownloads[`${assignment._id}-answer`]}>
                                            {loadingDownloads[`${assignment._id}-answer`] ? <div className="loading-spinner-small"></div> : 'View Answers'}
                                        </button>
                                    )}
                                    <button 
                                        className="download-btn"
                                        onClick={() => downloadAssignment(assignment._id)}
                                        disabled={loadingDownloads[assignment._id]}
                                    >
                                        {loadingDownloads[assignment._id] ? <div className="loading-spinner-small"></div> : 'Download'}
                                    </button>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="assignments-right">
                <h2>Submit Assignment</h2>
                {error && <div className="error">{error}</div>}
                {submitStatus && <div className="submit-status">{submitStatus}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Assignment:</label>
                        <select 
                            value={selectedAssignment} 
                            onChange={(e) => setSelectedAssignment(e.target.value)}
                            required
                            disabled={submitting}
                        >
                            <option value="">Select an assignment</option>
                            {assignments.map((assignment) => (
                                <option key={assignment._id} value={assignment._id}>
                                    {assignment.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Notes:</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any notes here..."
                            disabled={submitting}
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Solution (PDF):</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={`submit-btn ${submitting ? 'loading' : ''}`}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                {/* <div className="loading-spinner"></div> */}
                                Uploading...
                            </>
                        ) : (
                            'Submit Assignment'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Assignments;