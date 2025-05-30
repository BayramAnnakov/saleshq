
import React from 'react';
import { ChannelSelector } from './ChannelSelector';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import type { Message, Channel } from '../types';

interface ChatInterfaceProps {
  channels: Channel[];
  currentChannel: string;
  setCurrentChannel: (channelId: string) => void;
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUser: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  channels,
  currentChannel,
  setCurrentChannel,
  messages,
  onSendMessage,
  currentUser
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <ChannelSelector
        channels={channels}
        currentChannel={currentChannel}
        onSelectChannel={setCurrentChannel}
      />
      <div className="bg-slate-700 p-4 rounded-lg shadow-inner flex-grow h-[400px] flex flex-col">
        <MessageList messages={messages} currentUser={currentUser} />
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
};
    