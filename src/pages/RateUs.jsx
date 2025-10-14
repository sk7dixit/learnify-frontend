import React, { useState } from 'react';

// Star component that can be filled or empty
const Star = ({ filled, onMouseEnter, onMouseLeave, onClick }) => (
  <svg
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    className={`w-12 h-12 cursor-pointer transition-transform transform hover:scale-125 ${filled ? 'text-yellow-400' : 'text-gray-600'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.366 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.446c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
  </svg>
);

function RateUs() {
  const [rating, setRating] = useState(0); // The actual selected rating
  const [hoverRating, setHoverRating] = useState(0); // The rating the user is hovering over
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating > 0) {
      // In a real app, you would send the 'rating' to your backend here.
      // For now, we just show a thank you message.
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="text-center p-8 bg-gray-800 rounded-lg shadow-xl animate-fadeIn">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">Thank You!</h1>
        <p className="text-lg text-gray-300">We appreciate your feedback.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="bg-gray-800 p-10 rounded-xl shadow-2xl text-center max-w-lg">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">Rate Our App</h1>
        <p className="text-gray-400 mb-8">
          Your feedback helps us improve. Please let us know how you feel about Learnify.
        </p>
        <div className="flex justify-center space-x-2 mb-8">
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <Star
              key={starIndex}
              filled={starIndex <= (hoverRating || rating)}
              onMouseEnter={() => setHoverRating(starIndex)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(starIndex)}
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Rating
        </button>
      </div>
    </div>
  );
}

export default RateUs;
