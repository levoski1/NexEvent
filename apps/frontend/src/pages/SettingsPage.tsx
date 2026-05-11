import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';

export function SettingsPage() {
  const { adminKey, setAdminKey } = useAppStore();
  const [key, setKey] = useState(adminKey);

  const save = () => {
    setAdminKey(key);
    toast.success('Admin key saved');
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-300">Authentication</h2>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Admin API Key</label>
          <input
            type="password"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your admin API key"
          />
          <p className="text-xs text-gray-500 mt-1">Stored locally in your browser. Required for audit log and queue access.</p>
        </div>
        <button onClick={save} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 rounded-lg text-sm font-medium">
          Save
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-gray-300 mb-2">API</h2>
        <p className="text-sm text-gray-400">
          Base URL: <code className="text-brand-400">{import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}</code>
        </p>
        <a
          href="/api/docs"
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-3 text-sm text-brand-500 hover:underline"
        >
          Open Swagger UI →
        </a>
      </div>
    </div>
  );
}
