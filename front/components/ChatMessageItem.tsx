import React from 'react';
import { Message, User } from '../types'; 
import { CURRENT_USER_ID } from '../constants'; // Ensure this is the correct path

const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const seconds = Math.round((now - timestamp) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 5) return `just now`;
  if (seconds < 60) return `${seconds}s ago`;
  if (minutes === 1) return `1m ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours === 1) return `1h ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return `1d ago`;
  return `${days}d ago`;
};

interface ChatMessageItemProps {
  message: Message;
  sender?: User;
  currentUser: User;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, sender, currentUser }) => {
  const isCurrentUserMessage = message.senderId === currentUser.id;
  
  const avatarUrl = sender?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent((sender?.name || 'U').substring(0,2))}&background=random&color=fff&size=40`;
  const senderName = sender?.name || 'Unknown User';

  const messageLines = message.text.split('\\n'); // Handle escaped newlines if coming from string literal
  const firstLine = messageLines[0];
  const restOfMessage = messageLines.slice(1).join('\n'); // Join back with actual newlines for display
  
  // Specific styling for SDRBot's "draft an email" message from the design
  const isSDRBotSpecialMessage = sender?.name === 'SDRBot' && 
                                 firstLine.toLowerCase().includes('draft an email') && 
                                 messageLines.length > 1;
  // Specific styling for Merdan's message with mock reactions from the design
  const isMerdanMessageWithReactions = sender?.name === 'Merdan' && 
                                       messageLines.length > 1 && 
                                       /^[😡🤯✔️🗡️👍👎\s]+$/.test(messageLines[messageLines.length - 1].trim()); // Allow spaces between emojis
  
  const mainMessageText = isMerdanMessageWithReactions ? messageLines.slice(0, -1).join('\n') : (isSDRBotSpecialMessage ? '' : firstLine);
  const quotedSDRMessage = isSDRBotSpecialMessage ? restOfMessage : '';
  const reactionsText = isMerdanMessageWithReactions ? messageLines[messageLines.length -1].trim() : null;

  if (isCurrentUserMessage) {
    return (
      <div className="flex justify-end mb-2.5 sm:mb-3">
        <div className="max-w-[75%] sm:max-w-[65%]">
          <div className="bg-sky-600 text-white p-2.5 sm:p-3 rounded-xl rounded-br-lg shadow">
            <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
          </div>
          <div className="text-xs text-slate-500 mt-1 text-right px-1">
            {formatRelativeTime(message.timestamp)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start mb-3 sm:mb-3.5">
      <img
        src={avatarUrl}
        alt={senderName}
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full mr-2.5 sm:mr-3 mt-0.5 flex-shrink-0 border border-slate-700 object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName.substring(0,2))}&background=random&color=fff&size=40`;
        }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between mb-0.5">
          <span className="font-semibold text-sm text-slate-200">
            {senderName}
            {isSDRBotSpecialMessage && (
              <span className="font-normal text-slate-400 ml-1.5 text-xs">
                {firstLine.replace(/draft an email/i, '').trim()}
              </span>
            )}
          </span>
          <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
            {formatRelativeTime(message.timestamp)}
          </span>
        </div>
        <div className={`bg-slate-750 p-2.5 sm:p-3 rounded-xl rounded-tl-lg shadow text-sm text-slate-200 break-words ${isSDRBotSpecialMessage ? 'border-l-2 border-slate-500 pl-3' : ''}`}>
           {isSDRBotSpecialMessage ? (
             <p className="italic text-slate-300 whitespace-pre-wrap">{quotedSDRMessage}</p>
           ) : isMerdanMessageWithReactions ? (
             <>
                <p className="whitespace-pre-wrap">{mainMessageText}</p>
                {reactionsText && <p className="mt-1.5 text-base" aria-label="Reactions">{
                    reactionsText.split('').map((r, i) => <span key={i} className="mx-0.5">{r}</span>)
                }</p>}
             </>
           ) : (
             <p className="whitespace-pre-wrap">{message.text}</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;