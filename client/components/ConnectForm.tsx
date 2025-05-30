
import React from 'react';

interface ConnectFormProps {
  wsUrl: string;
  setWsUrl: (url: string) => void;
  userId: string;
  setUserId: (id: string) => void;
  onConnect: () => void;
  isConnecting: boolean;
}

export const ConnectForm: React.FC<ConnectFormProps> = ({
  wsUrl,
  setWsUrl,
  userId,
  setUserId,
  onConnect,
  isConnecting
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-slate-700 rounded-lg shadow-lg">
      <div>
        <label htmlFor="wsUrl" className="block text-sm font-medium text-sky-300 mb-1">
          WebSocket Server URL
        </label>
        <input
          type="text"
          id="wsUrl"
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          placeholder="e.g., ws://localhost:8080"
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-sky-300 mb-1">
          Your User ID
        </label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="e.g., user_client_alpha"
          className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
          required
        />
         <p className="mt-1 text-xs text-slate-400">This ID will be used to identify your messages.</p>
      </div>
      <button
        type="submit"
        disabled={isConnecting || !wsUrl.trim() || !userId.trim()}
        className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-500 text-white font-semibold rounded-md shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500"
      >
        {isConnecting ? 'Connecting...' : 'Connect'}
      </button>
    </form>
  );
};
    