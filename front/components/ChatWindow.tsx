import React, { useState, useEffect, useRef, JSX } from 'react';
import { Channel, Message, User } from '../types';
import { SendIcon, CURRENT_USER_ID, UsersIcon } from '../constants'; // Added SendIcon, CURRENT_USER_ID

interface ChatMessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  sender?: User;
}

// Renamed from 'ChatMessageItem' in the original working file to match usage, and applied new styles
const ChatMessageItem = ({ message, isCurrentUser, sender }: ChatMessageItemProps): JSX.Element => {
  const senderName = isCurrentUser ? 'You' : sender?.name || 'Unknown User';
  // CURRENT_USER_ID is used here, ensure it's available from constants
  const defaultAvatarSeed = isCurrentUser ? CURRENT_USER_ID : (sender?.id || message.senderId);
  const avatarUrl = sender?.avatarUrl || `https://picsum.photos/seed/${defaultAvatarSeed}/40/40`;

  return (
    <div className={`flex items-start mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <img
          src={avatarUrl}
          alt={senderName}
          className="w-8 h-8 rounded-full mr-3 object-cover flex-shrink-0 border border-slate-700" // Applied new style: border
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/error/40/40`)}
        />
      )}
      <div
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-xl shadow-md
                    ${isCurrentUser ? 'bg-sky-500 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none'}`} // Applied new style: non-current user bg/text
      >
        {!isCurrentUser && <p className="text-xs font-semibold mb-0.5 text-sky-400">{senderName}</p>} {/* Applied new style: sender name text color */}
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <p className={`text-xs mt-1.5 ${isCurrentUser ? 'text-sky-100' : 'text-slate-400'} text-right`}> {/* Applied new style: timestamp text color */}
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isCurrentUser && (
         <img
          src={avatarUrl}
          alt={senderName}
          className="w-8 h-8 rounded-full ml-3 object-cover flex-shrink-0 border border-slate-700" // Applied new style: border
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/error/40/40`)}
        />
      )}
    </div>
  );
};

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  isConnected: boolean;
}

// Renamed from 'ChatInputBar' in the original working file to match usage, and applied new styles
const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, isConnected }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && isConnected) { // Retained isConnected logic
      onSendMessage(inputText);
      setInputText('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-700 bg-slate-800 flex items-center space-x-2 sm:space-x-3"> {/* Applied new style: border, bg */}
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={isConnected ? "Type your message..." : "Connecting to chat..."} // Retained conditional placeholder
        aria-label="Chat message input"
        className="flex-1 p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-shadow text-sm bg-slate-700 text-slate-100 placeholder-slate-400" // Applied new styles
        disabled={!isConnected} // Retained isConnected logic
      />
      <button
        type="submit"
        aria-label="Send message"
        className="px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed" // Style is the same
        disabled={!inputText.trim() || !isConnected} // Retained isConnected logic
      >
        <SendIcon className="w-5 h-5" /> {/* SendIcon is used */}
      </button>
    </form>
  );
};


interface ChatWindowProps {
  channel: Channel;
  messages: Message[];
  onSendMessage: (channelId: string, text: string) => void;
  currentUser: User;
  users: User[];
  isConnected: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ channel, messages, onSendMessage, currentUser, users, isConnected }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, [channel.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen bg-slate-800 text-slate-100"> {/* Applied new style: bg, text */}
      <header className="p-3 sm:p-4 border-b border-slate-700 bg-slate-800 flex items-center space-x-3 sticky top-0 z-10 shadow-sm"> {/* Applied new style: border, bg */}
        <img
          src={channel.avatarUrl || `https://picsum.photos/seed/${channel.id}/48/48`}
          alt={`${channel.name} avatar`}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-600" // Applied new style: border color
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/error/48/48`)}
        />
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-100">{channel.name}</h2> {/* Applied new style: text color */}
          <div className="text-xs sm:text-sm text-slate-400 flex items-center space-x-1"> {/* Applied new style: text color */}
            <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{channel.members.length} members</span>
            {channel.unreadCount > 0 && (
              <span className="hidden sm:inline">| <span className="font-medium text-red-400">{channel.unreadCount} unread</span></span> // Applied new style: unread text color
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-3 sm:p-4 overflow-y-auto bg-slate-850 custom-scrollbar-dark"> {/* Applied new style: bg, scrollbar class */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <svg className="w-16 h-16 mb-4 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> {/* Applied new style: icon color */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">No messages yet in <span className="font-semibold text-slate-400">{channel.name}</span>.</p> {/* Applied new style: channel name text color */}
            <p className="text-sm">Be the first to say something or wait for an update!</p>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessageItem // Changed from ChatMessageItemUI to use the local, styled component
            key={msg.id}
            message={msg}
            sender={getUserById(msg.senderId)}
            isCurrentUser={msg.senderId === currentUser.id} // Passing isCurrentUser directly
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <ChatInputBar // Changed from ChatInputBarUI to use the local, styled component
        onSendMessage={(text) => onSendMessage(channel.id, text)}
        isConnected={isConnected} // Passing isConnected
        // Removed channelName prop as it's not used by ChatInputBar
      />
    </div>
  );
};