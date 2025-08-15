import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import { API_URL } from '../../config';
import '../../styles/exams.css';

const toDatetimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
};

const Exams = () => {
  const navigate = useNavigate();
  // State for the main page view
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [exams, setExams] = useState([]);
  const [gradeId, setGradeId] = useState('');
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null); 

  // State for the STATIC "Create" form
  const [createFormData, setCreateFormData] = useState({ name: '', file: null, startDate: '', endDate: '' });

  // State for the EDIT MODAL
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', file: null, startDate: '', endDate: '', allowSubmissionsAfterDueDate: false });

  const grades = [6,7,8,9,10,11,12];

  // const formatDate = (dateString) => {
  //   try {
  //     const date = new Date(dateString);
  //     if (isNaN(date.getTime())) {
  //       return 'Invalid Date';
  //     }
  //     const year = date.getFullYear();
  //     const month = String(date.getMonth() + 1).padStart(2, '0');
  //     const day = String(date.getDate()).padStart(2, '0');
  //     const hours = String(date.getHours()).padStart(2, '0');
  //     const minutes = String(date.getMinutes()).padStart(2, '0');
  //     return `${year}-${month}-${day}  T ${hours}:${minutes}`;
  //   } catch (error) {
  //     return 'Invalid Date';
  //   }
  // };

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
    setSelectedGroups([]);
    if (grade) fetchGroups(grade); 
    else setGroups([]);
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
        setExams(data.data || []);
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

  const handleOpenEditModal = (exam) => {
    setCurrentItem(exam);
    setEditFormData({
      name: exam.Name,
      startDate: toDatetimeLocal(exam.startdate),
      endDate: toDatetimeLocal(exam.enddate),
      allowSubmissionsAfterDueDate: exam.allowSubmissionsAfterDueDate ,
      file: null, // File is never pre-populated
    });
    console.log({
      name: exam.Name,
      startDate: toDatetimeLocal(exam.startdate),
      endDate: toDatetimeLocal(exam.enddate),
      allowSubmissionsAfterDueDate: exam.allowSubmissionsAfterDueDate ,
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
    setSubmitStatus('Uploading exam...');
    setError(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('Name', createFormData.name);
      formDataToSend.append('file', createFormData.file);
      formDataToSend.append('startdate', createFormData.startDate);
      formDataToSend.append('enddate', createFormData.endDate);
      selectedGroups.forEach(groupId => formDataToSend.append('groupIds', groupId));
      formDataToSend.append('gradeId', gradeId);
      formDataToSend.append('allowSubmissionsAfterDueDate', false);

      const response = await fetch(`${API_URL}/exams/create`, {
        method: 'POST',
        headers: { 'Authorization': `MonaEdu ${token}` },
        body: formDataToSend
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to upload exam');

      if (result.message === "Exam created successfully" && result.exam) {
        setSubmitStatus(`Exam "${result.exam.Name}" created successfully`);
        setCreateFormData({ name: '', file: null, startDate: '', endDate: '' });
        setSelectedGroups([]);
        document.getElementById('exam-file-input').value = null; 
        if(selectedGroupId) handleGroupClick(selectedGroupId); 
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      setError(err.message || 'Error uploading exam. Please try again.');
      setSubmitStatus('');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('Updating exam...');
    setError(null);

    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const formDataToSend = new FormData();
        formDataToSend.append('examId', currentItem._id);
        formDataToSend.append('Name', editFormData.name);
        formDataToSend.append('startdate', editFormData.startDate);
        formDataToSend.append('enddate', editFormData.endDate);
        formDataToSend.append('allowSubmissionsAfterDueDate', editFormData.allowSubmissionsAfterDueDate);
        selectedGroups.forEach(groupId => formDataToSend.append('groupIds', groupId));
        if (editFormData.file) {
            formDataToSend.append('file', editFormData.file);
        }
        
        const response = await fetch(`${API_URL}/exams/edit`, {
            method: 'PUT',
            headers: { 'Authorization': `MonaEdu ${token}` },
            body: formDataToSend,
        });
        const result = await response.json();
        console.log(result);
        if (!response.ok) throw new Error(result.message || 'Failed to update exam');

        setSubmitStatus('Exam updated successfully!');
        if(selectedGroupId) handleGroupClick(selectedGroupId);
        setTimeout(handleCloseEditModal, 1500);

    } catch (err) {
        setError(err.message || 'Error updating exam.');
        setSubmitStatus('');
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <>
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
                        style={{ position: 'absolute', bottom: 10, right: 90, zIndex: 2 }}
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
                      <button 
                        className="edit-btn" 
                        style={{ position: 'absolute', bottom: 10, right: 158, zIndex: 2 }}
                        onClick={(e) => { e.stopPropagation(); handleOpenEditModal(exam); }}>
                          Edit
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
            <form onSubmit={handleCreateSubmit}>
              <div className="form-group"><label>Grade:</label><select value={selectedGrade} onChange={handleGradeChange} required><option value="">Select Grade</option>{grades.map(grade => (<option key={grade} value={grade}>Grade {grade}</option>))}</select></div>
              <div className="form-group">
                <label>Groups:</label>
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
              </div>
              <div className="form-group"><label>Exam Name:</label><input type="text" value={createFormData.name} onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})} required /></div>
              <div className="form-group"><label>Exam File:</label><input type="file" id="exam-file-input" accept=".pdf" onChange={(e) => setCreateFormData({...createFormData, file: e.target.files[0]})} required /></div>
              <div className="form-group"><label>Start Date:</label><input type="datetime-local" value={createFormData.startDate} onChange={(e) => setCreateFormData({...createFormData, startDate: e.target.value})} required /></div>
              <div className="form-group"><label>End Date:</label><input type="datetime-local" value={createFormData.endDate} onChange={(e) => setCreateFormData({...createFormData, endDate: e.target.value})} required /></div>
              {error && <div className="error-message">{error}</div>}
              {submitStatus && <div className="submit-status">{submitStatus}</div>}
              <button type="submit" disabled={submitStatus.includes('...')}>Submit</button>
            </form>
        </div>

      </div>  
      
      <Modal isOpen={isEditModalOpen} onRequestClose={handleCloseEditModal} contentLabel="Edit Exam" className="form-modal" overlayClassName="form-modal-overlay">
        <h2>Edit Exam</h2>
        <form onSubmit={handleEditSubmit}>
            <div className="form-group"><label>Exam Name:</label><input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required /></div>
            {/* <div className="groups-list checkbox-style">
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
            </div> */}
            <div className="form-group"><label>Exam File (Leave blank to keep existing):</label><input type="file" onChange={(e) => setEditFormData({...editFormData, file: e.target.files[0]})} /></div>
            <div className="form-group"><label>Start Date:</label><input type="datetime-local" value={editFormData.startDate} onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})} required /></div>
            <div className="form-group"><label>End Date:</label><input type="datetime-local" value={editFormData.endDate} onChange={(e) => setEditFormData({...editFormData, endDate: e.target.value})} required /></div>
            <div className="form-group checkbox-group">
                <input type="checkbox" id="allowLateSubmissionsExam" checked={editFormData.allowSubmissionsAfterDueDate} onChange={(e) => setEditFormData({...editFormData, allowSubmissionsAfterDueDate: e.target.checked})} />
                <label htmlFor="allowLateSubmissionsExam">Allow submissions after due date</label>
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

export default Exams;