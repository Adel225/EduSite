import React, { useState, useEffect, useMemo  } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { API_URL } from '../../config';
import '../../styles/assignments.css';

const toDatetimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
};

const Assignments = () => {
  const navigate = useNavigate();
  // State for the main page view
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

  // --- MODIFIED: State for the STATIC "Create" form ---
  const [createFormData, setCreateFormData] = useState({ name: '', file: null, answerFile: null, startDate: '', endDate: '' });

  // --- MODIFIED: State for the EDIT MODAL ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', file: null, answerFile: null, startDate: '', endDate: '', allowSubmissionsAfterDueDate: false });

  const grades = [6,7,8,9,10,11,12];

  const { user } = useAuth(); // Get the globally stored user

  // --- HIGHLIGHT: Process assistant permissions once using useMemo ---
  const assistantPermissions = useMemo(() => {
    if (user?.role !== 'assistant') {
        return null;
    }
    const permissions = {
        allowedGradeNumbers: new Set(),
        allowedGroupIds: new Set(),
    };
    user.permissions?.assignments?.forEach(p => {
        permissions.allowedGradeNumbers.add(p.grade);
        permissions.allowedGroupIds.add(p.groupId);
    });
    return {
        ...permissions,
        allowedGradeNumbers: Array.from(permissions.allowedGradeNumbers).sort((a, b) => a - b),
    };
  }, [user]);

  // --- HIGHLIGHT: Create the lists that the UI will actually render ---
  // If user is an assistant, show their permitted grades. Otherwise, show all grades.
  const displayedGrades = assistantPermissions ? assistantPermissions.allowedGradeNumbers : grades;

  // Filter the fetched groups based on the assistant's permissions.
  const displayedGroups = groups.filter(g => 
    assistantPermissions ? assistantPermissions.allowedGroupIds.has(g._id) : true
  );

  const fetchGroups = async (grade) => {
    setLoadingGroups(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/group/grades?grade=${grade}`, { headers: { 'Authorization': `MonaEdu ${token}` } });
      const data = await response.json();
      if (data.Message === "Groups fetched successfully") {
        setGroups(data.groups);
        if (data.groups.length > 0) setGradeId(data.groups[0].gradeid);
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
    if (grade) fetchGroups(grade); else setGroups([]);
  };

  const handleGroupClick = async (groupId) => {
    setSelectedGroupId(groupId);
    setLoadingAssignments(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/assignments/group/all?groupId=${groupId}`, { headers: { 'Authorization': `MonaEdu ${token}` } });
      const data = await response.json();
      if (data.message === "Assignments fetched successfully") {
        setAssignments(data.data || []);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      setError('Error loading assignments');
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleAssignmentClick = (assignment) => {
    if (!selectedGroupId) return;
    navigate(`/dashboard/assignments/grade/${selectedGrade}/group/${selectedGroupId}/assignment/${assignment._id}`);
  };

  const handleOpenEditModal = (assignment) => {
    setCurrentItem(assignment);
    setEditFormData({
      name: assignment.name,
      startDate: toDatetimeLocal(assignment.startDate),
      endDate: toDatetimeLocal(assignment.endDate),
      allowSubmissionsAfterDueDate: assignment.allowSubmissionsAfterDueDate || false,
      file: null,
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrade || selectedGroups.length === 0) {
      setError('Please select both grade and at least one group');
      return;
    }
    setSubmitStatus('Uploading assignment...');
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('name', createFormData.name);
      formDataToSend.append('file', createFormData.file);
      formDataToSend.append('answerFile', createFormData.answerFile);
      formDataToSend.append('startDate', createFormData.startDate);
      formDataToSend.append('endDate', createFormData.endDate);
      selectedGroups.forEach(groupId => formDataToSend.append('groupIds', groupId));
      formDataToSend.append('gradeId', gradeId);
      
      const response = await fetch(`${API_URL}/assignments/create`, {
        method: 'POST',
        headers: { 'Authorization': `MonaEdu ${token}` },
        body: formDataToSend
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to upload assignment');

      if (result.message === "Assignment created successfully") {
        setSubmitStatus(`Assignment "${result.assignment.name}" created successfully`);
        setCreateFormData({ name: '', file: null, startDate: '', endDate: '' });
        setSelectedGroups([]);
        document.getElementById('assignment-file-input').value = null;
        if(selectedGroupId) handleGroupClick(selectedGroupId);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      setError(err.message || 'Error uploading assignment.');
      setSubmitStatus('');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('Updating assignment...');
    setError(null);
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const formDataToSend = new FormData();
        formDataToSend.append('assignmentId', currentItem._id);
        formDataToSend.append('name', editFormData.name);
        formDataToSend.append('startDate', editFormData.startDate);
        formDataToSend.append('endDate', editFormData.endDate);
        formDataToSend.append('allowSubmissionsAfterDueDate', editFormData.allowSubmissionsAfterDueDate);
        if (editFormData.file) {
            formDataToSend.append('file', editFormData.file);
        }
        if (editFormData.answerFile) {
          formDataToSend.append('answerFile', editFormData.answerFile);
      }
        
        const response = await fetch(`${API_URL}/assignments/edit`, {
            method: 'PUT',
            headers: { 'Authorization': `MonaEdu ${token}` },
            body: formDataToSend,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update assignment');

        setSubmitStatus('Assignment updated successfully!');
        if(selectedGroupId) handleGroupClick(selectedGroupId);
        setTimeout(handleCloseEditModal, 1500);
    } catch (err) {
        setError(err.message || 'Error updating assignment.');
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
      if (selectedGroupId) handleGroupClick(selectedGroupId); // Refresh the list

    } catch (err) {
      alert(err.message || 'An error occurred while deleting.');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <>
      <div className="assignments-page">

        <div className="assignments-left">
          <h2>Select Grade</h2>
          <div className="grades-list">
            {displayedGrades.map((grade) => (<div key={grade} className={`grade-card ${selectedGrade === grade ? 'selected' : ''}`} onClick={() => handleGradeChange({ target: { value: grade } })}><h3>Grade {grade}</h3></div>))}
          </div>
          {selectedGrade && (
            <div className="groups-section">
              <h3>Groups in Grade {selectedGrade}</h3>
              {loadingGroups ? <div className="loading">Loading...</div> : (
                <div className="groups-list">
                  {displayedGroups.map((group) => (<div key={group._id} className={`group-item ${selectedGroupId === group._id ? 'selected' : ''}`} onClick={() => handleGroupClick(group._id)}>{group.groupname}</div>))}
                </div>
              )}
            </div>
          )}
          {selectedGroupId && (
            <div className="assignments-section">
              <h3>Assignments</h3>
              {loadingAssignments ? <div className="loading">Loading...</div> : (
                <ul className="assignments-list">
                  {assignments.length > 0 ? assignments.map((assignment) => (
                    <li key={assignment._id} className="assignment-card">
                      <div className="assignment-info" onClick={() => handleAssignmentClick(assignment)}>
                        <span className="assignment-name">{assignment.name}</span>
                        <span className="assignment-dates">Start: {formatDate(assignment.startDate)}<br/>End: {formatDate(assignment.endDate)}</span>
                      </div>
                      <div className="assignment-actions">

                        
                        <button className="edit-btn" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(assignment); }}>Edit</button>
                        <button
                            className="view-btn"
                            onClick={e => {
                              e.stopPropagation();
                              if (assignment.path) {
                                window.open(assignment.path, '_blank');
                              } else {
                                window.alert('No file available for this assignment.');
                              }
                            }}
                          >
                            View
                          </button>
                        <button
                            className="delete-btn"
                            onClick={(e) => {
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
          <h2>Upload new Assignment</h2>
          <form onSubmit={handleCreateSubmit}>
            <div className="form-group"><label>Grade:</label><select value={selectedGrade} onChange={handleGradeChange} required><option value="">Select Grade</option>{displayedGrades.map(grade => (<option key={grade} value={grade}>Grade {grade}</option>))}</select></div>
            <div className="form-group">
              <label>Groups:</label>
              <div className="groups-list checkbox-style">
                <div className="select-all-row"><label><input type="checkbox" checked={selectedGroups.length === groups.length && groups.length > 0} onChange={() => setSelectedGroups(selectedGroups.length === groups.length ? [] : groups.map(g => g._id))} /> Select All Groups</label></div>
                {displayedGroups.map((group) => (
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
            </div>
            <div className="form-group"><label>Assignment Name:</label><input type="text" value={createFormData.name} onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})} required /></div>
            <div className="form-group"><label>Assignment File:</label><input type="file" id="assignment-file-input" accept=".pdf" onChange={(e) => setCreateFormData({...createFormData, file: e.target.files[0]})} required /></div>
            <div className="form-group"><label>Answer File:</label><input type="file" id="assignment-file-input" accept=".pdf" onChange={(e) => setCreateFormData({...createFormData, answerFile: e.target.files[0]})} /></div>
            <div className="form-group"><label>Start Date:</label><input type="datetime-local" value={createFormData.startDate} onChange={(e) => setCreateFormData({...createFormData, startDate: e.target.value})} required /></div>
            <div className="form-group"><label>End Date:</label><input type="datetime-local" value={createFormData.endDate} onChange={(e) => setCreateFormData({...createFormData, endDate: e.target.value})} required /></div>
            {error && <div className="error-message">{error}</div>}
            {submitStatus && <div className="submit-status">{submitStatus}</div>}
            <button type="submit" disabled={submitStatus.includes('...')}>Submit</button>
          </form>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onRequestClose={handleCloseEditModal} contentLabel="Edit Assignment" className="form-modal" overlayClassName="form-modal-overlay">
        <h2>Edit Assignment</h2>
        <form onSubmit={handleEditSubmit}>
            <div className="form-group"><label>Assignment Name:</label><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required /></div>
            <div className="form-group"><label>Assignment File (Leave blank to keep existing):</label><input type="file" onChange={(e) => setEditFormData({...editFormData, file: e.target.files[0]})} /></div>
            <div className="form-group"><label>Answers File (Leave blank to keep existing):</label><input type="file" onChange={(e) => setEditFormData({...editFormData, answerFile: e.target.files[0]})} /></div>
            <div className="form-group"><label>Start Date:</label><input type="datetime-local" value={editFormData.startDate} onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})} required /></div>
            <div className="form-group"><label>End Date:</label><input type="datetime-local" value={editFormData.endDate} onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})} required /></div>
            <div className="form-group checkbox-group">
                <input type="checkbox" id="allowLateSubmissions" checked={editFormData.allowSubmissionsAfterDueDate} onChange={(e) => setEditFormData({...editFormData, allowSubmissionsAfterDueDate: e.target.checked})} />
                <label htmlFor="allowLateSubmissions">Allow submissions after due date</label>
            </div>
            {error && <div className="error-message">{error}</div>}
            {submitStatus && <div className="submit-status">{submitStatus}</div>}
            <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseEditModal}>Cancel</button>
                <button type="submit" disabled={submitStatus.includes('...')}>Save Changes</button>
            </div>
        </form>
      </Modal>
    </>
  );
};

export default Assignments;