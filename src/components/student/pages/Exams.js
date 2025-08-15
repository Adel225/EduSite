import React, { useState, useEffect } from 'react';
import '../../../styles/exams.css';

const Exams = () => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [selectedExam, setSelectedExam] = useState('');
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);
    const [submitStatus, setSubmitStatus] = useState('');

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch('https://backend-edu-site-5cnm.vercel.app/exams', {
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            });
            const data = await response.json();
            console.log(data);
            
            if (data.message === "Exams fetched successfully") {
                setExams(data.data);
            } else {
                setError('Failed to fetch exams');
            }
        } catch (err) {
            setError('Error loading exams');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedExam || !file) {
            setSubmitStatus('Please select an exam and upload a file');
            return;
        }

        setSubmitting(true);
        setSubmitStatus('');

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            
            // Create FormData and append all fields
            const formData = new FormData();
            formData.append('examId', selectedExam);
            formData.append('notes', notes);
            formData.append('file', file);  // This will maintain the file's name and type automatically
            console.log(formData);
            const response = await fetch('https://backend-edu-site-5cnm.vercel.app/exams/submit', {
                method: 'POST',
                headers: {
                    'Authorization': `MonaEdu ${token}`
                    // Don't set Content-Type - browser will set it automatically with boundary
                },
                body: formData
            });

            const data = await response.json();
            if (data.message === "Cannot submit because the submission deadline has passed.") {
                alert("Submission deadline has passed!");
                setSelectedExam('');
                setNotes('');
                setFile(null);
            }
            else if (data.message === "Exam submitted successfully.") {
                setSubmitStatus('Exam submitted successfully');
                setSelectedExam('');
                setNotes('');
                setFile(null);
            } else if (data.message === "Exam submission window is closed.") {
                alert("This exam is not available yet!");
            }
            else {
                setError('Failed to submit exam');
            }
        } catch (err) {
            console.error('Error submitting exam:', err);
            setSubmitStatus('Error submitting exam');
        } finally {
            setSubmitting(false);
        }
    };

    const downloadExam = async (examId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            console.log('Download exam: examId =', examId);
            const response = await fetch(`https://backend-edu-site-5cnm.vercel.app/exams/download?examId=${examId}`, {
                method: 'GET',
                headers: {
                    'authorization': `MonaEdu ${token}`
                }
            });
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                // Try to parse JSON error message
                try {
                    const data = await response.json();
                    console.log('Backend error response:', data);
                    if (data && data.message) {
                        setError(data.message);
                    } else {
                        setError('Failed to download exam');
                    }
                } catch (jsonErr) {
                    console.log('Error parsing error response as JSON:', jsonErr);
                    setError('Failed to download exam');
                }
                throw new Error('Failed to download exam');
            }

            // Check for JSON error in a 200 response (edge case)
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('Backend JSON response (200):', data);
                if (data && data.message && data.message.includes('This exam is not available at this time')) {
                    window.alert('This Exam is not available at this time');
                    return;
                }
                if (data && data.message) {
                    setError(data.message);
                    return;
                }
            }

            // Get the blob from the response
            const blob = await response.blob();
            console.log('Blob:', blob);
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            // Create a temporary link element
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

    if (loading) return <div className="loading">Loading exams...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="exams-page">
            <div className="exams-left">
                <h2>Available Exams</h2>
                {exams.length === 0 ? (
                    <div className="no-exams">No Exams yet</div>
                ) : (
                    <div className="student-exams-list">
                        {exams.map((exam) => (
                            <div key={exam._id} className="student-exam-card">
                            <h3>{exam.Name}</h3>
                            <div className="student-exam-dates">
                                    <p>Start: {formatDate(exam.startdate)}</p>
                                    <p>End: {formatDate(exam.enddate)}</p>
                                </div>
                            <div className="exam-actions">
                                <button 
                                    className="download-btn"
                                    onClick={() => downloadExam(exam._id)}
                                >
                                    Download
                                </button>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="exams-right">
                <h2>Submit Exam</h2>
                {submitStatus && <div className="submit-status">{submitStatus}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Exam:</label>
                        <select 
                            value={selectedExam} 
                            onChange={(e) => setSelectedExam(e.target.value)}
                            required
                            disabled={submitting}
                        >
                            <option value="">Select an exam</option>
                            {exams.map((exam) => (
                                <option key={exam._id} value={exam._id}>
                                    {exam.Name}
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
                            'Submit Exam'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Exams;