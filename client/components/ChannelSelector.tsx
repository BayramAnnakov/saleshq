
import React from 'react';
import type { Channel } from '../types';

interface ChannelSelectorProps {
  channels: Channel[];
  currentChannel: string;
  onSelectChannel: (channelId: string) => void;
}

export const ChannelSelector: React.FC<ChannelSelectorProps> = ({ channels, currentChannel, onSelectChannel }) => {
  return (
    <div className="mb-4">
      <label htmlFor="channel" className="block text-sm font-medium text-sky-300 mb-1">
        Select Channel:
      </label>
      <select
        id="channel"
        value={currentChannel}
        onChange={(e) => onSelectChannel(e.target.value)}
        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
      >
        {channels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.name}
          </option>
        ))}
      </select>
    </div>
  );
};
    