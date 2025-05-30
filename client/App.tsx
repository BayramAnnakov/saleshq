
import React, { useState, useCallback, useEffect } from 'react';
import { ConnectForm } from './components/ConnectForm';
import { ChatInterface } from './components/ChatInterface';
import { StatusIndicator } from './components/StatusIndicator';
import { useWebSocketClient } from './hooks/useWebSocketClient';
import type { Message } from './types';
import { DEFAULT_USER_ID, DEFAULT_WS_URL, CHANNELS } from './constants';

const App: React.FC = () => {
  const [wsUrl, setWsUrl] = useState<string>(DEFAULT_WS_URL);
  const [userId, setUserId] = useState<string>(DEFAULT_USER_ID);
  const [currentChannel, setCurrentChannel] = useState<string>(CHANNELS[0].id);
  
  const {
    socket,
    isConnected,
    messages,
    error,
    connect,
    disconnect,
    sendMessage: wsSendMessage
  } = useWebSocketClient();

  const handleConnect = useCallback(() => {
    connect(wsUrl, userId);
  }, [connect, wsUrl, userId]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  const handleSendMessage = useCallback((text: string) => {
    if (isConnected && currentChannel && text.trim()) {
      wsSendMessage(currentChannel, text);
    }
  }, [isConnected, currentChannel, wsSendMessage]);

  // Log relevant state changes for UI debugging
  useEffect(() => {
    console.log(
      `[App State Sync] isConnected: ${isConnected}, error: ${error}, socket readyState: ${socket?.readyState}`
    );
  }, [isConnected, error, socket]);

  const derivedIsConnecting = socket !== null && socket.readyState === WebSocket.CONNECTING && !error;

  useEffect(() => {
    console.log(`[App State Sync] derivedIsConnecting for UI: ${derivedIsConnecting}`);
  }, [derivedIsConnecting]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 font-sans">
      <header className="w-full max-w-3xl mb-6 text-center">
        <h1 className="text-4xl font-bold text-sky-400">WebSocket Chat Client</h1>
        <p className="text-slate-400">Connect to a chat server, send and receive messages in real-time.</p>
      </header>

      <div className="w-full max-w-3xl bg-slate-800 shadow-2xl rounded-lg p-6">
        <StatusIndicator isConnected={isConnected} error={error} />

        {!isConnected ? (
          <ConnectForm
            wsUrl={wsUrl}
            setWsUrl={setWsUrl}
            userId={userId}
            setUserId={setUserId}
            onConnect={handleConnect}
            isConnecting={derivedIsConnecting}
          />
        ) : (
          <>
            <div className="mb-4 text-right">
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition duration-150 ease-in-out"
              >
                Disconnect
              </button>
            </div>
            <ChatInterface
              channels={CHANNELS}
              currentChannel={currentChannel}
              setCurrentChannel={setCurrentChannel}
              messages={messages.filter(msg => msg.channelId === currentChannel || msg.channelId === 'broadcast')}
              onSendMessage={handleSendMessage}
              currentUser={userId}
            />
          </>
        )}
         {messages.length > 0 && isConnected && (
            <div className="mt-6 pt-4 border-t border-slate-700">
              <h3 className="text-lg font-semibold text-sky-400 mb-2">All Received Messages Log:</h3>
              <div className="max-h-60 overflow-y-auto bg-slate-700 p-3 rounded-md space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={`text-xs p-2 rounded ${msg.userId === userId ? 'bg-sky-700 self-end' : 'bg-slate-600 self-start'}`}>
                    <span className="font-bold text-sky-300">[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                    <span className="font-semibold text-emerald-300 ml-1">({msg.channelId})</span>
                    <strong className="ml-1 text-slate-300">{msg.userId === userId ? 'You' : msg.userId}:</strong>
                    <span className="ml-1 text-slate-200">{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
      <footer className="w-full max-w-3xl mt-8 text-center text-sm text-slate-500">
        <p>Ensure your WebSocket server is running and configured to accept connections.</p>
        <p>This client is designed to interact with servers following the specified message format (see README).</p>
         <p className="mt-2">Check browser developer console (F12) for connection details or errors.</p>
      </footer>
    </div>
  );
};

export default App;
