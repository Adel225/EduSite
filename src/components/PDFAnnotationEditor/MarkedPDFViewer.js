// src/components/PDFAnnotationEditor/MarkedPDFViewer.js
import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import * as fabric from 'fabric';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

const styles = {
viewerContainer: {
    height: '100%',
    width: '100%',
    overflowY: 'auto',
    backgroundColor: '#e9ecef',
},
pageContainer: {
    position: 'relative',
    margin: '20px auto',
    display: 'flex',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
},
fabricCanvasOverlay: {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: 'translateX(-50%)',
    zIndex: 10, // make sure annotations sit above the PDF page
},
loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    fontSize: '1.5rem',
    color: '#555',
},
};

const MarkedPDFViewer = ({ pdfUrl, annotationData }) => {
const [numPages, setNumPages] = useState(null);
const [pageDimensions, setPageDimensions] = useState({});
const [fabricCanvases, setFabricCanvases] = useState({});
const canvasMountedRef = useRef({}); // tracks which <canvas> DOM nodes exist

// Reset on new document
const onDocumentLoadSuccess = ({ numPages: nextNumPages }) => {
    setNumPages(nextNumPages);
    setPageDimensions({});
    // dispose previous canvases
    Object.values(fabricCanvases).forEach((c) => {
    if (c && typeof c.dispose === 'function') c.dispose();
    });
    setFabricCanvases({});
    canvasMountedRef.current = {};
};

// 1) After ALL pages report their dimensions, create Fabric canvases
useEffect(() => {
    if (!numPages) return;
    if (Object.keys(pageDimensions).length !== numPages) return;

    const next = {};
    for (let i = 1; i <= numPages; i++) {
    const el = document.getElementById(`viewer-fabric-canvas-${i}`);
    if (el && !fabricCanvases[i]) {
        const { width, height } = pageDimensions[i];
        next[i] = new fabric.Canvas(el, { width, height });
    } else if (fabricCanvases[i]) {
        next[i] = fabricCanvases[i];
    }
    }
    if (Object.keys(next).length) setFabricCanvases(next);
}, [numPages, pageDimensions]); // mirrors the editor's flow

// 2) Load annotation JSON once canvases exist for all pages
useEffect(() => {
    if (!annotationData) return;
    if (!numPages) return;
    if (Object.keys(fabricCanvases).length !== numPages) return;

    let parsed = null;
    try {
    parsed = JSON.parse(annotationData);
    } catch (e) {
    console.error('Invalid annotationData JSON:', e);
    return;
    }

    // For each page with saved JSON, load into its Fabric canvas
    const loads = Object.entries(parsed).map(async ([pageNum, canvasJSON]) => {
    const canvas = fabricCanvases[pageNum];
    if (!canvas) return;
    try {
        // Fabric v6: loadFromJSON returns a Promise
        await canvas.loadFromJSON(canvasJSON);
        // Ensure objects are visible and force paint next frame
        requestAnimationFrame(() => {
        canvas.getObjects().forEach((obj) => {
            if (obj.opacity === 0 || obj.visible === false) {
            obj.opacity = 1;
            obj.visible = true;
            }
        });
        canvas.renderAll();
        });
    } catch (err) {
        console.error(`Failed to load annotations for page ${pageNum}:`, err);
    }
    });

    Promise.all(loads).catch((e) => console.error('Annotation load error:', e));
}, [annotationData, numPages, fabricCanvases]);

if (!pdfUrl) return <div style={styles.loading}>Loading PDF...</div>;

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
            // Important: capture the rendered (scaled) width/height
            onRenderSuccess={(page) => {
                setPageDimensions((prev) => ({
                ...prev,
                [index + 1]: { width: page.width, height: page.height },
                }));
            }}
            // Do NOT set scale here unless you also scale the Fabric canvases accordingly
            // scale={1.0}
            />
            <div style={styles.fabricCanvasOverlay}>
            {pageDimensions[index + 1] && (
                <canvas
                id={`viewer-fabric-canvas-${index + 1}`}
                width={pageDimensions[index + 1].width}
                height={pageDimensions[index + 1].height}
                />
            )}
            </div>
        </div>
        ))}
    </Document>
    </div>
);
};

export default MarkedPDFViewer;
