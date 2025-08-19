import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
import './Profile.css';
import MarkedPDFViewer from '../../PDFAnnotationEditor/MarkedPDFViewer';
import Modal from 'react-modal';
const API_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // const [passwords, setPasswords] = useState({
    //     currentPassword: '',
    //     newPassword: '',
    //     confirmNewPassword: ''
    // });
    const [error, setError] = useState('');
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [dataToView, setDataToView] = useState(null); // Will hold { pdfUrl, annotationData }
    // const [success, setSuccess] = useState('');

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/student/profile`, {
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            });
            const data = await response.json();
            
            if (data.message === "Profile information fetched successfully.") {
                setUser(data.data);
            } else {
                setError('Failed to fetch user data');
            }
        } catch (err) {
            setError('Error loading user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleDeleteSubmission = async (submissionId, type, submissionName) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete this submission${submissionName ? ` for ${submissionName}` : ''}?`);
        
        if (!isConfirmed) {
            return;
        }

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/${type}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `MonaEdu ${token}`
                },
                body: JSON.stringify({ submissionId: submissionId })
            });

            const data = await response.json();
            if (data.message === "Submission deleted successfully.") {
                // Refresh the user data to update the submissions list
                fetchUserData();
                alert('Submission deleted successfully');
            } else {
                console.error('Failed to delete submission:', data.message);
                alert('Failed to delete submission');
            }
        } catch (error) {
            console.error('Error deleting submission:', error);
            alert('Error deleting submission');
        }
    };

     const handleViewSubmission = async (submission, type) => {
        // If the submission is not marked yet, open the original file in a new tab.
        if (submission.score === undefined || submission.score === null) {
            const path = type === 'exam' ? submission.filePath : submission.path;
            if (path) {
                window.open(path, '_blank');
            } else {
                alert('No submission file found.');
            }
            return;
        }

        const studentId = submission.studentId._id || submission.studentId;
        const groupId = submission.groupId;
        let url = '';

        if (type === 'exam') {
            const examId = submission.examId._id || submission.examId;
            url = `${API_URL}/exams/submissions?examId=${examId}&studentId=${studentId}&groupId=${groupId}`;
        } else {
            const assignmentId = submission.assignmentId._id || submission.assignmentId;
            url = `${API_URL}/assignments/submissions?assignmentId=${assignmentId}&studentId=${studentId}&groupId=${groupId}`;
        }
        
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(url, { headers: { 'Authorization': `MonaEdu ${token}` } });
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                const fullSubmission = data.data[0];
                setDataToView({
                    pdfUrl: fullSubmission.filePath || fullSubmission.path,
                    annotationData: fullSubmission.annotationData
                });
                setIsViewerOpen(true);
            } else {
                throw new Error(data.message || 'Could not find submission details.');
            }
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
        setDataToView(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Error loading profile</div>;
    }

    return (
        <>
            <div className="profile-container">
            <h2>Profile</h2>
            {error && <div className="error-message">{error}</div>}
            
            <div className="profile-info">
                <div className="info-group">
                    <label>First Name:</label>
                    <span>{user.firstName}</span>
                </div>
                <div className="info-group">
                    <label>Last Name:</label>
                    <span>{user.lastName}</span>
                </div>
                <div className="info-group">
                    <label>Username:</label>
                    <span>{user.userName}</span>
                </div>
                <div className="info-group">
                    <label>Email:</label>
                    <span>{user.email}</span>
                </div>
                <div className="info-group">
                    <label>Parent Email:</label>
                    <span>{user.parentemail}</span>
                </div>
                <div className="info-group">
                    <label>Phone:</label>
                    <span>{user.phone}</span>
                </div>
                <div className="info-group">
                    <label>Parent Phone:</label>
                    <span>{user.parentPhone}</span>
                </div>
                <div className="info-group">
                    <label>Grade:</label>
                    <span>{user.gradeId?.grade}</span>
                </div>
                <div className="info-group">
                    <label>Group:</label>
                    <span>{user.groupId?.groupname}</span>
                </div>
                <div className="info-group">
                    <label>Email Confirmed:</label>
                    <span>{user.confirmEmail ? 'Yes' : 'No'}</span>
                </div>
                <div className="info-group">
                    <label>Submitted Assignments:</label>
                    <span>{user.assignmentSubmissions?.length || 0}</span>
                </div>
                <div className="info-group">
                    <label>Submitted Exams:</label>
                    <span>{user.examSubmissions?.length || 0}</span>
                </div>
            </div>

            {/* Assignment Submissions Section */}
            {user.assignmentSubmissions && user.assignmentSubmissions.length > 0 && (
                <div className="submissions-section">
                    <h3>Assignment Submissions</h3>
                    <div className="submissions-list">
                        {user.assignmentSubmissions.map((submission, index) => (
                            <div key={submission._id} className="submission-item">
                                <div className="submission-header">
                                    <h4>Assignment: {submission.assignmentname || `Submission #${index + 1}`}</h4>
                                    <span className={`status ${submission.score !== undefined ? 'marked' : 'pending'}`}>
                                        {submission.score !== undefined ? `Score: ${submission.score}` : 'Pending'}
                                    </span>
                                </div>
                                <div className="submission-details">
                                    <p><strong>Submitted:</strong> {new Date(submission.SubmitDate).toLocaleDateString()}</p>
                                    {submission.notes && <p><strong>Notes:</strong> {submission.notes}</p>}
                                    {submission.teacherFeedback && <p><strong>Feedback:</strong> {submission.teacherFeedback}</p>}
                                </div>
                                <div className="submission-actions">
                                    <button className="action-btn view" onClick={() => handleViewSubmission(submission, 'assignment')}>
                                        View
                                    </button>
                                    <button 
                                        className="action-btn delete"
                                        onClick={() => handleDeleteSubmission(
                                            submission._id, 
                                            'assignments/submission/delete',
                                            submission.assignmentname
                                        )}
                                        disabled={submission.score !== undefined}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Exam Submissions Section */}
            {user.examSubmissions && user.examSubmissions.length > 0 && (
                <div className="submissions-section">
                    <h3>Exam Submissions</h3>
                    <div className="submissions-list">
                        {user.examSubmissions.map((submission, index) => (
                            <div key={submission._id} className="submission-item">
                                <div className="submission-header">
                                    <h4>Exam: {submission.examname || `Submission #${index + 1}`}</h4>
                                    <span className={`status ${submission.score !== null ? 'scored' : 'pending'}`}>
                                        {submission.score !== null ? `Score: ${submission.score}` : 'Pending'}
                                    </span>
                                </div>
                                <div className="submission-details">
                                    <p><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}</p>
                                    {submission.notes && <p><strong>Notes:</strong> {submission.notes}</p>}
                                    {submission.teacherFeedback && <p><strong>Feedback:</strong> {submission.teacherFeedback}</p>}
                                </div>
                                <div className="submission-actions">
                                    <button className="action-btn view" onClick={() => handleViewSubmission(submission, 'exam')}>
                                        View
                                    </button>
                                    <button 
                                        className="action-btn delete"
                                        onClick={() => handleDeleteSubmission(
                                            submission._id, 
                                            'exams/deleteSub',
                                            submission.examname
                                        )}
                                        disabled={submission.score !== null}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* <div className="password-section">
                <h3>Change Password</h3>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current Password:</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password:</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password:</label>
                        <input
                            type="password"
                            name="confirmNewPassword"
                            value={passwords.confirmNewPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="save-button">Save Changes</button>
                </form>
            </div> */}
        </div>
            <Modal
                isOpen={isViewerOpen}
                onRequestClose={handleCloseViewer}
                contentLabel="View Marked Submission"
                className="pdf-viewer-modal" // Use a class for full-screen styling
                overlayClassName="pdf-viewer-modal-overlay"
            >
                {dataToView && (
                    <MarkedPDFViewer
                        pdfUrl={dataToView.pdfUrl}
                        annotationData={dataToView.annotationData}
                    />
                )}
                <button onClick={handleCloseViewer} style={{position: 'fixed', top: '20px', right: '20px', zIndex: 2001, padding: '10px 20px', cursor: 'pointer'}}>Close</button>
            </Modal>
        </>
    );
};

export default Profile;