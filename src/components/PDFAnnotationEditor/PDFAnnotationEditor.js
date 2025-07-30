// PDFAnnotationEditor.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import * as fabric from 'fabric';
import { API_URL } from '../../config'; 

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

// Basic styling for the component and toolbar (can be moved to a CSS file)
const styles = {
    editorContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    toolbar: {
        padding: '8px 12px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexWrap: 'wrap', // Allow items to wrap on smaller screens
        alignItems: 'center',
        gap: '10px' // Spacing between items
    },
    toolButton: {
        padding: '6px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        transition: 'background-color 0.2s ease',
    },
    activeToolButton: {
        backgroundColor: '#007bff',
        color: 'white',
        borderColor: '#007bff',
    },
    inputGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
    },
    inputField: {
        padding: '6px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    scoreInput: {
        width: '70px',
    },
    notesTextarea: {
        minWidth: '200px', // Give it some base width
        flexGrow: 1, // Allow it to take available space if toolbar wraps
        resize: 'vertical',
    },
    pdfDisplayArea: {
        flexGrow: 1,
        overflowY: 'scroll',
        backgroundColor: '#e9ecef', // Slightly different background for the scroll area
        padding: '10px 0', // Add some vertical padding
    },
    pageContainer: {
        position: 'relative',
        margin: '20px auto',
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', // Enhanced shadow
    },
    fabricCanvasOverlay: {
        position: 'absolute',
        left: '50%',
        top: 0,
        transform: 'translateX(-50%)',
        zIndex: 10 // Ensure it's above react-pdf's page canvas
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // On top of everything
        fontSize: '1.2em',
        color: '#333',
    }
};

const PDFAnnotationEditor = ({
    pdfUrl, 
    submissionId,
    initialAnnotationData, 
    initialScore, 
    onSaveSuccess,
    markType
}) => {
    const [numPages, setNumPages] = useState(null);
    const [fabricCanvases, setFabricCanvases] = useState({});
    const [activeTool, setActiveTool] = useState('pen');
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(5);
    const pageCanvasRefs = useRef({});
    const [score, setScore] = useState('');
    const [internalIsSaving, setInternalIsSaving] = useState(false);


 // Set initial score when component loads
    useEffect(() => {
        if (initialScore !== undefined && initialScore !== null) {
            setScore(String(initialScore));
        }
    }, [initialScore]);

const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    Object.values(fabricCanvases).forEach(canvas => {
        if (canvas && typeof canvas.dispose === 'function') canvas.dispose();
    });
    setFabricCanvases({});
    pageCanvasRefs.current = {};
};

useEffect(() => {
    if (initialAnnotationData && Object.keys(fabricCanvases).length === numPages && numPages > 0) {
        try {
            const parsedData = JSON.parse(initialAnnotationData);
            Object.entries(parsedData).forEach(([pageNum, canvasJSON]) => {
                const canvas = fabricCanvases[pageNum];
                if (canvas) {
                    const callback = () => {
                        canvas.calcOffset();
                        canvas.renderAll();
                    };
                    canvas.loadFromJSON(canvasJSON, callback);
                }
            });
        } catch (error) {
            console.error("Failed to load annotation data:", error);
        }
    }
}, [initialAnnotationData, fabricCanvases, numPages]); // Dependencies are correct

const hexToRgba = useCallback((hex, alpha) => {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || (hex.length !== 7 && hex.length !== 4)) {
        return 'rgba(255, 255, 0, 0.3)';
    }
    let r, g, b;
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
    } else {
        r = parseInt(hex.slice(1, 3), 16); g = parseInt(hex.slice(3, 5), 16); b = parseInt(hex.slice(5, 7), 16);
    }
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 'rgba(255, 255, 0, 0.3)';
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}, []);

// Handle mouse down events for creating textboxes or erasing objects
const handleCanvasMouseDown = useCallback((options, fabricCanvas) => {
    if (!fabricCanvas) return;
    if (activeTool === 'textbox') {
        if (options.target && options.target instanceof fabric.IText) {
            fabricCanvas.setActiveObject(options.target);
            options.target.enterEditing();
            return;
        }
        const pointer = fabricCanvas.getPointer(options.e);
        const text = new fabric.IText('Your Text', {
            left: pointer.x, top: pointer.y, fontFamily: 'arial', fill: color,
            fontSize: 20,
        });
        fabricCanvas.add(text);
        fabricCanvas.setActiveObject(text);
        text.enterEditing();
    } else if (activeTool === 'eraser') {
        if (options.target) {
            fabricCanvas.remove(options.target);
        }
    }
}, [activeTool, color]);

// Effect to configure the active tool on the canvas
useEffect(() => {
    Object.values(fabricCanvases).forEach(canvas => {
        if (canvas) {
            canvas.isDrawingMode = ['pen', 'highlighter'].includes(activeTool);
            canvas.selection = !canvas.isDrawingMode;
            
            if (activeTool === 'pen' || activeTool === 'highlighter') {
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.width = activeTool === 'highlighter' ? parseInt(brushSize, 10) * 3 : parseInt(brushSize, 10);
                canvas.freeDrawingBrush.color = activeTool === 'highlighter' ? hexToRgba(color, 0.3) : color;
            }
            
            canvas.off('mouse:down');
            if (['textbox', 'eraser'].includes(activeTool)) {
                canvas.on('mouse:down', (options) => handleCanvasMouseDown(options, canvas));
            }
        }
    });
}, [activeTool, color, brushSize, fabricCanvases, handleCanvasMouseDown, hexToRgba]);

