import React, { useState } from 'react';
import '../../styles/exams.css';
import { API_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const Exams = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [gradeId, setGradeId] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    startDate: '',
    endDate: ''
  });

  const grades = [12, 11, 10, 9];

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}  T ${hours}:${minutes}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

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
    setLoadingExams(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/exams?groupId=${groupId}`, {
        method: 'GET',
        headers: {
          'Authorization': `MonaEdu ${token}`
        }
      });
      const data = await response.json();
      
      if (data.message === "Exams fetched successfully") {
        setExams(data.exams);
      } else {
        setError('Failed to fetch exams');
        setExams([]);
      }
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Error loading exams');
      setExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleExamClick = (exam) => {
    if (!selectedGroupId) {
      setError('No group selected');
      return;
    }
    navigate(`/dashboard/exams/grade/${selectedGrade}/group/${selectedGroupId}/exam/${exam._id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrade || selectedGroups.length === 0) {
      setError('Please select both grade and at least one group');
      return;
    }

    setSubmitStatus('Uploading exam...');
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('Name', formData.name);
      formDataToSend.append('file', formData.file);
      formDataToSend.append('startdate', formData.startDate);
      formDataToSend.append('enddate', formData.endDate);
      
      // Append each group ID individually to handle array in FormData
      selectedGroups.forEach(groupId => {
        formDataToSend.append('groupIds', groupId);
      });

      formDataToSend.append('gradeId', gradeId);

      const response = await fetch(`${API_URL}/exams/create`, {
        method: 'POST',
        headers: {
          'Authorization': `MonaEdu ${token}`
        },
        body: formDataToSend
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload exam');
      }

      if (result.message === "Exam created successfully" && result.exam) {
        setSubmitStatus(`Exam "${result.exam.Name}" created successfully`);
        // Reset form
        setFormData({
          name: '',
          file: null,
          startDate: '',
          endDate: ''
        });
        setSelectedGroups([]);
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      console.error('Error uploading exam:', err);
      setError(err.message || 'Error uploading exam. Please try again.');
      setSubmitStatus('');
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

        {exams.length > 0 || loadingExams ? (
          <div className="exams-section">
            <h3>Exams</h3>
            {loadingExams ? (
              <div className="loading">Loading exams...</div>
            ) : (
              <ul className="exams-list">
                {exams.map((exam) => (
                  <li 
                    key={exam._id}
                    className="exam-card"
                    onClick={() => handleExamClick(exam)}
                    style={{ position: 'relative' }}
                  >
                    <button
                      className="delete-btn delete-btn-corner"
                      style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 2 }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this exam?')) {
                          try {
                            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                            const response = await fetch(`${API_URL}/exams/delete`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `MonaEdu ${token}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ examId: exam._id }),
                            });
                            const result = await response.json();
                            window.alert(result.message || 'Exam deleted.');
                            // Refresh exams
                            if (selectedGroupId) handleGroupClick(selectedGroupId);
                          } catch (err) {
                            window.alert('Failed to delete exam.');
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                    <button
                      className="view-btn"
                      style={{ position: 'absolute', bottom: 10, right: 85, zIndex: 2 }}
                      onClick={e => {
                        e.stopPropagation();
                        if (exam.path) {
                          window.open(exam.path, '_blank');
                        } else {
                          window.alert('No file available for this exam.');
                        }
                      }}
                    >
                      View
                    </button>
                    <div className="exam-info" onClick={() => handleExamClick(exam)}>
                      <span className="exam-name">{exam.Name}</span>
                      <span className="exam-dates">
                        Start: {formatDate(exam.startdate)} <br />
                        End: {formatDate(exam.enddate)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>

      <div className="exams-right">
        <h2>Upload new Exam</h2>
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
            <label>Exam Name:</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter Exam Name" 
              required
            />
          </div>

          <div className="form-group">
            <label>Exam File:</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              required
            />
          </div>

          <div className="form-group">
            <label>Start Date and Time:</label>
            <input 
              type="datetime-local" 
              value={formData.startDate}
              onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date and Time:</label>
            <input 
              type="datetime-local" 
              value={formData.endDate}
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
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

export default Exams;