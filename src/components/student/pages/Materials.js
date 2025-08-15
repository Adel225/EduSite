// src/components/student/pages/Materials.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { API_URL } from "../../../config.js";
import PDFViewer from '../../PDFAnnotationEditor/PDFViewer.js'; 
import '../../../styles/exams.css'; // For main page card layout
import '../../../styles/materialViewer.css'; // For the modal

Modal.setAppElement('#root');

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the modal
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [pdfUrlToView, setPdfUrlToView] = useState('');
    const [mobileModalView, setMobileModalView] = useState('info'); 

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/material`, { headers: { 'Authorization': `MonaEdu ${token}` } });
            const data = await response.json();
            if (data.message === "Materials retrieved successfully") {
                setMaterials(data.materials);
            } else {
                setError(data.message || 'Failed to fetch materials');
                setMaterials([]);
            }
        } catch (err) {
            setError('Error loading materials. Please try again.');
            setMaterials([]);
        } finally {
            setLoading(false);
        }
    };

    const openMaterialInViewer = async (materialId) => {
        setIsPdfModalOpen(true);
        setModalLoading(true);
        setMobileModalView('info'); // Default to info view
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/material/${materialId}`, { headers: { 'Authorization': `MonaEdu ${token}` } });
            if (!response.ok) throw new Error(`Failed to fetch material details`);
            
            const data = await response.json();
            setSelectedMaterial(data);

            if (data.files && Array.isArray(data.files) && data.files.length > 0) {
                setPdfUrlToView(data.files[0].url);
            } else {
                setPdfUrlToView(''); // No PDF to view initially
            }
        } catch (error) {
            alert('An error occurred: ' + error.message);
            setIsPdfModalOpen(false); // Close modal on error
        } finally {
            setModalLoading(false);
        }
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfUrlToView('');
        setSelectedMaterial(null);
    };

    if (loading) return <div className="loading">Loading materials...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <>
            <div className="exams-page"> 
                <div className="exams-list"> 
                    <h2>Available Materials</h2>
                    {error && materials.length > 0 && <div className="error-inline">{error}</div>}

                    {materials.length === 0 && !loading ? ( 
                        <div className="no-exams">{error ? error : 'No Materials yet'}</div> 
                    ) : (
                        <div className="material-grid"> {/* material-cards */}
                            {materials.map((material) => (
                                <div key={material._id} className="student-exam-card"> 
                                    <h3>{material.name}</h3> 
                                    <div className="exam-dates"> 
                                        <p>{material.description}</p>
                                    </div>
                                    <button
                                        className="download-btn" 
                                        onClick={() => openMaterialInViewer(material._id, material.name)}
                                    >
                                        Open Material
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isPdfModalOpen}
                onRequestClose={handleClosePdfModal}
                contentLabel="View Material"
                className="material-modal"
                overlayClassName="material-modal-overlay"
            >
                {modalLoading ? <div className="loading">Loading...</div> : (
                    selectedMaterial && (
                        <>
                            <div className="material-modal-header">
                                <h2>{selectedMaterial.name}</h2>
                                <button onClick={handleClosePdfModal} className="close-modal-btn">×</button>
                            </div>
                            
                            <div className="material-modal-body">
                                <div className={`content-sidebar ${mobileModalView === 'info' ? 'active' : ''}`}>
                                    <p className="material-description">{selectedMaterial.description}</p>
                                    
                                    <div className="resource-section">
                                        <h3>Files</h3>
                                        {selectedMaterial.files && selectedMaterial.files.length > 0 ? (
                                            <ul className="resource-list">
                                                {selectedMaterial.files.map((file, idx) => (
                                                    <li key={idx} className="resource-item">
                                                        <button className={pdfUrlToView === file.url ? 'active' : ''} onClick={() => setPdfUrlToView(file.url)}>
                                                            {file.originalName || `File ${idx + 1}`}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="no-resources-message">No files provided.</p>}
                                    </div>

                                    <div className="resource-section">
                                        <h3>Links</h3>
                                        {selectedMaterial.Links && selectedMaterial.Links.length > 0 ? (
                                            <ul className="resource-list">
                                                {selectedMaterial.Links.map((link, idx) => (
                                                    <li key={idx} className="resource-item link-item">
                                                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="no-resources-message">No links provided.</p>}
                                    </div>
                                </div>
                                
                                <div className={`pdf-viewer-main ${mobileModalView === 'pdf' ? 'active' : ''}`}>
                                    {pdfUrlToView ? <PDFViewer pdfUrl={pdfUrlToView} /> : <div className="loading">No PDF to display.</div>}
                                </div>
                            </div>

                            <div className="mobile-view-switcher">
                                <button className={mobileModalView === 'info' ? 'active' : ''} onClick={() => setMobileModalView('info')}>Info</button>
                                <button className={mobileModalView === 'pdf' ? 'active' : ''} onClick={() => setMobileModalView('pdf')}>PDF Viewer</button>
                            </div>
                        </>
                    )
                )}
            </Modal>
        </>
    );
};

export default Materials;