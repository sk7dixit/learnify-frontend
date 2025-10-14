// src/components/SecurePdfViewer.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const SecurePdfViewer = ({ noteId }) => {
  const { user } = useAuth();
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0); // State for zoom
  const [isWindowFocused, setIsWindowFocused] = useState(true); // State for anti-screenshot blur

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  // **THE FIX IS HERE: Zoom functions**
  const zoomIn = () => setScale(prevScale => prevScale < 2.0 ? prevScale + 0.2 : prevScale);
  const zoomOut = () => setScale(prevScale => prevScale > 0.4 ? prevScale - 0.2 : prevScale);

  const goToPrevPage = () => setPageNumber(prev => (prev > 1 ? prev - 1 : prev));
  const goToNextPage = () => setPageNumber(prev => (prev < numPages ? prev + 1 : prev));

  useEffect(() => {
    // Anti-screenshot: Blur content when user switches windows
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    const fetchPdf = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await api.get(`/notes/view/${noteId}`, { responseType: 'blob' });

        if (response.data.type !== 'application/pdf') {
          throw new Error("Server did not return a valid PDF file.");
        }

        setPdfFile(response.data);

      } catch (err) {
        setError(err.message || "Access Denied: Could not fetch the note.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPdf();

    return () => {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
    };
  }, [noteId]);

  if (isLoading) {
    return <div className="p-4 text-center text-gray-400">Fetching document...</div>;
  }

  if (error || !pdfFile) {
    return (
        <div className="p-8 text-center bg-gray-700 rounded-lg">
            <h3 className="text-2xl font-bold text-red-500 mb-4">Error Loading Note</h3>
            <p className="text-gray-300 mb-6">{error || "PDF file could not be loaded."}</p>
        </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full w-full bg-gray-700 items-center"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      {/* Custom PDF Controls with Zoom */}
      <div className="w-full bg-gray-800 p-2 flex justify-center items-center gap-4 text-white sticky top-0 z-10">
        <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Prev</button>
        <span>Page {pageNumber} of {numPages || '--'}</span>
        <button onClick={goToNextPage} disabled={!numPages || pageNumber >= numPages} className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Next</button>

        <div className="ml-auto flex items-center gap-2">
            <button onClick={zoomOut} className="px-3 py-1 bg-gray-600 rounded">-</button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="px-3 py-1 bg-gray-600 rounded">+</button>
        </div>

        {user?.role === 'admin' && (
           <a href={URL.createObjectURL(pdfFile)} download={`note-${noteId}.pdf`} className="ml-4 px-3 py-1 bg-green-600 rounded">
             Download (Admin)
           </a>
        )}
      </div>

      <div className={`flex-grow w-full overflow-auto flex justify-center transition-all duration-300 ${!isWindowFocused && user.role !== 'admin' ? 'blur-lg' : ''}`}>
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setError(`Failed to render PDF: ${err.message}`)}
          loading={<div className="text-white p-4">Rendering PDF...</div>}
        >
          <Page pageNumber={pageNumber} scale={scale} />
        </Document>
      </div>
    </div>
  );
};

export default SecurePdfViewer;