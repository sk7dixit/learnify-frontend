// src/pages/NoteViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SecurePdfViewer from '../components/SecurePdfViewer';
import ReportNote from '../components/ReportNote'; // <-- NEW: Import the reporting component
import { Rating } from 'react-simple-star-rating';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Flag } from 'lucide-react'; // <-- NEW: Import Flag icon

const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

// The RatingSection component remains unchanged
const RatingSection = ({ noteId }) => {
    // ... (All the code for RatingSection stays the same)
    const { user, refreshUser } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRatings = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/notes/${noteId}/ratings`);
                setRatings(res.data);
                const myReview = res.data.find(r => r.username === user.username);
                if (myReview) {
                    setUserRating(myReview.rating);
                    setReviewText(myReview.review_text);
                }
            } catch (err) {
                console.error("Failed to fetch ratings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, [noteId, user.username]);

    const handleRating = (rate) => { setUserRating(rate); };

    const handleSubmitReview = async () => {
        if (userRating === 0) {
            alert("Please select a star rating before submitting.");
            return;
        }
        try {
            await api.post(`/notes/${noteId}/rate`, { rating: userRating, review_text: reviewText });
            await refreshUser();
            const res = await api.get(`/notes/${noteId}/ratings`);
            setRatings(res.data);
        } catch (err) {
            alert("Failed to submit review.");
        }
    };

    const averageRating = ratings.length > 0 ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(1) : "N/A";

    return (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
            <h2 className="text-3xl font-bold mb-4 text-white">Ratings & Reviews <span className="text-yellow-400">({averageRating} ★)</span></h2>
            <div className="mb-8 p-4 border border-gray-700 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Your Review</h3>
                <Rating onClick={handleRating} initialValue={userRating} />
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your thoughts on this note..."
                    rows="4"
                    className="w-full p-2 mt-4 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button onClick={handleSubmitReview} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Submit Review
                </button>
            </div>
            <div className="space-y-4">
                {loading ? <p>Loading reviews...</p> : ratings.length > 0 ? ratings.map((r, index) => (
                    <div key={index} className="border-b border-gray-700 pb-4">
                        <div className="flex items-center mb-1">
                            <span className="font-bold text-cyan-400 mr-2">{r.username}</span>
                            <Rating initialValue={r.rating} readonly size={20} />
                        </div>
                        <p className="text-gray-300">{r.review_text}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(r.created_at)}</p>
                    </div>
                )) : <p className="text-gray-400">Be the first to leave a review!</p>}
            </div>
        </div>
    );
};


function NoteViewer() {
  const { noteId } = useParams();
  const navigate = useNavigate();

  // --- NEW: State for reporting ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("Loading Note..."); // State to hold the note's title

  // --- NEW: Fetch Note Title on Load (needed for the report modal) ---
  useEffect(() => {
    const fetchTitle = async () => {
        try {
            // We use the same getSingleNote route we have already implemented
            const res = await api.get(`/notes/${noteId}`);
            setNoteTitle(res.data.title);
        } catch (err) {
            console.error("Failed to fetch note title", err);
            setNoteTitle("Note Details");
        }
    };
    fetchTitle();
  }, [noteId]);


  return (
    <div className="w-full">
        {/* Top Control Bar */}
        <div className="mb-6 flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              &larr; Back
            </button>

            {/* Report Button (Phase 2 Community Curation) */}
            <button
                onClick={() => setIsReportModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
                <Flag className="w-5 h-5" /> Report Note
            </button>
        </div>

      {/* --- PDF VIEWER CONTAINER --- */}
      <div className="w-full h-[85vh] bg-gray-800 rounded-lg overflow-hidden shadow-2xl mb-8">
        <SecurePdfViewer noteId={noteId} />
      </div>

      {/* The ratings section will now be visible by scrolling down the main page */}
      <div className="w-full">
         <RatingSection noteId={noteId} />
      </div>

      {/* --- NEW: Report Modal --- */}
      {isReportModalOpen && (
        <ReportNote
            noteId={noteId}
            noteTitle={noteTitle}
            onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}

export default NoteViewer;