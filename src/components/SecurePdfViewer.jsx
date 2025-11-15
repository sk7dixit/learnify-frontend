// src/components/SecurePdfViewer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

const FREE_PAGE_LIMIT = 3;

// --- Component to render the paywall overlay ---
const PaywallOverlay = () => {
  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
      <h3 className="text-3xl font-extrabold text-red-400 mb-4">Content Blocked</h3>
      <p className="text-xl text-gray-300 mb-8">You've reached the free viewing limit of 3 pages.</p>

      <div className="space-y-4">
        <Link to="/subscribe" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors shadow-lg">
          Upgrade to OriPro for Unlimited Access
        </Link>
        <p className="text-sm text-gray-500">Unlock all pages instantly.</p>
      </div>
    </div>
  );
};


const SecurePdfViewer = ({ noteId }) => {
  const { user } = useAuth();
  const [pdfFile, setPdfFile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);

  // --- NEW: Determine User Access Status ---
  const isSubscribed = user?.subscription_expiry && new Date(user.subscription_expiry) > new Date();
  const isAdmin = user?.role === 'admin';
  const hasUnlimitedAccess = isAdmin || isSubscribed;

  // The maximum page a non-subscribed user can view
  const maxViewablePage = useMemo(() => {
    return hasUnlimitedAccess ? (numPages || Infinity) : FREE_PAGE_LIMIT;
  }, [hasUnlimitedAccess, numPages]);

  // Check if the current page is blocked by the paywall
  const isPageBlocked = pageNumber > maxViewablePage;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    // If user is not subscribed and tried to jump past the limit, reset to the limit
    if (!hasUnlimitedAccess && pageNumber > FREE_PAGE_LIMIT) {
        setPageNumber(FREE_PAGE_LIMIT);
    }
  }

  const zoomIn = () => setScale(prevScale => prevScale < 2.0 ? prevScale + 0.2 : prevScale);
  const zoomOut = () => setScale(prevScale => prevScale > 0.4 ? prevScale - 0.2 : prevScale);

  // --- FIX: Update navigation to respect maxViewablePage ---
  const goToPrevPage = () => setPageNumber(prev => (prev > 1 ? prev - 1 : prev));
  const goToNextPage = () => setPageNumber(prev => (prev < maxViewablePage ? prev + 1 : prev));


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

        // Fetch the PDF (backend security check ensures the user has AT LEAST free access)
        const response = await api.get(`/notes/${noteId}/view`, { responseType: 'blob' });

        if (response.data.type !== 'application/pdf') {
          const errorText = await response.data.text();
          let parsedError;
          try {
              parsedError = JSON.parse(errorText);
          } catch(e) {
              parsedError = { error: "Server did not return a valid PDF. Check subscription status or access rights." };
          }
          throw new Error(parsedError.error || "Access Denied: Could not fetch the note.");
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
            {error.includes("Access Denied") && (
                <Link to="/subscribe" className="bg-cyan-500 text-white font-bold py-2 px-4 rounded hover:bg-cyan-600 transition-colors">
                    Upgrade to OriPro
                </Link>
            )}
        </div>
    );
  }

  // --- Render Logic ---
  return (
    <div
      className="flex flex-col h-full w-full bg-gray-700 items-center"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: 'none' }}
    >
      {/* Custom PDF Controls with Zoom */}
      <div className="w-full bg-gray-800 p-2 flex justify-center items-center gap-4 text-white sticky top-0 z-10">
        <button onClick={goToPrevPage} disabled={pageNumber <= 1} className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Prev</button>

        {/* Update: Show max viewable page count if access is limited */}
        <span>Page {pageNumber} of {hasUnlimitedAccess ? (numPages || '--') : maxViewablePage + ' (Free)'}</span>

        <button onClick={goToNextPage} disabled={!numPages || pageNumber >= maxViewablePage} className="px-3 py-1 bg-gray-600 rounded disabled:opacity-50">Next</button>

        <div className="ml-auto flex items-center gap-2">
            <button onClick={zoomOut} className="px-3 py-1 bg-gray-600 rounded">-</button>
            <span>{Math.round(scale * 100)}%</span>
            <button onClick={zoomIn} className="px-3 py-1 bg-gray-600 rounded">+</button>
        </div>

        {isAdmin && (
           <a href={URL.createObjectURL(pdfFile)} download={`note-${noteId}.pdf`} className="ml-4 px-3 py-1 bg-green-600 rounded">
             Download (Admin)
           </a>
        )}
      </div>

      <div className={`flex-grow w-full overflow-auto flex justify-center relative transition-all duration-300 ${!isWindowFocused && !isAdmin ? 'blur-lg' : ''}`}>
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => setError(`Failed to render PDF: ${err.message}`)}
          loading={<div className="text-white p-4">Rendering PDF...</div>}
        >
          {/* Render the current page */}
          <Page pageNumber={pageNumber} scale={scale} />

          {/* PHASE 2 FIX: Render Paywall Overlay */}
          {isPageBlocked && <PaywallOverlay />}
        </Document>
      </div>
    </div>
  );
};

export default SecurePdfViewer;