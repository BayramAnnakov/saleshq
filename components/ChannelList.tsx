
import React from 'react';
import { Channel } from '../types';
import { ChatBubbleIcon } from '../constants';

interface ChannelListItemProps {
  channel: Channel;
  isActive: boolean;
  onSelect: () => void;
}

const ChannelListItem: React.FC<ChannelListItemProps> = ({ channel, isActive, onSelect }) => {
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
      className={`px-3 py-3 sm:px-4 sm:py-3.5 flex items-center space-x-3 cursor-pointer transition-all duration-150 ease-in-out border-b border-slate-700 last:border-b-0
                  ${isActive ? 'bg-sky-600 shadow-inner' : 'hover:bg-slate-700/70 focus:bg-slate-700/70 focus:outline-none focus:ring-1 focus:ring-sky-500'}`}
    >
      <img 
        src={channel.avatarUrl || `https://picsum.photos/seed/${channel.id}/40/40`} 
        alt={`${channel.name} channel`}
        className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 flex-shrink-0"
        onError={(e) => (e.currentTarget.src = `https://picsum.photos/seed/error/40/40`)}
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
  if (channels.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-slate-400">
        <ChatBubbleIcon className="w-12 h-12 mb-3 text-slate-500"/>
        <p className="text-sm font-semibold">No Channels Available</p>
        <p className="text-xs mt-1">Sales channels will appear here once configured.</p>
      </div>
    );
  }
  
  // Sort channels: unread first, then by most recent message
  const sortedChannels = [...channels].sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
    return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
  });
  
  return (
    <ul className="flex-1 overflow-y-auto custom-scrollbar-dark" aria-label="Chat channels">
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