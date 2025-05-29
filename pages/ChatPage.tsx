import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Channel, Message, User } from '../types';
import ChannelList from '../components/ChannelList';
import ChatWindow from '../components/ChatWindow';
import { ArrowLeftIcon } from '../constants';

interface ChatPageProps {
  channels: Channel[];
  messages: Record<string, Message[]>;
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onSendMessage: (channelId: string, text: string) => void;
  currentUser: User;
  users: User[];
}

const ChatPage: React.FC<ChatPageProps> = ({
  channels,
  messages,
  activeChannelId, // This is the state from App.tsx
  onSelectChannel,
  onSendMessage,
  currentUser,
  users
}) => {
  const { channelId: urlChannelId } = useParams<{ channelId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the effective active channel ID based on URL or App state
  const effectiveActiveChannelId = useMemo(() => {
    if (urlChannelId && channels.find(c => c.id === urlChannelId)) {
      return urlChannelId;
    }
    return activeChannelId;
  }, [urlChannelId, activeChannelId, channels]);

  useEffect(() => {
    let newActiveIdToSet: string | null = null;

    if (urlChannelId && channels.find(c => c.id === urlChannelId)) {
      // If URL specifies a valid channel, make it active
      if (urlChannelId !== activeChannelId) {
        newActiveIdToSet = urlChannelId;
      }
    } else if (!effectiveActiveChannelId && channels.length > 0) {
      // If no channel is effectively active (neither in URL nor app state), select a default
      const firstUnreadChannel = channels.find(c => c.unreadCount > 0);
      const targetChannel = firstUnreadChannel || channels[0]; // Default to first channel if no unread
      
      if (targetChannel) {
        newActiveIdToSet = targetChannel.id;
        // Update URL to reflect this default selection, only if not already on a /chat/* path
        if (!location.pathname.startsWith(`/chat/${targetChannel.id}`)) {
           navigate(`/chat/${targetChannel.id}`, { replace: true });
        }
      }
    }
    
    if (newActiveIdToSet && newActiveIdToSet !== activeChannelId) {
      onSelectChannel(newActiveIdToSet);
    }

  }, [urlChannelId, activeChannelId, effectiveActiveChannelId, channels, onSelectChannel, navigate, location.pathname]);
  
  const currentActiveChannelDetails = channels.find(ch => ch.id === effectiveActiveChannelId);
  const activeChannelMessages = effectiveActiveChannelId ? messages[effectiveActiveChannelId] || [] : [];

  const handleChannelSelectAndNavigate = (newChannelId: string) => {
    // onSelectChannel will be called by the useEffect when the URL changes,
    // or if already called, this ensures navigation.
    if (newChannelId !== effectiveActiveChannelId) {
        navigate(`/chat/${newChannelId}`); // Let useEffect handle onSelectChannel
    } else {
        // If clicking the already active channel, still ensure it's marked read
        onSelectChannel(newChannelId);
    }
  };
  
  // If channels haven't loaded yet or are empty, show a loading/empty state.
  if (channels.length === 0) {
    return (
      <div className="flex h-screen w-screen bg-gray-100 items-center justify-center">
        <div className="text-center p-8">
           <svg className="mx-auto h-16 w-16 text-gray-400 animate-spin mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-700">Loading Channels...</h3>
          <p className="mt-1 text-sm text-gray-500">
            If this persists, please check the application configuration.
          </p>
           <button 
              onClick={() => navigate('/')} 
              className="mt-6 px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors"
            >
              Go to Dashboard
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar for channels */}
      <div className="w-full sm:w-1/3 md:w-1/4 bg-slate-800 text-slate-100 flex flex-col border-r border-slate-700 shadow-lg">
        <div className="p-4 border-b border-slate-700 flex items-center space-x-3 sticky top-0 bg-slate-800 z-10">
           <button 
              onClick={() => navigate('/')} 
              aria-label="Back to Dashboard"
              className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
            <ArrowLeftIcon className="w-5 h-5 text-slate-300"/>
          </button>
          <h2 className="text-xl font-semibold text-slate-200">Channels</h2>
        </div>
        <ChannelList
          channels={channels}
          activeChannelId={effectiveActiveChannelId} // Use effective ID for highlighting
          onSelectChannel={handleChannelSelectAndNavigate}
        />
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {currentActiveChannelDetails && currentUser ? (
          <ChatWindow
            key={currentActiveChannelDetails.id} // Add key to force re-mount on channel change for scroll reset
            channel={currentActiveChannelDetails}
            messages={activeChannelMessages}
            onSendMessage={onSendMessage}
            currentUser={currentUser}
            users={users}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Select a Channel</h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose a conversation from the left panel to start chatting or view updates.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
