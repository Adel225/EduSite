// src/components/courses/CourseRequests.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../../styles/courseRequests.css';
const API_URL = process.env.REACT_APP_API_URL;


const CourseRequests = () => {
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCourses: 0, limit : 4 });
    const [allRequests, setAllRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedRequests, setSelectedRequests] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('');

    const courseNames = useMemo(() => {
        const names = new Set(allRequests.map(req => req.courseName));
        return Array.from(names);
    }, [allRequests]);

    const fetchRequests = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const url = new URL(`${API_URL}/courses/all`);
            url.searchParams.append('page', page);
            
            const response = await fetch(url.toString(), {
                headers: { 'Authorization': `MonaEdu ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to fetch requests");
            setAllRequests(data.data.courses || []);
            setRequests(data.data.courses || []);
            setPagination(data.data.pagination || { currentPage: 1, totalPages: 1, totalCourses: 0 });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage, fetchRequests]);

    useEffect(() => {
        let filteredData = [...allRequests];
        if (searchTerm) {
            filteredData = filteredData.filter(req => 
                req.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (courseFilter) {
            filteredData = filteredData.filter(req => req.courseName === courseFilter);
        }
        setRequests(filteredData); 
    }, [searchTerm, courseFilter, allRequests]); 

    const handleSelectionChange = (requestId) => {
        const newSelection = new Set(selectedRequests);
        if (newSelection.has(requestId)) {
            newSelection.delete(requestId);
        } else {
            newSelection.add(requestId);
        }
        setSelectedRequests(newSelection);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedRequests(new Set(requests.map(r => r._id)));
        } else {
            setSelectedRequests(new Set());
        }
    };

    const handleDeleteSelected = async () => {
        const requestIds = Array.from(selectedRequests);
        if (requestIds.length === 0) return;

        if (window.confirm(`Are you sure you want to delete ${requestIds.length} request(s)?`)) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const bodyPayload = {
                    requests: requestIds 
                };

                const response = await fetch(`${API_URL}/courses/`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `MonaEdu ${token}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(bodyPayload), 
                });

                const result = await response.json();
                if (!response.ok) throw new Error(result.message || "Failed to delete requests");
                
                alert('Successfully deleted requests.');
                setSelectedRequests(new Set());
                
                if (requests.length === requestIds.length && currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                } else {
                    fetchRequests(currentPage, searchTerm, courseFilter);
                }

            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="course-requests-page">
            <div className="requests-header">
                <h2>Manage Course Requests</h2>
                <div className="stat-card">
                    <div className="count">{pagination.totalCourses || 0}</div>
                    <div className="label">Total Pending Requests</div>
                </div>
            </div>

            <div className="requests-toolbar">
            <div className="filter-controls">
                    <input 
                        type="text" 
                        placeholder="Search student ..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select 
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                    >
                        <option value="">Filter by Course</option>
                        {courseNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div className="action-controls">
                    <button className="delete-selected-btn" disabled={selectedRequests.size === 0} onClick={handleDeleteSelected}>
                        Delete Selected ({selectedRequests.size})
                    </button>
                </div>
            </div>

            <div className="requests-table-container">
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>
                                <label className="table-checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        onChange={handleSelectAll}
                                        ref={el => {
                                            if (el) {
                                                el.checked = requests.length > 0 && selectedRequests.size === requests.length;
                                                el.indeterminate = selectedRequests.size > 0 && selectedRequests.size < requests.length;
                                            }
                                        }}
                                    />
                                    <span className="custom-checkbox"></span>
                                </label>
                            </th>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Grade</th>
                            <th>Course Name</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : error ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', color: 'red' }}>{error}</td></tr>
                        ) : requests.length > 0 ? requests.map(req => (
                            <tr key={req._id}>
                                <td>
                                    <label className="table-checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedRequests.has(req._id)} 
                                            onChange={() => handleSelectionChange(req._id)}
                                        />
                                        <span className="custom-checkbox"></span>
                                    </label>
                                </td>
                                <td>{req.name}</td>
                                <td>{req.email}</td>
                                <td>{req.phone}</td>
                                <td>{req.grade}</td>
                                <td>{req.courseName}</td>
                                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No requests found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination-controls">
                <button onClick={() => setCurrentPage(1)} disabled={pagination.currentPage === 1}>{"<<"}</button>
                <button onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.currentPage === 1}>{"<"}</button>
                <span>Page {pagination.currentPage} of {pagination.totalPages || 1}</span>
                <button onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages}>{">"}</button>
                <button onClick={() => setCurrentPage(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages}>{">>"}</button>
            </div>
        </div>
    );
};

export default CourseRequests;