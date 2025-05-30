import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Channel, Message, User } from '../types';
import ChannelList from '../components/ChannelList';
import { ChatWindow } from '../components/ChatWindow'; // Retained named import
import { ArrowLeftIcon } from '../constants';

interface ChatPageProps {
  channels: Channel[];
  messages: Record<string, Message[]>;
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
  onSendMessage: (channelId: string, text: string) => void;
  currentUser: User;
  users: User[];
  isConnected: boolean; // Retained isConnected prop
}

const ChatPage: React.FC<ChatPageProps> = ({
  channels,
  messages,
  activeChannelId,
  onSelectChannel,
  onSendMessage,
  currentUser,
  users,
  isConnected // Retained isConnected prop
}) => {
  const { channelId: urlChannelId } = useParams<{ channelId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const effectiveActiveChannelId = useMemo(() => {
    if (urlChannelId && channels.find(c => c.id === urlChannelId)) {
      return urlChannelId;
    }
    return activeChannelId;
  }, [urlChannelId, activeChannelId, channels]);

  useEffect(() => {
    let newActiveIdToSet: string | null = null;

    if (urlChannelId && channels.find(c => c.id === urlChannelId)) {
      if (urlChannelId !== activeChannelId) {
        newActiveIdToSet = urlChannelId;
      }
    } else if (!effectiveActiveChannelId && channels.length > 0) {
      const firstUnreadChannel = channels.find(c => c.unreadCount > 0);
      const targetChannel = firstUnreadChannel || channels[0];

      if (targetChannel) {
        newActiveIdToSet = targetChannel.id;
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
    if (newChannelId !== effectiveActiveChannelId) {
        navigate(`/chat/${newChannelId}`);
    } else {
        onSelectChannel(newChannelId);
    }
  };

  if (channels.length === 0) {
    return (
      // UI changes from the desired file
      <div className="flex h-screen w-screen bg-slate-900 text-slate-300 items-center justify-center">
        <div className="text-center p-8">
           <svg className="mx-auto h-16 w-16 text-slate-500 animate-spin mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-300">Loading Channels...</h3>
          <p className="mt-1 text-sm text-slate-400">
            If this persists, please check the application configuration.
          </p>
           <button
              onClick={() => navigate('/')}
              // UI changes for button class and text
              className="mt-6 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
            >
              Go to Control Tower {/* Text changed */}
            </button>
        </div>
      </div>
    );
  }

  return (
    // UI changes from the desired file for the main container
    <div className="flex h-screen w-screen bg-slate-900 text-slate-100">
      {/* Sidebar - classes were mostly the same, ensuring consistency */}
      <div className="w-full sm:w-1/3 md:w-1/4 bg-slate-800 text-slate-100 flex flex-col border-r border-slate-700 shadow-lg">
        <div className="p-4 border-b border-slate-700 flex items-center space-x-3 sticky top-0 bg-slate-800 z-10">
           <button
              onClick={() => navigate('/')}
              aria-label="Back to Control Tower" // aria-label changed
              className="p-2 rounded-full hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
            <ArrowLeftIcon className="w-5 h-5 text-slate-300"/>
          </button>
          <h2 className="text-xl font-semibold text-slate-200">Channels</h2>
        </div>
        <ChannelList
          channels={channels}
          activeChannelId={effectiveActiveChannelId}
          onSelectChannel={handleChannelSelectAndNavigate}
        />
      </div>

      {/* Main chat window area - UI changes for background */}
      <div className="flex-1 flex flex-col bg-slate-850 overflow-hidden"> {/* Changed bg-white to bg-slate-850 */}
        {currentActiveChannelDetails && currentUser ? (
          <ChatWindow
            key={currentActiveChannelDetails.id}
            channel={currentActiveChannelDetails}
            messages={activeChannelMessages}
            onSendMessage={onSendMessage}
            currentUser={currentUser}
            users={users}
            isConnected={isConnected} // Ensured isConnected is passed
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              {/* UI changes for placeholder icon and text colors */}
              <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-slate-300">Select a Channel</h3>
              <p className="mt-1 text-sm text-slate-400">
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