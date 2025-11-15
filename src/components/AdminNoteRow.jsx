// src/components/AdminNoteRow.jsx
import React, { useState } from "react";
import api from "../services/api"; // your axios instance path (you use ../services/api in other components)
import { Loader2 } from "lucide-react";

export default function AdminNoteRow({ note, onRemoved }) {
  const [loadingView, setLoadingView] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch PDF bytes (arraybuffer) then dispatch as Blob via CustomEvent
  const handleView = async () => {
    try {
      setLoadingView(true);
      const res = await api.get(`/notes/${note.id}/view`, { responseType: "arraybuffer" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      // Dispatch global event to open modal with blob
      window.dispatchEvent(new CustomEvent("admin:openPdf", { detail: { blob, title: note.title } }));
    } catch (err) {
      console.error("Failed to fetch PDF:", err);
      alert(err?.response?.data?.error || "Failed to open PDF. Check server logs.");
    } finally {
      setLoadingView(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm("Approve this note?")) return;
    setActionLoading(true);
    try {
      await api.put(`/notes/admin/review/${note.id}`, { action: "approve" });
      onRemoved(note.id);
    } catch (err) {
      console.error("Approve failed:", err);
      alert(err?.response?.data?.error || "Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Enter rejection reason (required):");
    if (!reason || reason.trim() === "") {
      return alert("Rejection reason required.");
    }
    setActionLoading(true);
    try {
      await api.put(`/notes/admin/review/${note.id}`, { action: "reject", reason });
      onRemoved(note.id);
    } catch (err) {
      console.error("Reject failed:", err);
      alert(err?.response?.data?.error || "Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded p-3 flex items-center justify-between border border-gray-700">
      <div className="flex-1 pr-4">
        <div className="font-semibold text-gray-100 truncate">{note.title}</div>
        <div className="text-sm text-gray-400">Uploaded by <span className="text-cyan-300">{note.username}</span> • {new Date(note.created_at).toLocaleString()}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleView}
          disabled={loadingView}
          className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-white flex items-center gap-2"
        >
          {loadingView ? <Loader2 className="animate-spin w-4 h-4" /> : "View PDF"}
        </button>

        <button onClick={handleApprove} disabled={actionLoading} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white">
          Approve
        </button>

        <button onClick={handleReject} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white">
          Reject
        </button>
      </div>
    </div>
  );
}
