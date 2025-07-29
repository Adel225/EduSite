import React, { useState, useEffect } from 'react';
import '../../../styles/exams.css';
import { API_URL } from '../../../config';

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);
    const [submitStatus, setSubmitStatus] = useState('');

    useEffect(() => {
        fetchAssignments();
    }, []);

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

            // Log the form data for debugging
            console.log('Submitting assignment:', {
                assignmentId: selectedAssignment,
                notes: notes || '',
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            });

            const response = await fetch('https://backend-edu-site-5cnm.vercel.app/assignments/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `MonaEdu ${token}` 
                },
                body: formData
            });

            const data = await response.json();
            console.log('Server response:', data); // Log the server response

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
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            console.log('Download assignment: assignmentId =', assignmentId);
            const response = await fetch(`https://backend-edu-site-5cnm.vercel.app/assignments/download?assignmentId=${assignmentId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            });

            if (!response.ok) {
                try {
                    const data = await response.json();
                    console.log('Backend error response:', data);
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
                    console.log('Error parsing error response as JSON:', jsonErr);
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
            setError('Failed to download assignment');
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
            <div className="exams-list">
                <h2>Available Assigments</h2>
                {assignments.length === 0 ? (
                    <div className="no-exams">No Assigments yet</div>
                ) : (
                    <div className="exam-cards">
                        {assignments.map((assignment) => (
                            <div key={assignment._id} className="exam-card">
                                <h3>{assignment.name}</h3>
                                <div className="exam-dates">
                                    <p>Start: {formatDate(assignment.startDate)}</p>
                                    <p>End: {formatDate(assignment.endDate)}</p>
                                </div>
                                <button 
                                    className="download-btn"
                                    onClick={() => downloadAssignment(assignment._id)}
                                >
                                    Download Assignment
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="upload-exam">
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
                                <div className="loading-spinner"></div>
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