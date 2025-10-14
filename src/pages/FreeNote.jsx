// src/pages/FreeNote.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const FreeNote = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFreeNote = async () => {
      try {
        setLoading(true);
        // The backend returns the free note data, including a direct path
        const response = await api.get('/notes/free');
        setPdfUrl(response.data.pdf_path);
      } catch (err) {
        console.error("Failed to fetch free note:", err);
        setError("Failed to load the free note. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchFreeNote();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <p className="text-white">Loading free note...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6 text-cyan-400">Free Preview Note</h1>
      <p className="text-lg text-gray-300 mb-6">
        This is a free preview. To access all notes, please <a onClick={() => navigate('/register')} className="text-cyan-400 hover:underline cursor-pointer">create an account</a> or <a onClick={() => navigate('/login')} className="text-cyan-400 hover:underline cursor-pointer">log in</a>.
      </p>
      <iframe
        src={pdfUrl}
        title="Free Preview Note"
        className="w-full h-screen border-none rounded-lg shadow-lg"
      ></iframe>
    </div>
  );
};

export default FreeNote;