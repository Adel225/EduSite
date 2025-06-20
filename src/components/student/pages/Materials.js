// Materials.js
import React, { useState, useEffect } from 'react';
import '../../../styles/exams.css'; // Assuming you might reuse or have specific styles for materials
import { API_URL } from "../../../config.js";

// NEW IMPORTS
import PDFViewer from '../../PDFAnnotationEditor/PDFViewer.js'; // Adjust path if needed
import Modal from 'react-modal';

// If not set globally, set the app element for react-modal
// Modal.setAppElement('#root'); // Or your app's root element ID

const Materials = () => {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // NEW STATE FOR MODAL AND PDF URL TO VIEW
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfUrlToView, setPdfUrlToView] = useState('');
    const [currentMaterialTitle, setCurrentMaterialTitle] = useState(''); // For modal title

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

    // RENAMED and MODIFIED function to open PDF in modal
    const openMaterialInViewer = async (materialId, materialName) => {
        try {
            // Show a temporary loading state for this specific action if desired
            // For now, we rely on the overall page loading state for initial fetch.
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            // The endpoint to get a single material's details including presignedUrl
            // Assuming it's something like /material/:materialId
            const response = await fetch(`${API_URL}/material/${materialId}`, { // Adjusted API_URL usage
                method: 'GET',
                headers: {
                    'Authorization': `MonaEdu ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({})); // Try to parse error
                throw new Error(errData.message || `Failed to fetch material details (status: ${response.status})`);
            }

            const data = await response.json();
            const materialToView = data; 

            if (materialToView && materialToView.presignedUrl) {
                setPdfUrlToView(materialToView.presignedUrl);
                setCurrentMaterialTitle(materialName || 'View Material'); // Use provided name or default
                setIsPdfModalOpen(true);
            } 
            else {
                throw new Error('No presigned URL available for this material.');
            }
        } 
        catch (error) {
            console.error('Error opening material in viewer:', error);
            alert('An error occurred while preparing the material for viewing: ' + error.message);
            // setError('An error occurred while opening the material'); // Or set a specific error state
        }
    };

    const handleClosePdfModal = () => {
        setIsPdfModalOpen(false);
        setPdfUrlToView('');
        setCurrentMaterialTitle('');
    };

    if (loading) return <div className="loading">Loading materials...</div>;
    // Display error prominently if it occurs during initial fetch
    if (error && materials.length === 0) return <div className="error">{error}</div>;


    return (
        <div className="exams-page"> {/* Consider renaming class if styles differ: materials-page */}
            <div className="exams-list"> {/* materials-list */}
                <h2>Available Materials</h2>
                {/* Display error message if materials couldn't be fetched but some might still be shown (e.g. partial load) */}
                {error && materials.length > 0 && <div className="error-inline">{error}</div>}

                {materials.length === 0 && !loading ? ( // Show "No Materials" only if not loading and no error preventing display
                    <div className="no-exams">{error ? error : 'No Materials yet'}</div> // no-materials
                ) : (
                    <div className="exam-cards"> {/* material-cards */}
                        {materials.map((material) => (
                            <div key={material._id} className="exam-card"> {/* material-card */}
                                <h3>{material.name}</h3> {/* Assuming 'name' field, previously was 'title' */}
                                <div className="exam-dates"> {/* material-details */}
                                    <p>{material.description}</p>
                                </div>
                                <button
                                    className="download-btn" // Consider renaming to "view-material-btn" or similar
                                    onClick={() => openMaterialInViewer(material._id, material.name)} // Pass material name
                                >
                                    Open Material
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PDF Viewer Modal */}
            {pdfUrlToView && ( // Only render Modal if pdfUrlToView is set
                <Modal
                    isOpen={isPdfModalOpen}
                    onRequestClose={handleClosePdfModal}
                    contentLabel="View Material PDF"
                    style={{ // Basic modal styling, customize as needed
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
                    <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                        <PDFViewer pdfUrl={pdfUrlToView} />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Materials;