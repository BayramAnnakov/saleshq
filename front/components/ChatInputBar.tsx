import React, { useState, useRef } from 'react';
import { SendIcon, SmileIcon } from '../constants';

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  channelName?: string;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({ onSendMessage, channelName }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2.5 sm:p-3 border-t border-slate-700 bg-slate-850 flex items-center space-x-2 sm:space-x-2.5 flex-shrink-0"
      aria-label={`Message input for ${channelName || 'current chat'}`}
    >
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a comment..."
          aria-label="Type your message"
          className="w-full py-2.5 px-4 pr-10 border border-slate-600 rounded-lg focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-shadow text-sm bg-slate-700 text-slate-100 placeholder-slate-400"
        />
        <button
          type="button"
          aria-label="Add emoji"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-slate-400 hover:text-sky-400 transition-colors"
          onClick={() => { /* Emoji picker placeholder */ }}
        >
          <SmileIcon className="w-5 h-5" />
        </button>
      </div>
      <button
        type="submit"
        aria-label="Send message"
        className="p-2.5 sm:p-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-70 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-sky-600"
        disabled={!inputText.trim()}
      >
        <SendIcon className="w-5 h-5" />
      </button>
    </form>
  );
};

export default ChatInputBar;