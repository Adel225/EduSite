// src/components/PDFAnnotationEditor/MarkedPDFViewer.js
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import * as fabric from 'fabric';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

const styles = {
    // These styles are now scoped to the component, not the full page
    viewerContainer: { height: '100%', width: '100%', overflowY: 'auto', backgroundColor: '#e9ecef' },
    pageContainer: { position: 'relative', margin: '20px auto', display: 'flex', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
    fabricCanvasOverlay: { position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)' },
    loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '1.5rem', color: '#555' }
};

const MarkedPDFViewer = ({ pdfUrl, annotationData, onClose }) => {
    const [numPages, setNumPages] = useState(null);
    const fabricCanvasesRef = useRef({});

    const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
        setNumPages(nextNumPages);
        fabricCanvasesRef.current = {};
    };
    
    const loadAnnotations = (canvases) => {
        if (!annotationData) return;
        try {
            const parsedData = JSON.parse(annotationData);
            Object.entries(parsedData).forEach(([pageNum, canvasJSON]) => {
                const canvas = canvases[pageNum];
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
    };
    
    const initFabricCanvas = (pageNumber, canvasElement, width, height) => {
        if (fabricCanvasesRef.current[pageNumber] || !canvasElement) return;
        const canvas = new fabric.StaticCanvas(canvasElement, { width, height });
        fabricCanvasesRef.current[pageNumber] = canvas;

        if (numPages && Object.keys(fabricCanvasesRef.current).length === numPages) {
            loadAnnotations(fabricCanvasesRef.current);
        }
    };

    if (!pdfUrl) return <div style={styles.loading}>Loading viewer...</div>;

    return (
        <div style={styles.viewerContainer}>
            <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={console.error}>
                {Array.from(new Array(numPages || 0), (el, index) => (
                    <div key={`page_container_${index + 1}`} style={styles.pageContainer}>
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            renderAnnotationLayer={false}
                            renderTextLayer={false}
                            onRenderSuccess={(page) => {
                                const viewport = page.getViewport({ scale: 1.5 });
                                const canvasEl = document.createElement('canvas');
                                const container = document.getElementById(`fabric-viewer-container-${index + 1}`);
                                if (container) {
                                    container.innerHTML = '';
                                    container.appendChild(canvasEl);
                                    initFabricCanvas(index + 1, canvasEl, viewport.width, viewport.height);
                                }
                            }}
                            scale={1.5}
                        />
                        <div id={`fabric-viewer-container-${index + 1}`} style={styles.fabricCanvasOverlay} />
                    </div>
                ))}
            </Document>
        </div>
    );
};

export default MarkedPDFViewer;