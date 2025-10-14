// src/pages/AdminSettings.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AdminSettings() {
  const [settings, setSettings] = useState({ is_subscription_enabled: false });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/settings');
        setSettings(response.data);
      } catch (err) {
        setError('Failed to load settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggleChange = async (key, value) => {
    setMessage('');
    setError('');
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings); // Optimistic UI update

    try {
      await api.put('/admin/settings', {
        settingKey: key,
        settingValue: value,
      });
      setMessage('✅ Settings updated successfully!');
    } catch (err) {
      setError('❌ Failed to update settings. Please try again.');
      // Revert UI on failure
      setSettings(settings);
    }
  };

  if (loading) {
    return <p className="text-center">Loading settings...</p>;
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gray-800 rounded-xl">
      <h1 className="text-4xl font-bold text-cyan-400 mb-8">Application Settings</h1>

      {message && <p className="text-green-400 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="space-y-6">
        <div className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Enable Subscriptions</h2>
            <p className="text-sm text-gray-400">
              If enabled, users will see the 'Subscribe' option and prompts to purchase a plan.
            </p>
          </div>
          <label htmlFor="subscription-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                id="subscription-toggle"
                className="sr-only"
                checked={settings.is_subscription_enabled}
                onChange={(e) => handleToggleChange('is_subscription_enabled', e.target.checked)}
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${settings.is_subscription_enabled ? 'transform translate-x-6 bg-cyan-400' : ''}`}></div>
            </div>
          </label>
        </div>
        {/* You can add more settings here in the future */}
      </div>
    </div>
  );
}

export default AdminSettings;