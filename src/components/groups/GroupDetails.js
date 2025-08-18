import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/groups.css'; // Reusing global groups styles
import { API_URL } from '../../config';
import Modal from "react-modal";

Modal.setAppElement("#root");



const GroupDetails = () => {
  const { grade, group: groupNumberString } = useParams(); // group will be 'group1', 'group2', etc.
  const navigate = useNavigate();
  const groupNumber = parseInt(groupNumberString.replace('group', ''), 10);

  const [groupStudents, setGroupStudents] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = groupStudents.filter(student => {
    const name = `${student.firstName} ${student.lastName}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    fetchGroupStudents();
    // eslint-disable-next-line
  }, [grade, groupNumberString]);

  const fetchGroupStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      const groupResponse = await fetch(`${API_URL}/group/grades?grade=${grade}`, {
        headers: { 'Authorization': `MonaEdu ${token}` }
      });

      if (!groupResponse.ok) {
        const errorData = await groupResponse.json();
        throw new Error(errorData.Message || 'Failed to fetch groups');
      }

      const groupData = await groupResponse.json();

      if (groupData.Message === "Groups fetched successfully") {
        const targetGroup = groupData.groups[groupNumber - 1];
        setGroupName(targetGroup.groupname);
        if (targetGroup) {
          setCurrentGroupId(targetGroup._id);

          const students = targetGroup.enrolledStudents.map(student => ({
            _id: student._id,
            userName: student.userName,
            firstName: student.firstName,
            lastName: student.lastName,
            phone: student.phone,
            parentPhone: student.parentPhone,
            email: student.email,
            parentemail: student.email
          }));

          setGroupStudents(students);
        } else {
          setError('Group not found at this index. Please check the URL.');
          setGroupStudents([]);
          setCurrentGroupId(null);
        }
      } else {
        throw new Error(groupData.Message || 'Failed to fetch groups: Unexpected message');
      }
    } catch (err) {
      setError(err.message || 'Error loading group students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (window.confirm(`Are you sure you want to remove ${studentName} from this group?`)) {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please log in.');
          return;
        }
        if (!currentGroupId) {
          setError('Error: Group ID not available for removal.');
          return;
        }

        const response = await fetch(`${API_URL}/group/removestudent`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `MonaEdu ${token}`
          },
          body: JSON.stringify({
            studentid: studentId,
            groupid: currentGroupId
          })
        });

        const result = await response.json();

        if (!response.ok) throw new Error(result.Message || 'Failed to remove student from group');

        fetchGroupStudents();
        alert(result.Message || `Student ${studentName} removed from group successfully.`);
      } catch (err) {
        setError(err.message || 'Error removing student. Please try again.');
      }
    }
  };

  const closeViewStudentModal = () => {
    setViewingStudent(null);
  };

  if (loading) return <div className="loading">Loading students...</div>;
  if (error) return <div className="error-banner">{error}</div>;

  return (
    <div className="group-details-page">
      {/* Header */}
      <div className="details-header">
        <h2>Grade {grade} – {groupName || `Group ${groupNumber}`}</h2>
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Students List */}
      <div className="students-list-container">
        {groupStudents.length > 0 ? (
          filteredStudents.map(student => (
            <div key={student._id} className="student-row">
              <div className="student-info">
                <span>{student.firstName} {student.lastName}</span>
              </div>
              <div className="student-actions">
                <button className="view-btn" onClick={() => setViewingStudent(student)}>View</button>
                <button className="remove-btn" onClick={() => handleDeleteStudent(student._id, student.userName)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No students found in this group.</p>
        )}
      </div>

      {/* Student Modal */}
      <Modal
        isOpen={!!viewingStudent}
        onRequestClose={closeViewStudentModal}
        className="form-modal"
        overlayClassName="form-modal-overlay"
      >
        <h2>Student Details</h2>
        {viewingStudent && (
          <>
            <div className="form-group">
              <p><strong>Username:</strong> {viewingStudent.userName}</p>
            </div>
            <div className="form-group">
            <p><strong>Name:</strong> {viewingStudent.firstName} {viewingStudent.lastName}</p>
            </div>
            <div className="form-group">
            <p><strong>Email:</strong> {viewingStudent.email}</p>
            </div>
            <div className="form-group">
            <p><strong>Phone:</strong> {viewingStudent.phone}</p>
            </div>
            <div className="form-group">
            <p><strong>Parent Phone:</strong> {viewingStudent.parentPhone}</p>
            </div>
            <div className="form-group">
            <p><strong>Parent Email:</strong> {viewingStudent.parentemail}</p>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={closeViewStudentModal}
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default GroupDetails;
