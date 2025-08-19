// src/components/assistants/Assistants.js
import React, { useState, useEffect, useCallback  } from 'react';
import Modal from 'react-modal';
import '../../styles/assistants.css';
const API_URL = process.env.REACT_APP_API_URL;

const Assistants = () => {
    const [assistants, setAssistants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the "Create Assistant" modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState({ name: '', email: '', password: '' });
    const [submitStatus, setSubmitStatus] = useState('');

    // State for the "Edit Permissions" modal
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [allGrades, setAllGrades] = useState([6, 7, 8, 9, 10, 11, 12]);
    const [groupsByGrade, setGroupsByGrade] = useState({});
    const [activeTab, setActiveTab] = useState('assignments'); 
    const [selectedGrades, setSelectedGrades] = useState({});

    const fetchAssistants = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/assistant/all`, { headers: { 'Authorization': `MonaEdu ${token}` } });
            const data = await response.json();
            if (data.message === "Assistants fetched successfully.") {
                setAssistants(data.data || []);
            } else {
                throw new Error(data.message || "Failed to fetch assistants");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssistants();
    }, [fetchAssistants]);

    // --- Create Assistant Logic ---
    const handleOpenCreateModal = () => setIsCreateModalOpen(true);
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setCreateFormData({ name: '', email: '', password: '' });
        setSubmitStatus('');
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('Creating...');
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/assistant/create`, {
                method: 'POST',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(createFormData)
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            setSubmitStatus('Assistant created successfully!');
            fetchAssistants();
            setTimeout(handleCloseCreateModal, 1500);
        } catch (err) {
            setSubmitStatus(`Error: ${err.message}`);
        }
    };
    
    // --- Delete Assistant Logic ---
    const handleDeleteAssistant = async (assistantId) => {
        if (window.confirm("Are you sure you want to delete this assistant? This action cannot be undone.")) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/assistant/${assistantId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `MonaEdu ${token}` }
                });
                if (!response.ok) throw new Error("Failed to delete assistant");
                
                alert("Assistant deleted successfully.");
                fetchAssistants();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    // --- Permissions Modal Logic ---
    const handleOpenPermissionsModal = async (assistant) => {
        setCurrentItem(assistant);
        setActiveTab('assignments');
        const initialPermissions = {};
        for (const category in assistant.permissions) {
            if (Array.isArray(assistant.permissions[category])) {
                initialPermissions[category] = new Set(assistant.permissions[category].map(p => p.groupId));
            }
        }
        setPermissions(initialPermissions || {}); 
        setIsPermissionsModalOpen(true);
    };

    const handleClosePermissionsModal = () => {
        setIsPermissionsModalOpen(false);
        setCurrentItem(null);
        setPermissions({});
        setGroupsByGrade({});
        setSelectedGrades({});
        setActiveTab(null);
    };

    const handleGradePillClick = async (grade, category) => {
        const currentSelected = selectedGrades[category] || [];
        const newSelected = currentSelected.includes(grade)
            ? currentSelected.filter(g => g !== grade)
            : [...currentSelected, grade];
        
        setSelectedGrades(prev => ({ ...prev, [category]: newSelected }));

        if (newSelected.includes(grade) && !groupsByGrade[grade]) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/group/grades?grade=${grade}`, { headers: { 'Authorization': `MonaEdu ${token}` }});
                const data = await response.json();
                if (data.groups) {
                    setGroupsByGrade(prev => ({ ...prev, [grade]: data.groups }));
                }
            } catch (err) { console.error("Failed to fetch groups for grade", grade, err); }
        }
    };
    
    const handlePermissionCheckboxChange = (groupId, category) => {
        setPermissions(prev => {
            const newCategoryPermissions = new Set(prev[category] || []);
            if (newCategoryPermissions.has(groupId)) {
                newCategoryPermissions.delete(groupId);
            } else {
                newCategoryPermissions.add(groupId);
            }
            return { ...prev, [category]: newCategoryPermissions };
        });
    };
    
    const handlePermissionsSave = async () => {
        setSubmitStatus("Saving...");
        try {
            const payload = { permissions: {} };
            for (const category in permissions) {
                payload.permissions[category] = Array.from(permissions[category]);
            }

            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/assistant/${currentItem._id}/permissions`, {
                method: 'PUT',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) 
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Failed to update permissions.");
            
            setSubmitStatus("Permissions updated successfully!");
            fetchAssistants(); 
            setTimeout(handleClosePermissionsModal, 1000);

        } catch (err) {
            setSubmitStatus(`Error: ${err.message}`);
        }
    };

    if (loading) return <div className="loading">Loading Assistants...</div>;
    if (error) return <div className="error">{error}</div>;


    return (
        <div className="assistants-page">
            <div className="assistants-header">
                <h2>Manage Assistants</h2>
                <button className="add-assistant-btn" onClick={handleOpenCreateModal}>+ Add New Assistant</button>
            </div>

            <div className="assistants-grid">
                {assistants.map(assistant => (
                    <div key={assistant._id} className="assistant-card">
                        <div className="assistant-info">
                            <h3 className="assistant-name">{assistant.name}</h3>
                            <p className="assistant-email">{assistant.email}</p>
                        </div>
                        <div className="assistant-actions">
                            <button className="edit-permissions-btn" onClick={() => handleOpenPermissionsModal(assistant)}>Permissions</button>
                            <button className="delete-assistant-btn" onClick={() => handleDeleteAssistant(assistant._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- Create Assistant Modal (Unchanged) --- */}
            <Modal isOpen={isCreateModalOpen} onRequestClose={handleCloseCreateModal} className="form-modal" overlayClassName="form-modal-overlay">
                <h2>Create New Assistant</h2>
                <form onSubmit={handleCreateSubmit}>
                    <div className="form-group"><label>Name:</label><input type="text" value={createFormData.name} onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})} required/></div>
                    <div className="form-group"><label>Email:</label><input type="email" value={createFormData.email} onChange={(e) => setCreateFormData({...createFormData, email: e.target.value})} required/></div>
                    <div className="form-group"><label>Password:</label><input type="password" value={createFormData.password} onChange={(e) => setCreateFormData({...createFormData, password: e.target.value})} required/></div>
                    {submitStatus && <p>{submitStatus}</p>}
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={handleCloseCreateModal}>Cancel</button>
                        <button type="submit" disabled={submitStatus === 'Creating...'}>Create</button>
                    </div>
                </form>
            </Modal>
            
            {/* --- NEW: Refactored Edit Permissions Modal --- */}
            {currentItem && (
                <Modal isOpen={isPermissionsModalOpen} onRequestClose={handleClosePermissionsModal} className="permissions-modal" overlayClassName="form-modal-overlay">
                    <div className="permissions-modal-header">
                        <h2>Permissions for {currentItem.name}</h2>
                    </div>

                    <div className="permissions-modal-body">
                        <div className="permission-tabs">
                            {['assignments', 'exams', 'materials', 'sessions', 'groups'].map(cat => (
                                <div key={cat} className={`permission-tab ${activeTab === cat ? 'active' : ''}`} onClick={() => setActiveTab(cat)}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </div>
                            ))}
                        </div>
                        
                        {activeTab && (
                            <div className="permission-filters">
                                <h5>Select Grades to View Groups:</h5>
                                <div className="grade-pills">
                                    {allGrades.map(grade => (
                                        <div key={grade} className={`grade-pill ${selectedGrades[activeTab]?.includes(grade) ? 'active' : ''}`} onClick={() => handleGradePillClick(grade, activeTab)}>
                                            Grade {grade}
                                        </div>
                                    ))}
                                </div>
                                <hr/>
                                <h5>Grant Access to Groups:</h5>
                                <div className="groups-checkbox-list">
                                    {(selectedGrades[activeTab] || []).map(grade => (
                                        (groupsByGrade[grade] || []).map(group => (
                                            <label key={group._id} className="group-check-row"> 
                                                <input 
                                                    type="checkbox" 
                                                    checked={permissions[activeTab]?.has(group._id)} 
                                                    onChange={() => handlePermissionCheckboxChange(group._id, activeTab)} 
                                                />
                                                {group.groupname} (Grade {grade})
                                            </label>
                                        ))
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="permissions-modal-footer">
                        {submitStatus && <p>{submitStatus}</p>}
                        <button type="button" className="cancel-btn" onClick={handleClosePermissionsModal}>Cancel</button>
                        <button 
                            type="button" 
                            className="save-btn" 
                            onClick={handlePermissionsSave} 
                            disabled={submitStatus === 'Saving...'}
                            >
                                Save Changes
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Assistants;