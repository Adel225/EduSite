import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { API_URL } from '../../config';
import '../../styles/assignments.css';

// Helper function to format dates for the datetime-local input
const toDatetimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  // Adjust for timezone offset to display correctly in the user's local time
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
};

const Assignments = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [gradeId, setGradeId] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // States for modal and form data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    startDate: '',
    endDate: '',
    allowSubmissionsAfterDueDate: false,
    grade: '',
  });

  const grades = [12, 11, 10, 9];
  const navigate = useNavigate();

  const fetchGroups = async (grade) => {
    setLoadingGroups(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/group/grades?grade=${grade}`, {
        headers: { 'Authorization': `MonaEdu ${token}` }
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
    setSelectedGroups([]);
    setAssignments([]); // Clear assignments when grade changes
    setSelectedGroupId(null); // Clear selected group
    if (grade) {
      fetchGroups(grade);
    } else {
      setGroups([]);
    }
  };

  const handleGroupClick = async (groupId) => {
    setSelectedGroupId(groupId);
    setLoadingAssignments(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments/group/all?groupId=${groupId}`, {
        method: 'GET',
        headers: { 'Authorization': `MonaEdu ${token}` }
      });
      const data = await response.json();
      if (data.message === "Assignments fetched successfully") {
        setAssignments(data.data);
      } else {
        setError('Failed to fetch assignments');
        setAssignments([]);
      }
    } catch (err) {
      setError('Error loading assignments');
      setAssignments([]);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAssignmentClick = (assignmentId) => {
    if (!selectedGroupId) {
      setError('No group selected');
      return;
    }
    navigate(`/dashboard/assignments/grade/${selectedGrade}/group/${selectedGroupId}/assignment/${assignmentId}`);
  };

  const handleOpenModal = (assignment = null) => {
    setError(null);
    setSubmitStatus('');
    if (assignment) {
      setIsEditMode(true);
      setCurrentItem(assignment);
      setFormData({
        name: assignment.name,
        startDate: toDatetimeLocal(assignment.startDate),
        endDate: toDatetimeLocal(assignment.endDate),
        allowSubmissionsAfterDueDate: assignment.allowSubmissionsAfterDueDate || false,
        file: null,
      });
    } else {
      setIsEditMode(false);
      setCurrentItem(null);
      setFormData({
        name: '',
        file: null,
        startDate: '',
        endDate: '',
        allowSubmissionsAfterDueDate: false,
        grade: selectedGrade || '',
      });
      setSelectedGroups([]);
      if (selectedGrade) {
        fetchGroups(selectedGrade);
      } else {
        setGroups([]);
      }
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setCurrentItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus(isEditMode ? 'Updating...' : 'Uploading...');
    setError(null);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('startDate', formData.startDate);
    formDataToSend.append('endDate', formData.endDate);
    formDataToSend.append('allowSubmissionsAfterDueDate', formData.allowSubmissionsAfterDueDate ? 'true' : 'false');

    if (formData.file) {
      formDataToSend.append('file', formData.file);
    }
    
    const url = isEditMode ? `${API_URL}/assignments/edit` : `${API_URL}/assignments/create`;
    const method = isEditMode ? 'PUT' : 'POST';

    if (isEditMode) {
      formDataToSend.append('assignmentId', currentItem._id);
    } else {
      formDataToSend.append('gradeId', gradeId);
      selectedGroups.forEach(groupId => formDataToSend.append('groupIds', groupId));
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(url, {
        method: method,
        headers: { 'Authorization': `MonaEdu ${token}` },
        body: formDataToSend
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Submission failed');
      
      setSubmitStatus(isEditMode ? 'Assignment updated successfully!' : 'Assignment created successfully!');
      if (selectedGroupId) handleGroupClick(selectedGroupId);
      setTimeout(handleCloseModal, 1500);

    } catch (err) {
      setError(err.message || 'An error occurred.');
      setSubmitStatus('');
    }
  };

  const handleDelete = async (assignmentId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `MonaEdu ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to delete assignment');
      
      alert('Assignment deleted successfully!');
      if (selectedGroupId) handleGroupClick(selectedGroupId);

    } catch (err) {
      setError(err.message || 'An error occurred while deleting.');
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <>
      <div className="assignments-page">
        <div className="assignments-left">
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

          {selectedGroupId && (
            <div className="assignments-section">
              <h3>Assignments</h3>
              {loadingAssignments ? (
                <div className="loading">Loading assignments...</div>
              ) : (
                <ul className="assignments-list">
                  {assignments.length > 0 ? assignments.map((assignment) => (
                    <li key={assignment._id} className="assignment-card">
                      <div className="assignment-info" onClick={() => handleAssignmentClick(assignment._id)}>
                        <span className="assignment-name">{assignment.name}</span>
                        <span className="assignment-dates">
                          Start: {formatDate(assignment.startDate)} <br />
                          End: {formatDate(assignment.endDate)}
                        </span>
                      </div>
                      <div className="assignment-actions">
                          <button className="edit-btn" onClick={() => handleOpenModal(assignment)}>Edit</button>
                          <button
                            className="view-btn"
                            onClick={e => {
                              e.stopPropagation();
                              if (assignment.path) window.open(assignment.path, '_blank');
                              else window.alert('No file available for this assignment.');
                            }}
                          >
                            View
                          </button>
                          <button
                              className="delete-btn"
                              onClick={async (e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this assignment?')) {
                                      handleDelete(assignment._id);
                                  }
                              }}
                          >
                              Delete
                          </button>
                      </div>
                    </li>
                  )) : <p>No assignments found for this group.</p>}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="assignments-right">
          <h2>Actions</h2>
          <p>Select a grade and group to manage assignments, or upload a new one.</p>
          <button className="upload-new-btn" onClick={() => handleOpenModal()}>
              + Upload New Assignment
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel={isEditMode ? "Edit Assignment" : "Upload New Assignment"}
        className="form-modal"
        overlayClassName="form-modal-overlay"
      >
        <h2>{isEditMode ? "Edit Assignment" : "Upload New Assignment"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Assignment Name:</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Enter Assignment Name" required />
          </div>
          
          {!isEditMode && (
            <>
              <div className="form-group">
                <label>Grade:</label>
                <select 
                  value={formData.grade} 
                  onChange={(e) => {
                    const newGrade = e.target.value;
                    setFormData(prev => ({ ...prev, grade: newGrade }));
                    setSelectedGroups([]);
                    if (newGrade) {
                      fetchGroups(newGrade);
                    } else {
                      setGroups([]);
                    }
                  }} 
                  required
                >
                  <option value="">Select Grade</option>
                  {grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Groups:</label>
                {loadingGroups ? (<div>Loading...</div>) : (
                  <div className="groups-list checkbox-style">
                    <div className="select-all group-checkbox-row">
                      <label><input type="checkbox" onChange={(e) => setSelectedGroups(e.target.checked ? groups.map(g => g._id) : [])} checked={selectedGroups.length === groups.length && groups.length > 0} /> Select All Groups</label>
                    </div>
                    {groups.map((group) => (
                      <div key={group._id} className="group-checkbox-row">
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedGroups.includes(group._id)}
                            onChange={() => setSelectedGroups(prev => prev.includes(group._id) ? prev.filter(id => id !== group._id) : [...prev, group._id])}
                          />
                          {group.groupname}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="form-group">
            <label>Assignment File {isEditMode && "(leave blank to keep existing)"}:</label>
            <input type="file" accept=".pdf" onChange={(e) => setFormData({...formData, file: e.target.files[0]})} required={!isEditMode} />
          </div>

          <div className="form-group">
            <label>Start Date and Time:</label>
            <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>End Date and Time:</label>
            <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} required />
          </div>

          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="allowLateSubmissions"
              checked={formData.allowSubmissionsAfterDueDate}
              onChange={(e) => setFormData({...formData, allowSubmissionsAfterDueDate: e.target.checked})} 
            />
            <label htmlFor="allowLateSubmissions">Allow submissions after due date</label>
          </div>

          {error && <div className="error-message">{error}</div>}
          {submitStatus && <div className="submit-status">{submitStatus}</div>}
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCloseModal}>Cancel</button>
            <button type="submit" disabled={submitStatus.includes('...')}>
              {submitStatus.includes('...') ? submitStatus : (isEditMode ? 'Save Changes' : 'Submit')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Assignments;