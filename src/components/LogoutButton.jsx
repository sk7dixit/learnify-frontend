// src/components/LogoutButton.jsx
import React from "react";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <button onClick={handleLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition-colors">
      Logout
    </button>
  );
}

export default LogoutButton;