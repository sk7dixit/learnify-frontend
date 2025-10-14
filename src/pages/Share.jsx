import React, { useState } from 'react';

// --- Helper function to copy text to the clipboard ---
// We use the older 'document.execCommand' for wider compatibility in browser iframes.
const copyToClipboard = (text) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    return true; // Return true on success
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false; // Return false on failure
  } finally {
    document.body.removeChild(textArea);
  }
};


// --- Social Media Share Buttons ---
// Each object contains info for creating a share button
const sharePlatforms = [
  { name: 'WhatsApp', icon: 'fab fa-whatsapp', color: 'bg-green-500', url: 'https://api.whatsapp.com/send?text=' },
  { name: 'Twitter', icon: 'fab fa-twitter', color: 'bg-sky-500', url: 'https://twitter.com/intent/tweet?text=' },
  { name: 'Facebook', icon: 'fab fa-facebook-f', color: 'bg-blue-800', url: 'https://www.facebook.com/sharer/sharer.php?u=' },
  { name: 'LinkedIn', icon: 'fab fa-linkedin-in', color: 'bg-blue-600', url: 'https://www.linkedin.com/shareArticle?mini=true&url=' },
];


function Share() {
  const [copySuccess, setCopySuccess] = useState('');
  const shareUrl = window.location.origin; // Gets the base URL of your site (e.g., http://localhost:5173)
  const shareText = encodeURIComponent(`Check out Learnify! It's an awesome platform for students to find and share notes. Join here: ${shareUrl}`);

  const handleCopy = () => {
    const success = copyToClipboard(shareUrl);
    if (success) {
      setCopySuccess('✅ Link copied to clipboard!');
      setTimeout(() => setCopySuccess(''), 2000); // Hide message after 2 seconds
    } else {
      setCopySuccess('❌ Failed to copy link.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
        {/* Font Awesome CDN for icons - Add this to your main index.html for global use if not already present */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      <div className="bg-gray-800 p-10 rounded-xl shadow-2xl text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">Share with Friends</h1>
        <p className="text-gray-400 mb-8">
          If you enjoy Learnify, share it with others who might find it useful!
        </p>

        {/* --- Social Media Buttons --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {sharePlatforms.map(platform => (
            <a
              key={platform.name}
              href={platform.name === 'Facebook' || platform.name === 'LinkedIn' ? `${platform.url}${shareUrl}` : `${platform.url}${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`${platform.color} text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity`}
            >
              <i className={platform.icon}></i>
              <span>{platform.name}</span>
            </a>
          ))}
        </div>

        {/* --- Copy Link Section --- */}
        <div className="border-t border-gray-700 pt-6">
          <p className="text-gray-300 mb-3">Or share the link directly:</p>
          <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="bg-transparent text-gray-400 w-full outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-700"
            >
              Copy
            </button>
          </div>
          {copySuccess && <p className="mt-3 text-sm text-green-400">{copySuccess}</p>}
        </div>
      </div>
    </div>
  );
}

export default Share;
