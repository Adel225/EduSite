
    import React, { useState, useEffect, useCallback } from 'react';
    import { useParams , useNavigate , useLocation } from 'react-router-dom';
    import '../../styles/sessionDetails.css';
    const API_URL = process.env.REACT_APP_API_URL;

    const SessionDetails = () => {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [availableExams, setAvailableExams] = useState([]);
    const [availableAssignments, setAvailableAssignments] = useState([]);
    const [availableMaterials, setAvailableMaterials] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const [linkedItems, setLinkedItems] = useState({
        exams: new Set(),
        assignments: new Set(),
        materials: new Set(),
    });

    const [initialLinkedItems, setInitialLinkedItems] = useState({
        exams: new Set(),
        assignments: new Set(),
        materials: new Set(),
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchSessionDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        // 1. Fetch the session itself
        const sessionRes = await fetch(`${API_URL}/sections/${sessionId}`, {
            headers: { 'Authorization': `MonaEdu ${token}` },
        });
        if (!sessionRes.ok) throw new Error('Failed to fetch session details.');
        const sessionData = await sessionRes.json();
        
        if(sessionData.message !== "Section content fetched successfully.") {
            throw new Error(sessionData.message || "Could not fetch session data");
        }
        
        setSession(sessionData.data);
        
        const gradeId = sessionData.data.gradeId;
        const initialExams = new Set();
        const initialAssignments = new Set();
        const initialMaterials = new Set();
        
        // Loop through the single 'content' array and sort items by their type
        sessionData.data.content.forEach(item => {
            if (item.type === 'exam') {
                initialExams.add(item.id);
            } 
            else if (item.type === 'assignment') {
                initialAssignments.add(item.id);
            } 
            else if (item.type === 'material') {
                initialMaterials.add(item.id);
            }
        });

        // Now, set the state with the correctly populated sets
        setLinkedItems({ 
            exams: new Set(initialExams), 
            assignments: new Set(initialAssignments), 
            materials: new Set(initialMaterials) 
        });
        setInitialLinkedItems({ 
            exams: new Set(initialExams), 
            assignments: new Set(initialAssignments), 
            materials: new Set(initialMaterials) 
        });

        // 2. Fetch all available items for that grade
        const [examsRes, assignmentsRes, materialsRes] = await Promise.all([
            fetch(`${API_URL}/exams?gradeId=${gradeId}`, { headers: { 'Authorization': `MonaEdu ${token}` } }),
            fetch(`${API_URL}/assignments/all?gradeId=${gradeId}`, { headers: { 'Authorization': `MonaEdu ${token}` } }),
            fetch(`${API_URL}/material?gradeId=${gradeId}`, { headers: { 'Authorization': `MonaEdu ${token}` } }),
        ]);

        const examsData = await examsRes.json();
        const assignmentsData = await assignmentsRes.json();
        const materialsData = await materialsRes.json();

        setAvailableExams(examsData.exams || []);
        setAvailableAssignments(assignmentsData.assignments || []);
        setAvailableMaterials(materialsData.materials || []);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [sessionId, location.state]);

    useEffect(() => {
        fetchSessionDetails();
    }, [fetchSessionDetails]);

    const handleLinkToggle = (itemId, itemType) => {
        setLinkedItems(prev => {
        const newSet = new Set(prev[itemType]);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        return { ...prev, [itemType]: newSet };
        });
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        
        const currentExams = linkedItems.exams;
        const initialExams = initialLinkedItems.exams;
        const examsToAdd = [...currentExams].filter(id => !initialExams.has(id));
        const examsToRemove = [...initialExams].filter(id => !currentExams.has(id));

        const currentAssignments = linkedItems.assignments;
        const initialAssignments = initialLinkedItems.assignments;
        const assignmentsToAdd = [...currentAssignments].filter(id => !initialAssignments.has(id));
        const assignmentsToRemove = [...initialAssignments].filter(id => !currentAssignments.has(id));
        
        const currentMaterials = linkedItems.materials;
        const initialMaterials = initialLinkedItems.materials;
        const materialsToAdd = [...currentMaterials].filter(id => !initialMaterials.has(id));
        const materialsToRemove = [...initialMaterials].filter(id => !currentMaterials.has(id));

        const itemsToAdd = [
            ...examsToAdd.map(id => ({ type: 'exam', id })),
            ...assignmentsToAdd.map(id => ({ type: 'assignment', id })),
            ...materialsToAdd.map(id => ({ type: 'material', id })),
        ];
        
        const itemsToRemove = [
            ...examsToRemove.map(id => ({ type: 'exam', id })),
            ...assignmentsToRemove.map(id => ({ type: 'assignment', id })),
            ...materialsToRemove.map(id => ({ type: 'material', id })),
        ];
        
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/sections/${sessionId}/update-links`, {
                method: 'PUT',
                headers: {
                    'Authorization': `MonaEdu ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemsToAdd, itemsToRemove }),
            });
            
            const result = await response.json();
            if (!response.ok) {
                if (result.message === 'No valid items provided to add or remove.') {
                    alert('No changes to save.');
                    return;
                }
                throw new Error(result.message || 'Failed to save changes.');
            }

            alert('Session updated successfully!');
            fetchSessionDetails();

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSessionFromDetails = async () => {
        if (window.confirm('Are you sure you want to permanently delete this session? This will not delete the linked items, but it will remove the session itself.')) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await fetch(`${API_URL}/sections/${sessionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `MonaEdu ${token}` },
                });
        
                if (!response.ok) {
                throw new Error('Failed to delete session');
                }
        
                alert('Session deleted successfully.');
                navigate('/dashboard/sessions');
            } 
            catch (err) {
                console.error('Error deleting session:', err);
                alert('An error occurred while deleting the session.');
            }
            }
        };


    if (loading) return <div className="loading">Loading Session Details...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!session) return <div className="loading">No session data found.</div>;

    const renderItemList = (items, itemType, title) => (
        <div className="items-column">
        <h3>{title}</h3>
        <ul className="items-list">
            {items.length > 0 ? items.map(item => {
            const isLinked = linkedItems[itemType].has(item._id);
            return (
                <li key={item._id} className={`item-card ${isLinked ? 'linked' : ''}`}>
                <div className="item-info">
                    <div className="item-name">{item.name || item.Name}</div>
                    {itemType === 'exams' && (
                        <div className="item-meta">
                        {item.startdate && <span>Start: {new Date(item.startdate).toLocaleString()}</span>}
                        {item.startdate && item.enddate && <span> | </span>}
                        {item.enddate && <span>End: {new Date(item.enddate).toLocaleString()}</span>}
                        </div>
                    )}
                    {itemType === 'assignments' && (
                        <div className="item-meta">
                        {item.startDate && <span>Start: {new Date(item.startDate).toLocaleString()}</span>}
                        {item.startDate && item.endDate && <span> | </span>}
                        {item.endDate && <span>End: {new Date(item.endDate).toLocaleString()}</span>}
                        </div>
                    )}
                    </div>
                <button
                    className={`link-button ${isLinked ? 'remove' : 'add'}`}
                    onClick={() => handleLinkToggle(item._id, itemType)}
                >
                    {isLinked ? 'Unlink' : 'Link'}
                </button>
                </li>
            );
            }) : <p>No {itemType} available for this grade.</p>}
        </ul>
        </div>
    );

    return (
        <div className="session-details-page">
        <div className="session-header">
            {/* This div now correctly wraps just the title and the button */}
            <div className="session-title-header">
                <h2 className="session-name">{session.name}</h2>
                <button
                    className="delete-session-btn"
                    onClick={handleDeleteSessionFromDetails}
                >
                    Delete Session
                </button>
            </div>
            
        </div>
        <p className="session-description">{session.description}</p>

        <div className="linking-container">
            {renderItemList(availableAssignments, 'assignments', 'Available Assignments')}
            {renderItemList(availableExams, 'exams', 'Available Exams')}
            {renderItemList(availableMaterials, 'materials', 'Available Materials')}
        </div>
        
        <div className="actions-footer">
            <button onClick={handleSaveChanges} disabled={isSaving} className="save-button">
            {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
        </div>
    );
    };

    export default SessionDetails;
