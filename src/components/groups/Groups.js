import React, { useState, useEffect } from 'react';
import '../../styles/groups.css';
import { NavLink } from 'react-router-dom';
import { API_URL } from '../../config';


const Grades = [9, 10, 11, 12];

const Groups = () => {
  const [allGroups, setAllGroups] = useState({});
  const [unassignedStudentsByGrade, setUnassignedStudentsByGrade] = useState({});
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingUnassigned, setLoadingUnassigned] = useState(true);
  const [error, setError] = useState(null);
  const [deletingGroupId, setDeletingGroupId] = useState(null);
  const [addingStudentId, setAddingStudentId] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);

  useEffect(() => {
    fetchAllGroups();
    fetchAllUnassignedStudents();
  }, []);

  const fetchAllGroups = async () => {
    setLoadingGroups(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const requests = Grades.map(grade =>
        fetch(`${API_URL}/group/grades?grade=${grade}`, {
          headers: {
            'Authorization': `MonaEdu ${token}`
          }
        }).then(res => res.json())
      );

      const results = await Promise.all(requests);
      const newAllGroups = {};
      results.forEach((data, index) => {
        const grade = Grades[index];
        if (data.Message === "Groups fetched successfully") {
          newAllGroups[grade] = data.groups;
        } else {
          console.error(`Failed to fetch groups for grade ${grade}:`, data.Message);
          newAllGroups[grade] = []; // Ensure an empty array if fetch fails for a grade
        }
      });
      setAllGroups(newAllGroups);
    } catch (err) {
      console.error('Error fetching all groups:', err);
      setError('Error loading groups. Please try again.');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchAllUnassignedStudents = async () => {
    setLoadingUnassigned(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const requests = Grades.map(grade =>
        fetch(`${API_URL}/student/grade/${grade}/unassigned`, {
          headers: {
            'Authorization': `MonaEdu ${token}`
          }
        }).then(res => res.json())
      );

      const results = await Promise.all(requests);
      const newUnassignedStudentsByGrade = {};
      results.forEach((data, index) => {
        const grade = Grades[index];
        if (data.Message === "Unassigned students fetched successfully" || data.Message === "No Student Attached to it") {
          newUnassignedStudentsByGrade[grade] = data.students || [];
        } else {
          console.error(`Failed to fetch unassigned students for grade ${grade}:`, data.Message);
          newUnassignedStudentsByGrade[grade] = [];
        }
      });
      setUnassignedStudentsByGrade(newUnassignedStudentsByGrade);
    } catch (err) {
      console.error('Error fetching all unassigned students:', err);
      setError(err.message || 'Error loading unassigned students. Please try again.');
    } finally {
      setLoadingUnassigned(false);
    }
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`Are you sure you want to delete group "${groupName}"?`)) {
      setDeletingGroupId(groupId);
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/group/deletegroup`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `MonaEdu ${token}`
          },
          body: JSON.stringify({ groupid : groupId })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.Message || 'Failed to delete group');
        }

        fetchAllGroups(); // Refresh all groups
        alert(result.Message || `Group "${groupName}" deleted successfully.`);
      } catch (err) {
        console.error('Error deleting group:', err);
        setError(err.message || 'Error deleting group. Please try again.');
      } finally {
        setDeletingGroupId(null);
      }
    }
  };

  const handleAddStudentToGroup = async (studentId, groupId, groupName, studentName) => {
    if (window.confirm(`Add ${studentName} to group "${groupName}"?`)) {
      setAddingStudentId(studentId); // Use this to disable the specific student's buttons
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/group/addstudent`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `MonaEdu ${token}`
          },
          body: JSON.stringify({ 
            groupid : groupId, 
            studentid : studentId 
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.Message || 'Failed to add student to group');
        }

        // Refresh both lists
        fetchAllGroups();
        fetchAllUnassignedStudents();
        alert(result.Message || `Student ${studentName} added to group "${groupName}" successfully.`);
      } catch (err) {
        console.error('Error adding student to group:', err);
        setError(err.message || 'Error adding student. Please try again.');
      } finally {
        setAddingStudentId(null);
      }
    }
  };

  const handleViewStudent = (student) => {
    setViewingStudent(student);
  };

  const closeViewStudentModal = () => {
    setViewingStudent(null);
  };

  const getUnassignedStudentsForGrade = (grade) => {
    return unassignedStudentsByGrade[grade] || [];
  };

  const handleAddGroup = async (grade) => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setIsAddingGroup(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/group/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `MonaEdu ${token}`
        },
        body: JSON.stringify({
          grade: parseInt(grade),
          groupname: newGroupName.trim()
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.Message || 'Failed to create group');
      }

      setNewGroupName('');
      fetchAllGroups(); // Refresh the groups list
      alert(result.Message || 'Group created successfully');
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Error creating group. Please try again.');
    } finally {
      setIsAddingGroup(false);
    }
  };

  if (loadingGroups || loadingUnassigned) return <div className="loading">Loading groups and unassigned students...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="groups-page">
      <h2>Groups & Unassigned Students</h2>
      {Grades.map(grade => (
        <div key={grade} className="grade-section">
          <h3>Grade {grade}</h3>
          <div className="grade-content-container">
            <div className="groups-list-container">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: 0 }}>Groups</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="New group name"
                    style={{
                      padding: '5px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    onClick={() => handleAddGroup(grade)}
                    disabled={isAddingGroup}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: 0
                    }}
                  >
                    {isAddingGroup ? '...' : '+'}
                  </button>
                </div>
              </div>
              {allGroups[grade] && allGroups[grade].length > 0 ? (
                <div className="groups-container">
                  {allGroups[grade].map((group, index) => (
                    <div key={group._id} className="group-card">
                      <h4>{group.groupname}</h4>
                      <p>Students: {group.enrolledStudents ? group.enrolledStudents.length : 0}</p>
                      <div className="group-card-actions">
                        {(() => {
                          const navLinkPath = `/dashboard/groups/${grade}/group${index + 1}`;
                          return (
                            <NavLink to={navLinkPath} className="view-students-btn">View Students</NavLink>
                          );
                        })()}
                        <button 
                          className="delete-group-btn"
                          onClick={() => handleDeleteGroup(group._id, group.groupname)}
                          disabled={deletingGroupId === group._id}
                        >
                          {deletingGroupId === group._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No groups found for Grade {grade}.</p>
              )}
            </div>

            <div className="unassigned-students-container">
              <h4>Unassigned Students</h4>
              {getUnassignedStudentsForGrade(grade).length > 0 ? (
                <div className="students-list">
                  {getUnassignedStudentsForGrade(grade).map(student => (
                    <div key={student._id} className="student-card">
                      <p><strong>{student.firstName} {student.lastName}</strong></p>
                      <div className="student-actions">
                        <button className="view-btn" onClick={() => handleViewStudent(student)}>View</button>
                        <div className="add-to-group-dropdown">
                          <select 
                            onChange={(e) => handleAddStudentToGroup(
                              student._id,
                              e.target.value,
                              e.target.options[e.target.selectedIndex].text,
                              student.userName
                            )}
                            disabled={addingStudentId === student._id || !allGroups[grade] || allGroups[grade].length === 0}
                            value=""
                          >
                            <option value="">Add to Group</option>
                            {allGroups[grade] && allGroups[grade].map(group => (
                              <option key={group._id} value={group._id}>{group.groupname}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No unassigned students found for Grade {grade}.</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {viewingStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Student Details</h3>
            <p><strong>Username:</strong> {viewingStudent.userName}</p>
            <p><strong>First Name:</strong> {viewingStudent.firstName}</p>
            <p><strong>Last Name:</strong> {viewingStudent.lastName}</p>
            <p><strong>Email:</strong> {viewingStudent.email}</p>
            <p><strong>Phone:</strong> {viewingStudent.phone || 'N/A'}</p>
            <button className="close-modal-btn" onClick={closeViewStudentModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;