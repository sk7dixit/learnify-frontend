import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const streams = ['Physics', 'Chemistry', 'Maths', 'Computer Science'];
const disciplines = ['Computer Science and Engineering (CSE)', 'Information Technology (IT)', 'Artificial Intelligence and Machine Learning (AI & ML)', 'Data Science', 'Cyber Security'];

function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        // THIS IS THE FIX: Call the new dedicated route for fetching data
        const res = await api.get(`/notes/details/${id}`);
        if (res.data.expiry_date) {
          res.data.expiry_date = new Date(res.data.expiry_date).toISOString().split('T')[0];
        }
        setFormData(res.data);
      } catch (err) {
        setError('Failed to load note data.');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/notes/${id}`, formData);
      setMessage('✅ Note updated successfully!');
      setTimeout(() => navigate('/notes'), 1500);
    } catch (err) {
      setError('❌ Failed to update note.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) return <p className="text-center">Loading note details...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400">✏️ Edit Note</h2>
      {message && <p className="text-green-400 mb-4">{message}</p>}
      {formData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields remain the same */}
          <div><label>Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full mt-2 px-4 py-2 rounded-lg bg-gray-700"/></div>
          <div><label>Category</label><select name="category" value={formData.category} onChange={handleChange} required className="w-full mt-2 px-4 py-2 rounded-lg bg-gray-700"><option value="">-- Select --</option><option value="school">School</option><option value="college">College</option></select></div>
          {formData.category === 'school' && (<div><label>Stream</label><select name="stream" value={formData.stream} onChange={handleChange} className="w-full mt-2 px-4 py-2 rounded-lg bg-gray-700">{streams.map(s => <option key={s} value={s}>{s}</option>)}</select></div>)}
          {formData.category === 'college' && (<div><label>Discipline</label><select name="discipline" value={formData.discipline} onChange={handleChange} className="w-full mt-2 px-4 py-2 rounded-lg bg-gray-700">{disciplines.map(d => <option key={d} value={d}>{d}</option>)}</select></div>)}
          <div><label>Expiry Date</label><input type="date" name="expiry_date" value={formData.expiry_date || ''} onChange={handleChange} className="w-full mt-2 px-4 py-2 rounded-lg bg-gray-700"/></div>
          <div className="flex items-center"><input type="checkbox" name="is_free" id="is_free" checked={formData.is_free} onChange={handleChange} className="h-4 w-4 rounded text-cyan-600"/><label htmlFor="is_free" className="ml-3">Mark as Free</label></div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">{loading ? 'Saving...' : 'Save Changes'}</button>
        </form>
      )}
    </div>
  );
}

export default EditNote;