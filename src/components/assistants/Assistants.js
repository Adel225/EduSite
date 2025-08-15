// src/components/assistants/Assistants.js
import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';
import { API_URL } from '../../config';
import '../../styles/assistants.css';

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
    const [activePermissionAccordion, setActivePermissionAccordion] = useState(null);
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
        // The API returns the permissions object directly on the assistant object
        setPermissions(assistant.permissions || {}); 
        setIsPermissionsModalOpen(true);
    };

    const handleClosePermissionsModal = () => {
        setIsPermissionsModalOpen(false);
        setCurrentItem(null);
        setPermissions({});
        setGroupsByGrade({});
        setSelectedGrades({});
        setActivePermissionAccordion(null);
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
                    console.log(data.groups);
                }
            } catch (err) { console.error("Failed to fetch groups for grade", grade, err); }
        }
    };
    
    const handlePermissionCheckboxChange = (groupId, category) => {
        const currentPermissions = permissions[category] || [];
        const newPermissions = currentPermissions.includes(groupId)
            ? currentPermissions.filter(id => id !== groupId)
            : [...currentPermissions, groupId];
        setPermissions(prev => ({ ...prev, [category]: newPermissions }));
    };
    
    const handlePermissionsSave = async () => {
        setSubmitStatus("Saving...");
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/assistant/${currentItem._id}/permissions`, {
                method: 'PUT',
                headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ permissions })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            
            setSubmitStatus("Permissions updated successfully!");
            fetchAssistants(); // Refresh the main list data
            setTimeout(handleClosePermissionsModal, 1500);
        } catch (err) {
            setSubmitStatus(`Error: ${err.message}`);
        }
    };

    if (loading) return <div className="loading">Loading Assistants...</div>;
    if (error) return <div className="error">{error}</div>;

    const renderPermissionsCategory = (category) => (
        <div className="permission-category">
            <div className="permission-header" onClick={() => setActivePermissionAccordion(activePermissionAccordion === category ? null : category)}>
                <div>
                    <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div className="permission-summary">
                        {permissions[category]?.length || 0} groups selected
                    </div>
                </div>
                <span>{activePermissionAccordion === category ? '−' : '+'}</span>
            </div>
            <div className={`permission-content ${activePermissionAccordion === category ? 'open' : ''}`}>
                <div className="permission-body">
                    <h5>Select Grades to View Groups:</h5>
                    <div className="grade-pills">
                        {allGrades.map(grade => (
                            <div key={grade} className={`grade-pill ${selectedGrades[category]?.includes(grade) ? 'active' : ''}`} onClick={() => handleGradePillClick(grade, category)}>
                                Grade {grade}
                            </div>
                        ))}
                    </div>
                    <hr />
                    <div className="groups-checkbox-list">
                        {(selectedGrades[category] || []).flatMap(grade => groupsByGrade[grade] || []).map(group => (
                            <label key={group._id}>
                                <input type="checkbox" checked={permissions[category]?.includes(group._id)} onChange={() => handlePermissionCheckboxChange(group._id, category)} />
                                {group.groupname} (Grade {group.grade})
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

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

            {/* --- Create Assistant Modal --- */}
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
            
            {/* --- Edit Permissions Modal --- */}
            {currentItem && (
                <Modal isOpen={isPermissionsModalOpen} onRequestClose={handleClosePermissionsModal} className="form-modal" overlayClassName="form-modal-overlay">
                    <h2>Permissions for {currentItem.name}</h2>
                    <div>
                        {renderPermissionsCategory('assignments')}
                        {renderPermissionsCategory('exams')}
                        {renderPermissionsCategory('materials')}
                        {renderPermissionsCategory('sessions')}
                        {renderPermissionsCategory('groups')}
                    </div>
                    {submitStatus && <p>{submitStatus}</p>}
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={handleClosePermissionsModal}>Cancel</button>
                        <button type="button" className="save-btn" onClick={handlePermissionsSave} disabled={submitStatus === 'Saving...'}>Save Changes</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Assistants;