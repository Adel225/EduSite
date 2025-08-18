// Groups.js
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { API_URL } from '../../config';
import "../../styles/groups.css"
import { useAuth } from '../../utils/AuthContext';


// const API_URL = process.env.REACT_APP_API_URL;
const Grades = [6, 7, 8, 9, 10, 11, 12];

Modal.setAppElement("#root");

export default function Groups() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  // --- State ---
  const [groups, setGroups] = useState({});
  const [unassigned, setUnassigned] = useState({});
  const [currentGrade, setCurrentGrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [createloading, setCreateLoading] = useState(false);
  const [error, setError] = useState(null);

  // add group modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");

  // bulk selection
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [bulkTargetGroup, setBulkTargetGroup] = useState("");
  const selectAllRef = useRef(null);

  // search
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useAuth(); 

  // --- HIGHLIGHT: Process assistant permissions for GROUPS ---
  const assistantPermissions = useMemo(() => {
    if (user?.role !== 'assistant') return null;
    const permissions = {
        allowedGradeNumbers: new Set(),
        allowedGroupIds: new Set(),
    };
    user.permissions?.groups?.forEach(p => {
        permissions.allowedGradeNumbers.add(p.grade);
        permissions.allowedGroupIds.add(p.groupId);
    });
    return {
        ...permissions,
        allowedGradeNumbers: Array.from(permissions.allowedGradeNumbers).sort((a, b) => a - b),
    };
  }, [user]);

  const displayedGrades = assistantPermissions ? assistantPermissions.allowedGradeNumbers : Grades;


  // --- Fetch groups & unassigned for a grade ---
  const fetchGroups = async (grade) => {
    try {
      const res = await fetch(`${API_URL}/group/grades?grade=${grade}`, {
        headers: { Authorization: `MonaEdu ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch groups");
      const data = await res.json();
      setGroups((prev) => ({ ...prev, [grade]: data.groups || [] }));
      console.log(groups);
    } catch (err) {
      console.error(err);
      setGroups((prev) => ({ ...prev, [grade]: [] }));
    }
  };

  const fetchUnassigned = async (grade) => {
    try {
      const res = await fetch(
        `${API_URL}/student/grade/${grade}/unassigned`,
        { headers: { Authorization: `MonaEdu ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch unassigned students");
      const data = await res.json();
      setUnassigned((prev) => ({ ...prev, [grade]: data.students || [] }));
    } catch (err) {
      console.error(err);
      setUnassigned((prev) => ({ ...prev, [grade]: [] }));
    }
  };

  const loadGradeData = async (grade) => {
    if (!grade) return;
    setLoading(true);
    await Promise.all([fetchGroups(grade), fetchUnassigned(grade)]);
    setLoading(false);
    setSelectedStudents([]);
    setBulkTargetGroup("");
    setSearchQuery("");
  };

  // --- Effects ---
  useEffect(() => {
    if (currentGrade) {
      loadGradeData(currentGrade);
    }
    // eslint-disable-next-line
  }, [currentGrade]);

  // --- Handlers ---
  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const res = await fetch(`${API_URL}/group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `MonaEdu ${token}`,
        },
        body: JSON.stringify({
          grade: currentGrade,
          groupname: newGroupName,
        }),
      });
      if (!res.ok) {
        setCreateLoading(false);
        throw new Error("Failed to create group");
      }
      await loadGradeData(currentGrade);
      setNewGroupName("");
      setCreateLoading(false);
      closeModal();
    } catch (err) {
      alert("Error creating group");
      setCreateLoading(false);
    }
  };

  const handleDeleteGroup = async (groupid, grade) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      const res = await fetch(`${API_URL}/group/deletegroup`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `MonaEdu ${token}`,
        },
        body: JSON.stringify({ groupid }),
      });
      if (!res.ok) throw new Error("Failed to delete group");
      await loadGradeData(grade);
    } catch (err) {
      alert("Error deleting group");
    }
  };

  const closeViewStudentModal = () => {
    setViewingStudent(null);
  };

  // --- Bulk selection ---
  const toggleStudentSelection = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const students = unassigned[currentGrade] || [];
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s._id));
    }
  };

  useEffect(() => {
    if (!selectAllRef.current) return;
    const students = unassigned[currentGrade] || [];
    if (selectedStudents.length === 0) {
      selectAllRef.current.indeterminate = false;
      selectAllRef.current.checked = false;
    } else if (selectedStudents.length === students.length) {
      selectAllRef.current.indeterminate = false;
      selectAllRef.current.checked = true;
    } else {
      selectAllRef.current.indeterminate = true;
    }
  }, [selectedStudents, currentGrade, unassigned]);

  // --- Bulk add ---
  const handleBulkAddStudents = async () => {
    if (!bulkTargetGroup || selectedStudents.length === 0) return;
    if (!window.confirm(`Add ${selectedStudents.length} students to this group?`))
      return;

    const chunks = [];
    for (let i = 0; i < selectedStudents.length; i += 20) {
      chunks.push(selectedStudents.slice(i, i + 20));
    }

    try {
      for (const chunk of chunks) {
        const res = await fetch(`${API_URL}/group/addstudent`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `MonaEdu ${token}`,
          },
          body: JSON.stringify({
            groupid: bulkTargetGroup,
            studentIds: chunk,
          }),
        });
        if (!res.ok) throw new Error("Bulk add failed");
      }
      await loadGradeData(currentGrade);
      setSelectedStudents([]);
      setBulkTargetGroup("");
    } catch (err) {
      alert("Error adding multiple students");
    }
  };

  // --- Filter students ---
  const filteredStudents =
  (unassigned[currentGrade] || []).filter((s) => {
    const q = searchQuery.toLowerCase();
    const first = (s.firstName || "").toLowerCase();
    const last = (s.lastName || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const username = (s.userName || "").toLowerCase();
    return (
      first.includes(q) ||
      last.includes(q) ||
      email.includes(q) ||
      username.includes(q)
    );
  });

  // --- JSX ---
  return (
    <div className="groups-page">
      {/* Header */}
      <div className="groups-header">
        <h2>Groups & Students</h2>
        {user?.role === 'main_teacher' && (
            <button 
              className={`add-group-btn ${!currentGrade ? 'disabled' : ""}`}
              onClick={() => { if (currentGrade) { openModal(); } } }
              disabled={!currentGrade ? true : false}
              title={!currentGrade ? "Please select a grade first" : "Add a new group"}
              >
              + Add New Group
            </button>
        )}
      </div>

      {/* Grade selector */}
      <div className="grade-selector">
        <label htmlFor="grade-select">Select Grade: </label>
        <select
          id="grade-select"
          value={currentGrade}
          onChange={(e) => setCurrentGrade(e.target.value)}
        >
          <option value="">-- Choose Grade --</option>
          {displayedGrades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div className="error-banner">{error}</div>}

      {currentGrade && !loading && (
        <div className="grade-content-container">
          {/* Groups column */}
          <div className="groups-list-container">
            <h3>Groups</h3>
            {groups[currentGrade] && groups[currentGrade].length > 0 ? (
              groups[currentGrade]
                .filter(g => assistantPermissions ? assistantPermissions.allowedGroupIds.has(g._id) : true)
                .map((group, idx) => (
                <div key={group._id} className="group-row">
                  <span>
                    {group.groupname} ({group.enrolledStudents.length} Students)
                  </span>
                  <div className="group-actions">
                    <button
                      className="view-btn"
                      onClick={() =>
                        navigate(
                          `/dashboard/groups/${currentGrade}/${group._id}`
                        )
                      }
                    >
                      View
                    </button>
                    {user?.role === 'main_teacher' && (
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteGroup(group._id, currentGrade)
                          }
                        >
                          Delete
                        </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No groups found for this grade.</p>
            )}
          </div>

          {/* Unassigned students column */}
          <div className="unassigned-students-container">
            <h3>Unassigned Students</h3>

            <div className="students-toolbar">
              <input
                type="text"
                placeholder="Search students..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <label className="select-all">
                <input
                  type="checkbox"
                  ref={selectAllRef}
                  onChange={toggleSelectAll}
                />
                Select All
              </label>
            </div>

            <div className="students-list">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div key={student._id} className="student-row">
                    <div className="student-info">
                      <input
                        type="checkbox"
                        className="student-checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                      />
                      <span>
                          {student.firstName} {student.lastName}
                      </span>
                    </div>
                    <div className="student-actions">
                      <button onClick={() =>  setViewingStudent(student)}>
                        View
                      </button>
                      {/* <select
                        onChange={(e) =>
                          handleAddSingleStudent(student._id, e.target.value)
                        }
                      >
                        <option value="">Add to group...</option>
                        {groups[currentGrade] &&
                          groups[currentGrade].map((g) => (
                            <option key={g._id} value={g._id}>
                              {g.groupname}
                            </option>
                          ))}
                      </select> */}
                    </div>
                  </div>
                ))
              ) : (
                <p>No unassigned students found.</p>
              )}
            </div>

            {selectedStudents.length > 0 && (
              <div className="bulk-actions-bar">
                <span>{selectedStudents.length} selected</span>
                <select
                  value={bulkTargetGroup}
                  onChange={(e) => setBulkTargetGroup(e.target.value)}
                >
                  <option value="">Select group...</option>
                  {groups[currentGrade] &&
                    groups[currentGrade]
                      .filter(g => assistantPermissions ? assistantPermissions.allowedGroupIds.has(g._id) : true)
                      .map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.groupname}
                      </option>
                    ))}
                </select>
                <button onClick={handleBulkAddStudents}>Add Students</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add group modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="form-modal"
        overlayClassName="form-modal-overlay"
      >
        <h2>Create New Group</h2>
        <form onSubmit={handleCreateGroup}>
          <div className="form-group">
            <label>Group Name</label>
            <input
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button type="submit">
              {createloading ? <div className="loading-spinner-small"></div> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student details modal */}
      {/* {selectedStudent && (
        <div className="modal-overlay">
          <div className="student-modal">
            <div className="student-modal-header">
              <h3>Student Details</h3>
              <button className="student-modal-close" onClick={closeStudentModal}>
                &times;
              </button>
            </div>
            <div className="student-modal-body">
              <p><strong>Name:</strong> {selectedStudent.firstName} {selectedStudent.lastName}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
            </div>
          </div>
        </div>
      )} */}
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
}
