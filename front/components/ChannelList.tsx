import React from 'react';

// --- Placeholder types and constants (replace with your actual imports) ---
// Placeholder for '../types'
interface Channel {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessageTimestamp?: number;
  lastMessagePreview?: string;
  unreadCount: number;
}

// Placeholder for '../constants'
// Using a simple SVG for ChatBubbleIcon for demonstration
const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.68-3.091a4.501 4.501 0 00-1.394-.241H5.25c-1.136 0-2.097-.847-2.193-1.98A11.997 11.997 0 012.75 15V9.75c0-1.136.847-2.097 1.98-2.193.34-.027.68-.052 1.02-.072V4.504l3.68 3.09A4.506 4.506 0 0013.5 7.5h3.091c.416 0 .804.062 1.166.174.285.088.56.199.814.327zM4.5 15V9.75M18.75 15V9.75" />
  </svg>
);
// --- End of Placeholder types and constants ---

interface ChannelListItemProps {
  channel: Channel;
  isActive: boolean;
  onSelect: () => void;
}

const ChannelListItem: React.FC<ChannelListItemProps> = ({ channel, isActive, onSelect }) => {
  // Helper function to truncate strings
  const truncate = (str: string, num: number) => {
    if (!str) return '';
    return str.length <= num ? str : str.slice(0, num) + "...";
  };
  
  return (
    <li
      onClick={onSelect}
      role="link"
      tabIndex={0}
      aria-current={isActive ? "page" : undefined}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect();}}
      // Đây là dòng đã được cập nhật với các thay đổi UI mong muốn
      className={`px-3 py-3 sm:px-4 sm:py-3.5 flex items-center space-x-3 cursor-pointer transition-all duration-150 ease-in-out border-b border-slate-700 last:border-b-0
                  ${isActive ? 'bg-sky-600 shadow-inner text-white' : 'text-slate-200 hover:bg-slate-700/70 focus:bg-slate-700/70 focus:outline-none focus:ring-1 focus:ring-sky-500'}`}
    >
      <img 
        src={channel.avatarUrl || `https://picsum.photos/seed/${channel.id}/40/40`} 
        alt={`${channel.name} channel`}
        className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 flex-shrink-0"
        // Fallback image in case the primary one fails
        onError={(e) => (e.currentTarget.src = `https://placehold.co/40x40/FF0000/FFFFFF?text=Error`)}
      />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={`font-semibold text-sm ${isActive ? 'text-white' : 'text-slate-100'}`}>
            {channel.name}
          </h3>
          {channel.lastMessageTimestamp && (
            <span className={`text-xs flex-shrink-0 ml-2 ${isActive ? 'text-sky-200' : 'text-slate-400'}`}>
              {new Date(channel.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="flex justify-between items-start mt-1">
          <p className={`text-xs truncate ${isActive ? 'text-sky-100' : 'text-slate-300/80'}`}>
            {channel.lastMessagePreview ? truncate(channel.lastMessagePreview, 30) : 'No messages yet'}
          </p>
          {channel.unreadCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
              {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

interface ChannelListProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (channelId: string) => void;
}

const ChannelList: React.FC<ChannelListProps> = ({ channels, activeChannelId, onSelectChannel }) => {
  // Display a message if there are no channels
  if (channels.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-slate-400 bg-slate-800 h-full">
        <ChatBubbleIcon className="w-12 h-12 mb-3 text-slate-500"/>
        <p className="text-sm font-semibold text-slate-300">No Channels Available</p>
        <p className="text-xs mt-1 text-slate-400">Sales channels will appear here once configured.</p>
      </div>
    );
  }
  
  // Sort channels: unread first, then by most recent message
  const sortedChannels = [...channels].sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1; // a comes first if unread and b is not
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;  // b comes first if unread and a is not
    // If both have same unread status (both >0 or both 0), sort by timestamp
    return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
  });
  
  return (
    <ul className="flex-1 overflow-y-auto custom-scrollbar-dark bg-slate-800 h-full" aria-label="Chat channels">
      {/* Custom scrollbar style (add this to your global CSS if needed) */}
      <style jsx global>{`
        .custom-scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-track {
          background: #1e293b; /* slate-800 */
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb {
          background: #475569; /* slate-600 */
          border-radius: 4px;
        }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #64748b; /* slate-500 */
        }
      `}</style>
      {sortedChannels.map(channel => (
        <ChannelListItem
          key={channel.id}
          channel={channel}
          isActive={channel.id === activeChannelId}
          onSelect={() => onSelectChannel(channel.id)}
        />
      ))}
    </ul>
  );
};


export default ChannelList;
