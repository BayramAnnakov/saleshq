
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Channel, Message, User } from './types';
import { INITIAL_CHANNELS, ALL_MOCK_USERS, CURRENT_USER_ID } from './constants';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import { useAppWebSocket } from './hooks/useAppWebSocket';

// --- CONFIGURATION ---
const getWebSocketServerUrl = (): string => {
  try {
    // Check if import.meta and import.meta.env are defined
    if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
      return import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';
    }
  } catch (e) {
    // Log error if any occurs during access, though the check above should prevent most.
    console.warn("Could not access import.meta.env for WebSocket URL. Using default.", e);
  }
  // Fallback default if import.meta.env or VITE_WEBSOCKET_URL is not available
  return 'ws://localhost:8080';
};
const WEBSOCKET_SERVER_URL = getWebSocketServerUrl();

const App: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const initialMessages: Record<string, Message[]> = {};
    INITIAL_CHANNELS.forEach(channel => {
      initialMessages[channel.id] = [];
    });
    return initialMessages;
  });
  
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [wsStatusDisplay, setWsStatusDisplay] = useState<string>('Connecting...'); // For UI display

  const handleIncomingMessage = useCallback((newMessage: Message) => {
    setMessages(prevMsgs => ({
      ...prevMsgs,
      [newMessage.channelId]: [...(prevMsgs[newMessage.channelId] || []), newMessage],
    }));

    setChannels(prevChs => 
      prevChs.map(ch => {
        if (ch.id === newMessage.channelId) {
          let newUnreadCount = ch.unreadCount;
          // Only increment unread if the message is not for the currently active channel
          // OR if it is for the active channel BUT not from the current user.
          if (newMessage.channelId !== activeChannelId) {
             if(newMessage.senderId !== CURRENT_USER_ID) newUnreadCount += 1;
          } else { // Message is for the active channel
            if(newMessage.senderId !== CURRENT_USER_ID) {
                // If user is viewing the active channel, new messages from others are "unread" until explicitly marked.
                // The ChannelList UI will show this. DashboardPage will reflect this too.
                // markChannelAsRead called by onSelectChannel will clear it.
                newUnreadCount += 1;
            }
          }
          
          return {
            ...ch,
            lastMessagePreview: newMessage.text,
            lastMessageTimestamp: newMessage.timestamp,
            unreadCount: newUnreadCount,
          };
        }
        return ch;
      })
    );
  }, [activeChannelId]);

  const handleWsError = useCallback((errorMsg: string) => {
    // This state is used for the visual banner
    setWsStatusDisplay(`Error: ${errorMsg}`);
  }, []);

  const handleWsConnectionChange = useCallback((connected: boolean) => {
     // This state is used for the visual banner
    setWsStatusDisplay(connected ? 'Connected' : 'Disconnected');
    if (!connected && !lastError) { // if disconnect was clean, show disconnected.
        setWsStatusDisplay('Disconnected. Attempting to reconnect...');
    }
  }, []); // lastError is not available here, hook manages its own state

  const { 
    isConnected, 
    lastError, // This is the raw error from the hook
    connect, 
    disconnect, 
    sendMessageToServer 
  } = useAppWebSocket({
    onMessageReceived: handleIncomingMessage,
    onErrorReceived: handleWsError, // Hook's internal lastError is separate from wsStatusDisplay
    onConnectionStatusChange: handleWsConnectionChange,
  });

  // Initial WebSocket connection on mount
  useEffect(() => {
    console.log(`[App] Connecting to WebSocket server at ${WEBSOCKET_SERVER_URL}`);
    connect(WEBSOCKET_SERVER_URL);
  }, [connect, WEBSOCKET_SERVER_URL]);

  // Auto-reconnect when disconnected without error
  useEffect(() => {
    if (!isConnected && !lastError) {
      console.log('[App] Scheduling reconnect attempt');
      const timeout = setTimeout(() => {
        console.log('[App] Reconnecting WebSocket...');
        setWsStatusDisplay('Attempting to reconnect...');
        connect(WEBSOCKET_SERVER_URL);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isConnected, lastError, connect, WEBSOCKET_SERVER_URL]);

  const markChannelAsRead = useCallback((channelId: string) => {
    setMessages(prevMessages => {
      const channelMessages = prevMessages[channelId] || [];
      return {
        ...prevMessages,
        [channelId]: channelMessages.map(msg => ({ ...msg, isRead: true })),
      };
    });
    setChannels(prevChannels =>
      prevChannels.map(ch =>
        ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
      )
    );
  }, []);

  const handleSelectChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    const channel = channels.find(ch => ch.id === channelId);
    if (channel && channel.unreadCount > 0) {
      markChannelAsRead(channelId);
    }
  }, [markChannelAsRead, channels]);

  const handleSendMessage = useCallback((channelId: string, text: string) => {
    if (!text.trim()) return;
    if (!isConnected) {
      console.warn("Cannot send message, WebSocket not connected.");
      handleWsError("Not connected. Cannot send message.");
      return;
    }
    sendMessageToServer(channelId, text);

    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { 
        ...ch, 
        lastMessagePreview: `You: ${text}`, 
        lastMessageTimestamp: Date.now(), 
      } : ch
    ));
    if (channelId === activeChannelId) {
        markChannelAsRead(channelId);
    }

  }, [isConnected, sendMessageToServer, activeChannelId, markChannelAsRead, handleWsError]);
  
  const currentUser = ALL_MOCK_USERS.find(u => u.id === CURRENT_USER_ID);
  if (!currentUser) {
    console.error("Current user not found!");
    return <React.Fragment>Error: Current user configuration issue.</React.Fragment>;
  }
  
  useEffect(() => {
    const totalUnread = channels.reduce((sum, ch) => sum + ch.unreadCount, 0);
    const baseTitle = "Sales Dashboard";
    let statusPart = wsStatusDisplay;
    if(isConnected) statusPart = "Connected";
    else if (lastError) statusPart = `Error: ${lastError.substring(0,50)}`; // Show hook's direct error if present
    
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${baseTitle} - ${statusPart}`;
    } else {
      document.title = `${baseTitle} - ${statusPart}`;
    }
  }, [channels, wsStatusDisplay, isConnected, lastError]);


  return (
    <HashRouter>
      <div className="h-screen w-screen flex flex-col antialiased text-gray-800 overflow-hidden">
        <div className={`p-2 text-center text-xs text-white sticky top-0 z-50 ${
            isConnected ? 'bg-green-600' : lastError ? 'bg-red-600' : 'bg-yellow-500 text-black'
          }`}
          role="status"
          aria-live="polite"
        >
          WebSocket: {isConnected ? 'Connected' : (lastError || wsStatusDisplay)}
          {!isConnected && (
            <button 
              onClick={() => {
                setWsStatusDisplay('Attempting to connect...');
                connect(WEBSOCKET_SERVER_URL);
              }}
              className="ml-2 px-2 py-0.5 border border-current rounded hover:bg-opacity-20 hover:bg-current text-xs"
            >
              Reconnect
            </button>
          )}
        </div>

        <div className="flex-grow overflow-hidden flex flex-col"> {/* Added to contain routes and allow scrolling if needed */}
          <Routes>
            <Route path="/" element={
              <DashboardPage 
                channels={channels}
              />
            }/>
            <Route path="/chat" element={ 
              <ChatPage
                channels={channels}
                messages={messages}
                activeChannelId={activeChannelId}
                onSelectChannel={handleSelectChannel}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                users={ALL_MOCK_USERS}
                isConnected={isConnected}
              />
            }/>
            <Route path="/chat/:channelId" element={ 
              <ChatPage
                channels={channels}
                messages={messages}
                activeChannelId={activeChannelId} 
                onSelectChannel={handleSelectChannel}
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                users={ALL_MOCK_USERS}
                isConnected={isConnected}
              />
            }/>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
