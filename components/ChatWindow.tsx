
import React, { useState, useEffect, useRef } from 'react';
import { Channel, Message, User } from '../types';
import { SendIcon, CURRENT_USER_ID, UsersIcon } from '../constants'; // Added UsersIcon for member count

interface ChatMessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  sender?: User;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, isCurrentUser, sender }) => {
  const senderName = isCurrentUser ? 'You' : sender?.name || 'Unknown User';
  // Use a fallback avatar if sender specific one isn't available, differentiating current user.
  const defaultAvatarSeed = isCurrentUser ? CURRENT_USER_ID : (sender?.id || message.senderId);
  const avatarUrl = sender?.avatarUrl || `https://picsum.photos/seed/${defaultAvatarSeed}/40/40`;

  return (
    <div className={`flex items-start mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <img 
          src={avatarUrl}
          alt={senderName} 
          className="w-8 h-8 rounded-full mr-3 object-cover flex-shrink-0"
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/error/40/40`)} // Fallback for broken image links
        />
      )}
      <div 
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-xl shadow-md
                    ${isCurrentUser ? 'bg-sky-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}
      >
        {!isCurrentUser && <p className="text-xs font-semibold mb-0.5 text-sky-700">{senderName}</p>}
        <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
        <p className={`text-xs mt-1.5 ${isCurrentUser ? 'text-sky-100' : 'text-slate-500'} text-right`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      {isCurrentUser && (
         <img 
          src={avatarUrl}
          alt={senderName} 
          className="w-8 h-8 rounded-full ml-3 object-cover flex-shrink-0"
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/error/40/40`)}
        />
      )}
    </div>
  );
};

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex items-center space-x-2 sm:space-x-3">
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Type your message..."
        aria-label="Chat message input"
        className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-shadow text-sm"
      />
      <button
        type="submit"
        aria-label="Send message"
        className="px-4 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={!inputText.trim()}
      >
        <SendIcon className="w-5 h-5" />
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
}

const ChatWindow: React.FC<ChatWindowProps> = ({ channel, messages, onSendMessage, currentUser, users }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("auto"); // Initial scroll without animation
  }, [channel.id]); // Scroll to bottom when channel changes

  useEffect(() => {
    scrollToBottom(); // Smooth scroll for new messages
  }, [messages]);
  
  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  return (
    <div className="flex-1 flex flex-col h-full max-h-screen">
      {/* Chat Header */}
      <header className="p-3 sm:p-4 border-b border-slate-200 bg-white flex items-center space-x-3 sticky top-0 z-10 shadow-sm">
        <img 
          src={channel.avatarUrl || `https://picsum.photos/seed/${channel.id}/48/48`}
          alt={`${channel.name} avatar`}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-200"
          onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/error/48/48`)}
        />
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-800">{channel.name}</h2>
          <div className="text-xs sm:text-sm text-slate-500 flex items-center space-x-1">
            <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{channel.members.length} members</span>
            {channel.unreadCount > 0 && (
              <span className="hidden sm:inline">| <span className="font-medium text-red-500">{channel.unreadCount} unread</span></span>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 p-3 sm:p-4 overflow-y-auto bg-slate-50 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <svg className="w-16 h-16 mb-4 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg">No messages yet in <span className="font-semibold">{channel.name}</span>.</p>
            <p className="text-sm">Be the first to say something or wait for an update!</p>
          </div>
        )}
        {messages.map(msg => (
          <ChatMessageItem
            key={msg.id}
            message={msg}
            isCurrentUser={msg.senderId === currentUser.id}
            sender={getUserById(msg.senderId)}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Bar */}
      <ChatInputBar onSendMessage={(text) => onSendMessage(channel.id, text)} />
    </div>
  );
};

export default ChatWindow;