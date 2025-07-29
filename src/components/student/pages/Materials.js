// Materials.js
import React, { useState, useEffect } from 'react';
import '../../../styles/exams.css'; // Assuming you might reuse or have specific styles for materials
import { API_URL } from "../../../config.js";

// NEW IMPORTS
import PDFViewer from '../../PDFAnnotationEditor/PDFViewer.js'; 
import Modal from 'react-modal';
// import '../../../styles/materialViewer.css'

// If not set globally, set the app element for react-modal
// Modal.setAppElement('#root'); // Or your app's root element ID

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NEW STATE FOR MODAL AND PDF URL TO VIEW
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfUrlToView, setPdfUrlToView] = useState('');
    const [currentMaterialTitle, setCurrentMaterialTitle] = useState('');
    const [currentFiles, setCurrentFiles] = useState([]); 
    const [Links, setLinks] = useState([]); 
    const [selectedFileIndex, setSelectedFileIndex] = useState(0); 
    const [currentMaterialDescription, setCurrentMaterialDescription] = useState(''); 

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            setLoading(true); // Ensure loading is true at the start
            setError(null);   // Clear previous errors
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/material`, {
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            });
            const data = await response.json();

            if (data.message === "Materials retrieved successfully") {
                setMaterials(data.materials);
            } else if (data.message === "Student has no group assigned") {
                setError('You are not in group yet');
                setMaterials([]); // Clear materials if error
            } else {
                setError(data.message || 'Failed to fetch materials');
                setMaterials([]); // Clear materials if error
            }
        } catch (err) {
            console.error('Error fetching materials:', err); // Log the actual error
            setError('Error loading materials. Please try again.');
            setMaterials([]); // Clear materials on catch
        } finally {
            setLoading(false);
        }
    };

    const openMaterialInViewer = async (materialId, materialName) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/material/${materialId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            });

            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Failed to fetch material details (status: ${response.status})`);
            }
            
            const data = await response.json();
            console.log(data.Links);

            if (data.files && Array.isArray(data.files) && data.files.length > 0) {
                setCurrentFiles(data.files);
                setPdfUrlToView(data.files[0].url);
                setSelectedFileIndex(0);
                setCurrentMaterialTitle(materialName || 'View Material');
                setCurrentMaterialDescription(data.description || ''); 
                setIsPdfModalOpen(true);
                setLinks(data.Links);
            } else {
                throw new Error('No file available for this material.');
            }
        } catch (error) {
            console.error('Error opening material in viewer:', error);
            alert('An error occurred while preparing the material for viewing: ' + error.message);
        }
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfUrlToView('');
        setCurrentMaterialTitle('');
        setCurrentFiles([]);
        setLinks([]);
        setSelectedFileIndex(0);
        setCurrentMaterialDescription(''); 
    };

    if (loading) return <div className="loading">Loading materials...</div>;
    if (error && materials.length === 0) return <div className="error">{error}</div>;


    return (
        <>
            <div className="exams-page"> 
                <div className="exams-list"> 
                    <h2>Available Materials</h2>
                    {error && materials.length > 0 && <div className="error-inline">{error}</div>}

                    {materials.length === 0 && !loading ? ( 
                        <div className="no-exams">{error ? error : 'No Materials yet'}</div> 
                    ) : (
                        <div className="exam-cards"> {/* material-cards */}
                            {materials.map((material) => (
                                <div key={material._id} className="exam-card"> 
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

            {isPdfModalOpen && (
                <Modal
                    isOpen={isPdfModalOpen}
                    onRequestClose={handleClosePdfModal}
                    contentLabel="View Material PDF"
                    style={{ 
                        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 },
                        content: {
                            top: '50%', left: '50%', right: 'auto', bottom: 'auto',
                            marginRight: '-50%', transform: 'translate(-50%, -50%)',
                            width: '90vw', maxWidth: '1000px', height: '90vh',
                            padding: '0', border: 'none', display: 'flex', flexDirection: 'column'
                        }
                    }}
                >
                    <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2em' }}>{currentMaterialTitle}</h2>
                        <button onClick={handleClosePdfModal} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}>×</button>
                    </div>
                    {currentMaterialDescription && (
                        <div style={{ padding: '10px 20px', color: '#34495e', fontSize: '1rem', borderBottom: '1px solid #eee' }}>
                            {currentMaterialDescription}
                        </div>
                    )}

                    {currentFiles.length > 1 && (
                        <div style={{ padding: '10px 20px', borderBottom: '1px solid #eee', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {currentFiles.map((file, idx) => (
                                <button
                                    key={idx}
                                    style={{
                                        background: idx === selectedFileIndex ? '#3498db' : '#f4f4f4',
                                        color: idx === selectedFileIndex ? 'white' : '#333',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        padding: '6px 12px',
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}
                                    onClick={() => {
                                        setPdfUrlToView(file.url);
                                        setSelectedFileIndex(idx);
                                    }}
                                >
                                    {file.originalName || `File ${idx + 1}`}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="resource-section">
                        <h3>Links</h3>
                        {Links && Links.length > 0 ? (
                            <ul className="resource-list" >
                                {Links.map((link, idx) => (
                                    <li key={idx} className="resource-item link-item">
                                        <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-resources-message">No links provided.</p>
                        )}
                    </div>

                    <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                        <PDFViewer pdfUrl={pdfUrlToView} />
                    </div>
                </Modal>
            )}
        
        </>
    );
};

export default Materials;