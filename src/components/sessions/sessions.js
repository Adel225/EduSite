    import React, { useState } from 'react';
    import '../../styles/sessions.css';
    import '../../styles/exams.css';
    import { API_URL } from '../../config';
    import { useNavigate } from 'react-router-dom';

    const Sessions = () => {
    const navigate = useNavigate();
    const [selectedGrade, setSelectedGrade] = useState('');
    const [selectedGroups, setSelectedGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [groups, setGroups] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [gradeId, setGradeId] = useState('');
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [error, setError] = useState(null);
    const [submitStatus, setSubmitStatus] = useState('');
    const [formData, setFormData] = useState({
        description: '',
        name: '',
        file: null,
        startDate: '',
        endDate: ''
    });

    const grades = [12, 11, 10, 9];

    const fetchGroups = async (grade) => {
        setLoadingGroups(true);
        setError(null);
        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/group/grades?grade=${grade}`, {
            headers: {
            'Authorization': `MonaEdu ${token}`
            }
        });
        const data = await response.json();
        
        if (data.Message === "Groups fetched successfully") {
            setGroups(data.groups);
            if (data.groups.length > 0) {
            setGradeId(data.groups[0].gradeid);
            }
        } else {
            setError('Failed to fetch groups');
        }
        } catch (err) {
        setError('Error loading groups');
        } finally {
        setLoadingGroups(false);
        }
    };

    const handleGradeChange = (e) => {
        const grade = e.target.value;
        setSelectedGrade(grade);
        setSelectedGroups([]); // Reset selected groups when grade changes
        if (grade) {
            fetchGroups(grade);
        } else {
            setGroups([]);
        }
    };

    const handleGroupClick = async (groupId) => {
        setSelectedGroupId(groupId);
        setLoadingSessions(true);
        setError(null);
        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/sections?gradeId=${gradeId}&groupIds=${groupId}` , {
            method: 'GET',
            headers: {
            'Authorization': `MonaEdu ${token}`
            }
        });
        const data = await response.json();
        
        if (data.message === "Sections fetched successfully") {
            setSessions(data.data || []); // Corrected to use data.data from API response
        } 
        else if (data.message === "No sections found for this student.") {
            setError('No sessions found!');
        }
        else {
            setError('Failed to fetch sessions');
            setSessions([]);
        }
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError('Error loading sessions');
            setSessions([]);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleSessionClick = (session) => {
        if (!selectedGroupId) {
        setError('No group selected');
        return;
        }
        // Navigate to the details page for the clicked session
        navigate(`/dashboard/sessions/${session._id}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGrade || selectedGroups.length === 0 || !formData.name || !formData.description) {
        setError('Please select grade, group(s), and provide a session name and description.');
        return;
        }

        setSubmitStatus('Creating session...');
        setError(null);

        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const sessionData = {
            name: formData.name,
            description: formData.description,
            gradeId: gradeId,
            groupIds: selectedGroups
        };

        const response = await fetch(`${API_URL}/sections/create`, {
            method: 'POST',
            headers: {
            'Authorization': `MonaEdu ${token}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to create session');
        }

        if (result.message === "Section container created successfully.") {
            setSubmitStatus(`Session "${result.data.name}" created successfully`);
            // Reset form
            setFormData({
            name: '',
            description: ''
            });
            setSelectedGroups([]);
            // Optionally, refresh the sessions list
            if (selectedGroupId) handleGroupClick(selectedGroupId);
        } else {
            throw new Error('Unexpected response format from server');
        }
        } catch (err) {
        console.error('Error creating session:', err);
        setError(err.message || 'Error creating session. Please try again.');
        setSubmitStatus('');
        }
    };

    const handleDeleteSession = async (sessionIdToDelete) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
        try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/sections/${sessionIdToDelete}`, {
            method: 'DELETE',
            headers: {
            'Authorization': `MonaEdu ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete session');
        }

        alert('Section container deleted successfully.');
        if (selectedGroupId) {
            handleGroupClick(selectedGroupId);
        }
        } catch (err) {
            console.error('Error deleting session:', err);
            alert('An error occurred while deleting the session.');
        }
    }
};

    return (
        <div className="exams-page">

        <div className="exams-left">
            <h2>Select Grade</h2>
            <div className="grades-list">
            {grades.map((grade) => (
                <div
                key={grade}
                className={`grade-card ${selectedGrade === grade ? 'selected' : ''}`}
                onClick={() => handleGradeChange({ target: { value: grade } })}
                >
                <h3>Grade {grade}</h3>
                </div>
            ))}
            </div>

            {selectedGrade && (
            <div className="groups-section">
                <h3>Groups in Grade {selectedGrade}</h3>
                {loadingGroups ? (
                <div className="loading">Loading groups...</div>
                ) : error ? (
                <div className="error">{error}</div>
                ) : (
                <div className="groups-list">
                    {groups.map((group) => (
                    <div 
                        key={group._id} 
                        className={`group-item ${selectedGroupId === group._id ? 'selected' : ''}`}
                        onClick={() => handleGroupClick(group._id)}
                    >
                        {group.groupname}
                    </div>
                    ))}
                </div>
                )}
            </div>
            )}

            {(sessions.length > 0 || loadingSessions) && (
                <div className="sessions-section">
                    <h3>Sessions</h3>
                    {loadingSessions ? (
                    <div className="loading">Loading sessions...</div>
                    ) : (
                    <ul className="sessions-list">
                        {(Array.isArray(sessions) ? sessions : []).map((session) => (
                        <li
                            key={session._id}
                            className="session-card"
                            onClick={() => handleSessionClick(session)}
                        >
                            <div className="exam-info">
                                <span className="exam-name">{session.name}</span>
                                <span className="exam-dates">{session.description}</span>
                            </div>
                            <button
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation(); 
                                    handleDeleteSession(session._id);
                                }}
                                > Delete </button>
                        </li>
                        ))}
                    </ul>
                    )}
                </div>
                )}
        </div>

        <div className="exams-right">
            <h2>Create new Session</h2>
            <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Grade:</label>
                <select 
                value={selectedGrade} 
                onChange={handleGradeChange}
                required
                >
                <option value="">Select Grade</option>
                {grades.map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                ))}
                </select>
            </div>

            <div className="form-group">
                <label>Groups:</label>
                {loadingGroups ? (
                    <div>Loading groups...</div>
                    ) : (
                    <div className="groups-list">
                        <div className="select-all group-checkbox-row">
                        <label>
                            <input
                            type="checkbox"
                            checked={selectedGroups.length === groups.length && groups.length > 0}
                            onChange={() => {
                                if (selectedGroups.length === groups.length) {
                                setSelectedGroups([]);
                                } else {
                                setSelectedGroups(groups.map(group => group._id));
                                }
                            }}
                            />
                            Select All Groups
                        </label>
                        </div>
                        {groups.map((group) => (
                        <div key={group._id} className="group-checkbox-row">
                            <label>
                            <input
                                type="checkbox"
                                checked={selectedGroups.includes(group._id)}
                                onChange={() => {
                                setSelectedGroups(prev => {
                                    if (prev.includes(group._id)) {
                                    return prev.filter(id => id !== group._id);
                                    } else {
                                    return [...prev, group._id];
                                    }
                                });
                                }}
                            />
                            {group.groupname}
                            </label>
                        </div>
                        ))}
                    </div>
                    )}
            </div>

            <div className="form-group">
                <label>Session Name:</label>
                <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter Session Name" 
                required
                />
            </div>
            <div className="form-group">
                <label>Description:</label>
                <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter a description for the session" 
                required
                />
            </div>

            

            

            

            {error && <div className="error-message">{error}</div>}
            {submitStatus && <div className="submit-status">{submitStatus}</div>}

            <button type="submit" disabled={submitStatus === 'Uploading exam...'}>
                {submitStatus === 'Uploading exam...' ? 'Uploading...' : 'Submit'}
            </button>
            </form>
        </div>
        </div>
    );
    };

    export default Sessions;