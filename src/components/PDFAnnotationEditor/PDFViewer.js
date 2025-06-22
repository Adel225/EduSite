// PDFViewer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'; // Required for styling, even if layer not rendered
// No TextLayer.css needed if renderTextLayer is false

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

// Basic styling for the viewer
const styles = {
    viewerContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%', // Important for the scroll area to fill its parent
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f8f9fa', // Light background for the whole viewer
        overflow: 'hidden', // Ensures toolbar stays fixed if needed
    },
    toolbar: {
        padding: '8px 12px',
        borderBottom: '1px solid #ddd',
        backgroundColor: '#efefef', // Slightly darker background for toolbar
        textAlign: 'center',
        fontSize: '14px',
        color: '#333',
        flexShrink: 0, // Prevent toolbar from shrinking
    },
    pdfScrollArea: {
        flexGrow: 1, // Takes up remaining space
        overflowY: 'auto', // Enables vertical scrolling for PDF pages
        backgroundColor: '#e9ecef', // Background for the area holding pages
        padding: '10px 0', // Some padding above first and below last page
    },
    pageContainer: {
        margin: '15px auto', // Center pages and add margin between them
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', // Shadow for each page
        width: '100%',
        maxWidth: '100%',
    },
    errorMessage: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#dc3545', // Red color for error
        fontSize: '16px',
    }
};

const PDFViewer = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [currentPageNumber, setCurrentPageNumber] = useState(1); // For display purposes
    const [loadError, setLoadError] = useState(false);
    const [containerWidth, setContainerWidth] = useState(null);
    const containerRef = useRef();

    useEffect(() => {
        function updateWidth() {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        }
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    function onDocumentLoadSuccess({ numPages: nextNumPages }) {
        setNumPages(nextNumPages);
        setLoadError(false); // Reset error on new successful load
        setCurrentPageNumber(1); // Reset to first page
    }

    function onDocumentLoadError(error) {
        console.error('Failed to load PDF document:', error);
        setLoadError(true);
        setNumPages(null); // Clear numPages on error
    }

    // This function is called when a page is visible in the viewport
    // We can use it to update the currentPageNumber display, but it can be a bit complex
    // with IntersectionObserver. For simplicity, react-pdf doesn't directly give current
    // visible page in scroll mode. A simple approach might be to just show total pages.
    // Or, if truly needed, one would implement IntersectionObserver on each <Page>.
    // For this version, let's just show "X of Y" if we only displayed one page at a time.
    // With continuous scroll, "Page X of Y" is less meaningful without complex tracking.
    // So, let's just display "Total Pages: Y" for now.
    // If you want "Page X of Y", we'd need a different approach for scrolling.

    // For continuous scroll, tracking the "current" page is tricky.
    // The toolbar will show total pages. If you want a more dynamic
    // "Page X of Y", it would require IntersectionObserver on each page.
    // For now, let's stick to a simpler display.

    if (loadError) {
        return (
            <div style={{...styles.viewerContainer, ...styles.errorMessage}}>
                Error loading document.
            </div>
        );
    }

    // Responsive margin for mobile
    const pageContainerStyle = {
        ...styles.pageContainer,
        margin: window.innerWidth <= 600 ? '5px 0' : '15px auto',
    };

    return (
        <div style={styles.viewerContainer} ref={containerRef}>
            <div style={styles.toolbar}>
                {numPages ? `Total Pages: ${numPages}` : 'Loading PDF...'}
            </div>
            <div style={styles.pdfScrollArea}>
                <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={<div style={{textAlign: 'center', padding: '20px'}}>Loading document...</div>}
                    noData={<div style={styles.errorMessage}>No PDF file specified.</div>}
                >
                    {Array.from(new Array(numPages || 0), (el, index) => (
                        <div key={`page_container_${index + 1}`} style={pageContainerStyle}>
                            <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                renderAnnotationLayer={false} // No annotations
                                renderTextLayer={false}       // As requested: no text selection
                                width={containerWidth ? Math.min(containerWidth - 16, 800) : undefined}
                                // width can be set to make pages responsive, e.g., fit container width
                                // Or let react-pdf handle default sizing based on its container.
                                // For responsiveness, ensure the parent of PDFViewer is width-constrained.
                            />
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PDFViewer;