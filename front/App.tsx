import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Channel, Message, User } from './types'; // Assuming types.ts is consistent
import { INITIAL_CHANNELS, ALL_MOCK_USERS, CURRENT_USER_ID } from './constants'; // Ensure these are correctly defined
import ControlTowerPage from './pages/ControlTowerPage';
import ChatPage from './pages/ChatPage';
import { useAppWebSocket } from './hooks/useAppWebSocket'; // From App_works

// --- CONFIGURATION from App_works.tsx ---
const getWebSocketServerUrl = (): string => {
  try {
    // Check if import.meta itself exists
    if (typeof import.meta !== 'undefined') {
      // Use type assertion to access 'env' property
      const env = (import.meta as any).env;
      // Now check if env and the specific variable exist and is a string
      if (env && typeof env.VITE_WEBSOCKET_URL === 'string') {
        return env.VITE_WEBSOCKET_URL || 'ws://localhost:8080';
      }
    }
  } catch (e) {
    console.warn("Could not access import.meta.env for WebSocket URL. Using default.", e);
  }
  return 'ws://localhost:8080'; // Default WebSocket URL
};

const WEBSOCKET_SERVER_URL = getWebSocketServerUrl();

const App: React.FC = () => {
  // Initialize channels state
  const [channels, setChannels] = useState<Channel[]>(() => {
    const mutableInitialChannels: Channel[] = JSON.parse(JSON.stringify(INITIAL_CHANNELS));
    return mutableInitialChannels;
  });

  // Initialize messages state
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const initialMessagesSetup: Record<string, Message[]> = {};
    const channelsForMsgInit: Channel[] = JSON.parse(JSON.stringify(INITIAL_CHANNELS));

    channelsForMsgInit.forEach(channel => {
      initialMessagesSetup[channel.id] = []; 
    });
    return initialMessagesSetup;
  });
  
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [wsStatusDisplay, setWsStatusDisplay] = useState<string>('Connecting...'); // For UI display

  // Callback to mark all messages in a channel as read and update channel's unread count
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
  }, []); // No dependencies needed if it only uses setters

  // WebSocket: Handler for incoming messages from the server
  const handleIncomingMessage = useCallback((newMessage: Message) => {
    setMessages(prevMsgs => ({
      ...prevMsgs,
      [newMessage.channelId]: [...(prevMsgs[newMessage.channelId] || []), newMessage],
    }));

    setChannels(prevChs => 
      prevChs.map(ch => {
        if (ch.id === newMessage.channelId) {
          let newUnreadCount = ch.unreadCount;
          // Increment unread count if the message is for a different channel,
          // OR if it's from another user (even in the active channel, it's briefly "unread").
          if (newMessage.channelId !== activeChannelId || newMessage.senderId !== CURRENT_USER_ID) {
             newUnreadCount += 1;
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
    // Note: App_works.tsx relies on handleSelectChannel (which depends on `channels` state)
    // to clear the unread count if the message arrived in an active channel.
  }, [activeChannelId, CURRENT_USER_ID]); // Added CURRENT_USER_ID for clarity

  // WebSocket: Handler for connection errors
  const handleWsError = useCallback((errorMsg: string) => {
    setWsStatusDisplay(`Error: ${errorMsg}`);
  }, []);

  // WebSocket: Handler for connection status changes
  const handleWsConnectionChange = useCallback((connected: boolean) => {
    setWsStatusDisplay(connected ? 'Connected' : 'Disconnected');
    if (!connected && !wsStatusDisplay.startsWith('Error:')) { // Avoid overwriting specific error messages
        setWsStatusDisplay('Disconnected. Attempting to reconnect...');
    }
  }, [wsStatusDisplay]);

  // Initialize WebSocket connection and handlers
  const { 
    isConnected, 
    lastError, 
    connect, 
    sendMessageToServer 
  } = useAppWebSocket({
    onMessageReceived: handleIncomingMessage,
    onErrorReceived: handleWsError, 
    onConnectionStatusChange: handleWsConnectionChange,
  });

  // Effect for initial WebSocket connection (runs once)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).__APP_WS_CONNECTED__) return; // Prevent multiple connections in StrictMode
      (window as any).__APP_WS_CONNECTED__ = true;
    }
    console.log(`[App] Connecting to WebSocket server at ${WEBSOCKET_SERVER_URL}`);
    connect(WEBSOCKET_SERVER_URL);
  }, [connect]); // WEBSOCKET_SERVER_URL is a top-level const

  // Effect for WebSocket auto-reconnection
  useEffect(() => {
    if (!isConnected && !lastError) {
      console.log('[App] WebSocket disconnected without error. Scheduling reconnect attempt.');
      const timeout = setTimeout(() => {
        console.log('[App] Attempting to reconnect WebSocket...');
        setWsStatusDisplay('Attempting to reconnect...');
        connect(WEBSOCKET_SERVER_URL);
      }, 5000); // Reconnect after 5 seconds
      return () => clearTimeout(timeout);
    }
  }, [isConnected, lastError, connect]); // WEBSOCKET_SERVER_URL is a top-level const

  // Handler for selecting a channel (e.g., when user clicks on one)
  // This is also called by ChatPage when channelId from URL changes.
  const handleSelectChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    const channel = channels.find(ch => ch.id === channelId); // `channels` is from component state
    if (channel && channel.unreadCount > 0) {
      markChannelAsRead(channelId);
    }
  }, [markChannelAsRead, channels]); // `channels` dependency is important here

  // Handler for sending a message
  const handleSendMessage = useCallback((channelId: string, text: string) => {
    if (!text.trim()) return;
    if (!isConnected) {
      console.warn("Cannot send message, WebSocket not connected.");
      handleWsError("Not connected. Cannot send message."); // Update status display
      return;
    }
    sendMessageToServer(channelId, text); // Send message via WebSocket

    // Optimistically update channel preview for the sender.
    // The actual message object will be added via handleIncomingMessage when server echoes it.
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { 
        ...ch, 
        lastMessagePreview: text, // Show raw text as preview
        lastMessageTimestamp: Date.now(),
        // unreadCount is NOT set to 0 here by sender; server echo + handleIncomingMessage + handleSelectChannel handles it
      } : ch
    ));

    // If the message is sent in the currently active channel, mark it as read for the sender.
    if (channelId === activeChannelId) {
        markChannelAsRead(channelId); 
    }
  }, [isConnected, sendMessageToServer, activeChannelId, markChannelAsRead, handleWsError]);
  
  // Get current user details
  const currentUser = ALL_MOCK_USERS.find(u => u.id === CURRENT_USER_ID);
  if (!currentUser) {
    console.error("Current user not found! Check CURRENT_USER_ID and ALL_MOCK_USERS in constants.");
    return <React.Fragment>Error: Current user configuration issue.</React.Fragment>;
  }
  
  // Effect to update document title with unread count and WebSocket status
  useEffect(() => {
    const totalUnread = channels.reduce((sum, ch) => sum + ch.unreadCount, 0);
    const baseTitle = "SalesHQ Control Tower"; 
    let statusPart = wsStatusDisplay; // Default to current display message
    if(isConnected) statusPart = "Connected";
    else if (lastError) statusPart = `Error: ${lastError.substring(0,30)}...`; // Show truncated error
    
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) ${baseTitle} - ${statusPart}`;
    } else {
      document.title = `${baseTitle} - ${statusPart}`;
    }
  }, [channels, wsStatusDisplay, isConnected, lastError]);

  // Filter channels for display on the ControlTowerPage
  const controlTowerDisplayChannels = channels.filter(ch => 
    ['Amazon', 'Google', 'OpenAI'].includes(ch.id)
  );

  return (
    <HashRouter>
      <div className="h-screen w-screen flex flex-col antialiased text-slate-200 bg-slate-900 overflow-hidden">
        {/* WebSocket Status Banner */}
        <div className={`p-2 text-center text-xs text-white sticky top-0 z-50 ${
            isConnected ? 'bg-green-700' : lastError ? 'bg-red-700' : 'bg-yellow-600 text-black'
          }`}
          role="status"
          aria-live="polite"
        >
          WebSocket: {isConnected ? 'Connected' : (lastError || wsStatusDisplay)}
          {!isConnected && ( // Show reconnect button if not connected
            <button
              onClick={() => {
                setWsStatusDisplay('Attempting to connect...');
                connect(WEBSOCKET_SERVER_URL);
              }}
              className="ml-2 px-2 py-0.5 border border-current rounded hover:bg-white/20 transition-colors text-xs"
            >
              Reconnect
            </button>
          )}
        </div>

        {/* Main content area for routing */}
        <div className="flex-grow overflow-hidden flex flex-col">
          <Routes>
            <Route path="/" element={
              <ControlTowerPage
                channels={controlTowerDisplayChannels}
                // Assuming ControlTowerPage items might call onSelectChannel before navigating,
                // or use <Link> and ChatPage handles selection via URL.
                // If ControlTowerPage items directly navigate using <Link>, this prop isn't strictly needed here.
                // However, if ControlTowerPage has its own logic to set active channel before nav, it's useful.
                onSelectChannel={handleSelectChannel} 
                users={ALL_MOCK_USERS}
                currentUser={currentUser}
              />
            }/>
            <Route path="/chat" element={  // Default chat route (e.g., no specific channel selected)
              <ChatPage
                channels={channels} // Pass all channels for the channel list
                messages={messages}
                activeChannelId={activeChannelId}
                onSelectChannel={handleSelectChannel} // Callback to update App's active channel
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                users={ALL_MOCK_USERS}
                isConnected={isConnected} // Pass WebSocket connection status
              />
            }/>
            <Route path="/chat/:channelId" element={ // Chat route for a specific channel
              <ChatPage
                channels={channels}
                messages={messages}
                activeChannelId={activeChannelId} 
                onSelectChannel={handleSelectChannel} // ChatPage will use this to sync with URL param
                onSendMessage={handleSendMessage}
                currentUser={currentUser}
                users={ALL_MOCK_USERS}
                isConnected={isConnected}
              />
            }/>
            <Route path="*" element={<Navigate to="/" />} /> {/* Fallback route */}
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
