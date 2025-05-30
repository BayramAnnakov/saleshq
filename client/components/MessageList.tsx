
import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUser: string;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  if (messages.length === 0) {
    return <div className="flex-grow flex items-center justify-center text-slate-400">No messages in this channel yet.</div>;
  }

  return (
    <div className="flex-grow overflow-y-auto space-y-3 pr-2 mb-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col ${msg.userId === currentUser ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow ${
              msg.userId === currentUser
                ? 'bg-sky-600 text-white'
                : 'bg-slate-500 text-slate-100'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold opacity-80">
                    {msg.userId === currentUser ? 'You' : msg.userId}
                </span>
                <span className="text-xs opacity-70 ml-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
            </div>
            <p className="text-sm break-words">{msg.text}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
    