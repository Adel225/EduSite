import React, { useState, useEffect, useMemo  } from 'react';
import { useAuth } from '../../utils/AuthContext';
import Modal from 'react-modal';
import PDFViewer from '../PDFAnnotationEditor/PDFViewer';
import '../../styles/materials.css';
import '../../styles/materialViewer.css';
const API_URL = process.env.REACT_APP_API_URL;

Modal.setAppElement('#root');

const Materials = () => {
  // State for the main page view
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [gradeId, setGradeId] = useState(''); // Correctly holds the grade ID for the selected grade
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [error, setError] = useState(null);
  const [submitStatus, setSubmitStatus] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // State for the static form on the right
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    files: null,
    links: [''],
    publishDate: '' ,
  });

  // State for the "View Material" modal
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedMaterialForViewing, setSelectedMaterialForViewing] = useState(null);
  const [pdfUrlToView, setPdfUrlToView] = useState('');

  const grades = [6,7,8,9,10,11,12];

  const { user } = useAuth(); // Get the user from the global context

  // --- HIGHLIGHT: Process assistant permissions for MATERIALS ---
  const assistantPermissions = useMemo(() => {
    if (user?.role !== 'assistant') return null;
    const permissions = {
        allowedGradeNumbers: new Set(),
        allowedGroupIds: new Set(),
    };
    // Specifically read from the 'materials' permission category
    user.permissions?.materials?.forEach(p => {
        permissions.allowedGradeNumbers.add(p.grade);
        permissions.allowedGroupIds.add(p.groupId);
    });
    return {
        ...permissions,
        allowedGradeNumbers: Array.from(permissions.allowedGradeNumbers).sort((a, b) => a - b),
    };
  }, [user]);

  // --- HIGHLIGHT: Create the lists that the UI will actually render ---
  const displayedGrades = assistantPermissions ? assistantPermissions.allowedGradeNumbers : grades;
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
        if (data.groups.length > 0) {
          setGradeId(data.groups[0].gradeid); // Set the grade ID for the form
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
    setSelectedGroups([]); // Reset selected groups when grade changes
    if (grade) {
      fetchGroups(grade);
    } else {
      setGroups([]);
    }
  };

  // const handleModalGradeChange = (e) => {
  //   const grade = e.target.value;
  //   setFormData(prev => ({ ...prev, modalGrade: grade, modalGroups: [] }));
  //   if (grade) {
  //     fetchGroups(grade, true);
  //   } else {
  //     setGroups([]);
  //   }
  // };

  const handleGroupClick = async (groupId) => {
    setSelectedGroupId(groupId);
    setLoadingMaterials(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/material/group/${groupId}`, { headers: { 'Authorization': `MonaEdu ${token}` } });
      const data = await response.json();
      if (data.message === "Materials fetched successfully for the group.") {
        setMaterials(data.data || []);
      } else {
        setMaterials([]);
      }
    } catch (err) {
      setError('Error loading materials');
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleLinkChange = (index, event) => {
    const newLinks = [...formData.links];
    newLinks[index] = event.target.value;
    setFormData({ ...formData, links: newLinks });
  };
  const addLinkInput = () => setFormData(prev => ({ ...prev, links: [...prev.links, ''] }));
  const removeLinkInput = (index) => setFormData(prev => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));
  
  const openMaterialInViewer = async (materialId) => {
    setIsViewerModalOpen(true);
    setModalLoading(true);
    try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await fetch(`${API_URL}/material/${materialId}`, { headers: { 'Authorization': `MonaEdu ${token}` } });
        if (!response.ok) throw new Error('Failed to fetch material details');
        const data = await response.json();
        setSelectedMaterialForViewing(data);
        if (data.files && data.files.length > 0) {
            setPdfUrlToView(data.files[0].url);
        } else {
            setPdfUrlToView('');
        }
    } catch (error) {
        alert('An error occurred: ' + error.message);
        setIsViewerModalOpen(false);
    } finally {
        setModalLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    // This function also remains the same
  if (window.confirm('Are you sure you want to delete this material?')) {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_URL}/material/${materialId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `MonaEdu ${token}` }
      });
      const data = await response.json();
      if (data.message === "Material deleted successfully") {
        if (selectedGroupId) handleGroupClick(selectedGroupId);
      } else {
        setError('Failed to delete material');
      }
    } catch (err) {
      console.error('Error deleting material:', err);
      setError('Error deleting material');
    }
  }
};

  const handleCloseViewerModal = () => {
      setIsViewerModalOpen(false);
      setSelectedMaterialForViewing(null);
      setPdfUrlToView('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGrade || selectedGroups.length === 0) {
        setError('Please select a grade and at least one group.');
        return;
    }
    setError(null);
    setSubmitStatus('Preparing to upload...');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    try {
      let uploadedFilesData = [];
      if (formData.files && formData.files.length > 0) {
        setSubmitStatus(`Uploading ${formData.files.length} file(s)...`);
        const uploadPromises = Array.from(formData.files).map(async (file) => {
          const getUrlResponse = await fetch(`${API_URL}/material/generate-upload-url`, {
            method: 'POST',
            headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, fileType: file.type, materialName: file.name }),
          });
          if (!getUrlResponse.ok) throw new Error(`Could not get upload URL for ${file.name}.`);
          const { uploadUrl, s3Key } = await getUrlResponse.json();
          const uploadResponse = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
          if (uploadResponse.status !== 200) throw new Error(`Failed to upload ${file.name}.`);
          const cleanPath = new URL(uploadUrl).origin + new URL(uploadUrl).pathname;
          return { key: s3Key, path: cleanPath, originalName: file.name, fileType: file.type };
        });
        uploadedFilesData = await Promise.all(uploadPromises);
      }

      setSubmitStatus('Finalizing material...');
      const materialPayload = {
        name: formData.name,
        description: formData.description,
        gradeId: gradeId, 
        groupIds: selectedGroups, 
        linksArray: formData.links.filter(link => link.trim() !== ''),
        files: uploadedFilesData,
        publishDate: formData.publishDate,
      };
      
      const createResponse = await fetch(`${API_URL}/material/create`, {
        method: 'POST',
        headers: { 'Authorization': `MonaEdu ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(materialPayload),
      });
      const result = await createResponse.json();
      if (!createResponse.ok) throw new Error(result.message || 'Failed to create material.');
      
      setSubmitStatus('Material created successfully!');
      // Reset form after successful submission
      setFormData({ name: '', description: '', files: null, links: [''] });
      setSelectedGroups([]);
      document.getElementById('material-files-input').value = null; // Clear file input
      if (selectedGroupId) handleGroupClick(selectedGroupId); // Refresh list

    } catch (err) {
      console.error('Upload process failed:', err);
      setError(err.message);
      setSubmitStatus('');
    }
  };

  return (
    <>
      <div className="materials-page">

        <div className="materials-left">
            <h2>Select Grade</h2>
            <div className="grades-list">
                {displayedGrades.map((grade) => ( <div key={grade} className={`grade-card ${selectedGrade === grade ? 'selected' : ''}`} onClick={() => handleGradeChange({ target: { value: grade } })}><h3>Grade {grade}</h3></div> ))}
            </div>
            {selectedGrade && (
                <div className="groups-section">
                <h3>Groups in Grade {selectedGrade}</h3>
                {loadingGroups ? <div className="loading">Loading...</div> : (
                    <div className="groups-list">
                        {displayedGroups.map((group) => ( <div key={group._id} className={`group-item ${selectedGroupId === group._id ? 'selected' : ''}`} onClick={() => handleGroupClick(group._id)}>{group.groupname}</div> ))}
                    </div>
                )}
                </div>
            )}
            {selectedGroupId && (
                <div className="materials-section">
                    <h3>Materials</h3>
                    {loadingMaterials ? <div className="loading">Loading...</div> : (
                        <ul className="materials-list">
                            {materials.length > 0 ? materials.map((material) => (
                                <li key={material._id} className="material-card">
                                    <div className="material-info">
                                        <span className="material-name">{material.name}</span>
                                        <span className="material-description">{material.description}</span>
                                    </div>
                                    <div className="material-actions">
                                        <button className="view-button" onClick={() => openMaterialInViewer(material._id)}>View</button>
                                        <button className="delete-button" onClick={() => handleDeleteMaterial(material._id)}>Delete</button>
                                    </div>
                                </li>
                            )) : <p>No materials found for this group.</p>}
                        </ul>
                    )}
                </div>
            )}
        </div>

        <div className="upload-material">
          <h2>Upload new Material</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Grade:</label>
              <select value={selectedGrade} onChange={handleGradeChange} required>
                <option value="">Choose grade</option>
                {displayedGrades.map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Groups:</label>
              <div className="groups-select-container">
                <div className="select-all-row">
                  <label><input type="checkbox" checked={selectedGroups.length === groups.length && groups.length > 0} onChange={() => setSelectedGroups(selectedGroups.length === groups.length ? [] : displayedGroups.map(g => g._id))} /> Select All Groups</label>
                </div>
                <div className="groups-divider" />
                <div className="groups-checkbox-list">
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
            </div>
            <div className="form-group"><label>Material Name:</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
            <div className="form-group"><label>Description:</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required /></div>
            <div className="form-group">
            <label>Publish Date and Time:</label>
            <input 
              type="datetime-local" 
              value={formData.publishDate}
              onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
              required
            />
          </div>
            <div className="form-group"><label>Material Files (can select multiple):</label><input type="file" id="material-files-input" multiple onChange={(e) => setFormData({...formData, files: e.target.files})} /></div>
            <div className="form-group">
              <label>YouTube Links:</label>
              {formData.links.map((link, index) => (
                <div key={index} className="link-input-group">
                  <input type="url" placeholder="https://example.com/..." value={link} onChange={(e) => handleLinkChange(index, e)} />
                  {formData.links.length > 1 && (<button type="button" className="remove-link-btn" onClick={() => removeLinkInput(index)}>×</button>)}
                </div>
              ))}
              <button type="button" className="add-link-btn" onClick={addLinkInput}>+ Add another link</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            {submitStatus && <div className="submit-status">{submitStatus}</div>}
            <button type="submit" disabled={submitStatus.includes('...')}>{submitStatus.includes('...') ? submitStatus : 'Submit'}</button>
          </form>
        </div>
      </div>


      <Modal isOpen={isViewerModalOpen} onRequestClose={handleCloseViewerModal} contentLabel="View Material" className="material-modal" overlayClassName="material-modal-overlay">
        {modalLoading ? <div className="loading">Loading...</div> : ( selectedMaterialForViewing && ( <>
            <div className="material-modal-header"> <h2>{selectedMaterialForViewing.name}</h2> <button onClick={handleCloseViewerModal} className="close-modal-btn">×</button> </div>
            <div className="material-modal-body">
              <div className="content-sidebar">
                <p className="material-description">{selectedMaterialForViewing.description}</p>
                <div className="resource-section">
                  <h3>Files</h3>
                  {selectedMaterialForViewing.files && selectedMaterialForViewing.files.length > 0 ? (
                    <ul className="resource-list">
                      {selectedMaterialForViewing.files.map((file, idx) => ( <li key={idx} className="resource-item"> <button className={pdfUrlToView === file.url ? 'active' : ''} onClick={() => setPdfUrlToView(file.url)}> {file.originalName || `File ${idx + 1}`} </button> </li> ))}
                    </ul>
                  ) : <p className="no-resources-message">No files provided.</p>}
                </div>
                <div className="resource-section">
                  <h3>Links</h3>
                  {selectedMaterialForViewing.Links && selectedMaterialForViewing.Links.length > 0 ? (
                    <ul className="resource-list">
                      {selectedMaterialForViewing.Links.map((link, idx) => ( <li key={idx} className="resource-item link-item"> <a href={link} target="_blank" rel="noopener noreferrer">{link}</a> </li> ))}
                    </ul>
                  ) : <p className="no-resources-message">No links provided.</p>}
                </div>
              </div>
              <div className="pdf-viewer-main"> {pdfUrlToView ? <PDFViewer pdfUrl={pdfUrlToView} /> : <div className="loading">No PDF to display.</div>} </div>
            </div>
          </>
        ))}
      </Modal>
    </>
  );
};

export default Materials;
