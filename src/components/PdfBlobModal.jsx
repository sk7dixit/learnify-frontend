// src/components/PdfBlobModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export default function PdfBlobModal({ file, title, onClose }) {
  // file: Blob OR object URL string OR remote URL string
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  useEffect(() => {
    setPageNumber(1);
    setNumPages(null);
  }, [file]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setScale(s => Math.min(3, s + 0.25));
  const zoomOut = () => setScale(s => Math.max(0.5, s - 0.25));
  const prevPage = () => setPageNumber(p => Math.max(1, p - 1));
  const nextPage = () => setPageNumber(p => Math.min(numPages || p, p + 1));

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-gray-900 rounded shadow-lg w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100 truncate">{title}</h3>
          <div className="flex items-center gap-2">
            <button onClick={zoomOut} className="px-2 py-1 bg-gray-800 rounded">-</button>
            <span className="text-sm text-gray-300">{Math.round(scale*100)}%</span>
            <button onClick={zoomIn} className="px-2 py-1 bg-gray-800 rounded">+</button>
            <button onClick={onClose} className="ml-2 p-2 rounded hover:bg-gray-800">
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="p-6 text-center">Rendering PDF...</div>}
            onLoadError={(err) => console.error("PDF load error:", err)}
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>

        <div className="p-3 border-t border-gray-700 flex items-center justify-between bg-gray-800">
          <div className="text-sm text-gray-300">Page {pageNumber} / {numPages || '--'}</div>
          <div className="flex gap-2">
            <button onClick={prevPage} className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50" disabled={pageNumber <= 1}>Prev</button>
            <button onClick={nextPage} className="px-3 py-1 bg-gray-700 rounded" disabled={!numPages || pageNumber >= numPages}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