const initFabricCanvas = (pageNumber, canvasElement, width, height) => {
    if (fabricCanvases[pageNumber]) {
        fabricCanvases[pageNumber].setDimensions({ width, height });
        fabricCanvases[pageNumber].renderAll();
        return;
    }
    if (canvasElement) {
        const fabricCanvasInstance = new fabric.Canvas(canvasElement, { width, height });
        setFabricCanvases(prev => ({ ...prev, [pageNumber]: fabricCanvasInstance }));
    }
};


const handleEraserButtonClick = () => {
    if (activeTool !== 'eraser') {
        setActiveTool('eraser');
        return;
    }

    Object.values(fabricCanvases).forEach(canvas => {
        if (canvas instanceof fabric.Canvas) {
            const activeObject = canvas.getActiveObject();

            if (activeObject) {
                if (activeObject.type === 'activeSelection') {
                    activeObject.forEachObject(obj => {
                        canvas.remove(obj);
                    });
                } else { 
                    canvas.remove(activeObject);
                }
                canvas.discardActiveObject();
                canvas.renderAll();
            }
        }
    });
};


const handleSave = async () => {
    if (!submissionId) {
        alert("Submission ID is missing. Cannot save.");
        return;
    }
    setInternalIsSaving(true);

    // 1. Export the state of all canvases to a single JSON object
    const allCanvasData = {};
    Object.entries(fabricCanvases).forEach(([pageNum, canvas]) => {
        if (canvas) {
            allCanvasData[pageNum] = canvas.toJSON();
        }
    });
    const annotationDataString = JSON.stringify(allCanvasData);

    // 2. Prepare the request body
    const saveData = {
        submissionId: submissionId,
        score: score,
        annotationData: annotationDataString,
    };

    // 3. Make the API Call
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
        alert("Authentication token not found.");
        setInternalIsSaving(false);
        return;
    }

    try {
        const endpoint = markType === 'exam' 
            ? `${API_URL}/exams/mark` 
            : `${API_URL}/assignments/mark`;
            
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Authorization': `MonaEdu ${token}`,
                'Content-Type': 'application/json', // We send JSON now, not FormData
            },
            body: JSON.stringify(saveData),
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || `Server error: ${response.status}`);
        }
        alert(responseData.message || 'Marks and annotations saved successfully!');
        if (onSaveSuccess) {
            onSaveSuccess();
        }
    } catch (err) {
        console.error('Error saving annotations:', err);
        alert(`Error: ${err.message}`);
    } finally {
        setInternalIsSaving(false);
    }
};

const getToolButtonStyle = (toolName) => ({
    ...styles.toolButton,
    ...(activeTool === toolName ? styles.activeToolButton : {}),
});

    return (
        <div style={styles.editorContainer}>
            {internalIsSaving && (
                <div style={styles.loadingOverlay}>Saving... Please wait.</div>
            )}
            <div style={styles.toolbar}>
                <button style={getToolButtonStyle('pen')} onClick={() => setActiveTool('pen')}>Pen</button>
                <button style={getToolButtonStyle('highlighter')} onClick={() => setActiveTool('highlighter')}>Highlight</button>
                <button style={getToolButtonStyle('eraser')} onClick={handleEraserButtonClick}>Eraser</button>
                <button style={getToolButtonStyle('textbox')} onClick={() => setActiveTool('textbox')}>Textbox</button>
                
                <div style={styles.inputGroup}>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ ...styles.inputField, padding: '2px', height: '34px'}} />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="brushSizeInput">Size:</label>
                    <input type="range" id="brushSizeInput" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} style={{ margin: '0 5px' }}/> {brushSize}
                </div>
            </div>
            <div style={{ ...styles.toolbar, borderTop: '1px solid #ddd', justifyContent: 'space-between' }}> {/* Second row for score/notes/save */}
                <div style={styles.inputGroup}>
                    <label htmlFor="scoreInput">Score:</label>
                    <input
                        type="number"
                        id="scoreInput"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        style={{ ...styles.inputField, ...styles.scoreInput }}
                        />
                </div>
                
                <button onClick={handleSave} disabled={internalIsSaving || !numPages} style={styles.toolButton}>
                    {internalIsSaving ? 'Saving...' : 'Save Marked PDF'}
                </button>
            </div>

            <div style={styles.pdfDisplayArea}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={(error) => console.error("Error loading PDF:", error.message)}
                >
                    {Array.from(new Array(numPages || 0), (el, index) => (
                        <div key={`page_container_${index + 1}`} style={styles.pageContainer}>
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                renderAnnotationLayer={false}
                                renderTextLayer={false}
                                onRenderSuccess={(page) => {
                                    const viewport = page.getViewport({ scale: 1 });
                                    const fabricCanvasContainer = document.getElementById(`fabric-canvas-container-${index + 1}`);
                                    if (fabricCanvasContainer) {
                                        let canvasEl = pageCanvasRefs.current[index + 1];
                                        if (!canvasEl) {
                                            canvasEl = document.createElement('canvas');
                                            canvasEl.id = `fabric-actual-canvas-${index + 1}`;
                                            pageCanvasRefs.current[index + 1] = canvasEl;
                                            fabricCanvasContainer.innerHTML = '';
                                            fabricCanvasContainer.appendChild(canvasEl);
                                        }
                                        initFabricCanvas(index + 1, canvasEl, viewport.width, viewport.height);
                                    }
                                }}
                            />
                            <div id={`fabric-canvas-container-${index + 1}`} style={styles.fabricCanvasOverlay}>
                                {/* Canvas element will be dynamically added here */}
                            </div>
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PDFAnnotationEditor;


