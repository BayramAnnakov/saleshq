import React from 'react';
import { User, Channel } from './types';

// The user interacting with this dashboard application
export const CURRENT_USER_ID = 'user_current_app_user'; 

// Simulated Sales Team Users & System Bots for the UI designs
export const MOCK_DESIGN_USERS: User[] = [
  { id: CURRENT_USER_ID, name: 'You', avatarUrl: 'https://picsum.photos/seed/currentUser/100/100' },
  { id: 'bayram', name: 'Bayram', avatarUrl: 'https://picsum.photos/seed/bayram/100/100' },
  { id: 'merdan', name: 'Merdan', avatarUrl: 'https://picsum.photos/seed/merdan/100/100' },
  { id: 'system_bot_researcher', name: 'Researcher', avatarUrl: 'https://picsum.photos/seed/researcher/100/100' },
  { id: 'system_bot_sdr', name: 'SDR', avatarUrl: 'https://picsum.photos/seed/sdr/100/100' },
  { id: 'system_bot_scheduler', name: 'Scheduler', avatarUrl: 'https://picsum.photos/seed/scheduler/100/100' },
];

// Combine all users for easier lookup.
export const ALL_MOCK_USERS: User[] = MOCK_DESIGN_USERS; // Prioritize design users

// Channels for the SalesHQ Control Tower
export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'Amazon',
    name: 'Amazon',
    avatarUrl: 'https://picsum.photos/seed/amazon/100/100',
    lastMessagePreview: 'No messages yet',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 5,
    unreadCount: 0,
    members: ALL_MOCK_USERS.filter(u => [CURRENT_USER_ID, 'bayram', 'merdan', 'researcher', 'sdr', 'scheduler'].includes(u.id)),
  },
  {
    id: 'Google',
    name: 'Google',
    avatarUrl: 'https://picsum.photos/seed/google/100/100',
    lastMessagePreview: 'No messages yet',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 10,
    unreadCount: 0,
    members: ALL_MOCK_USERS.filter(u => [CURRENT_USER_ID, 'bayram', 'merdan', 'researcher', 'sdr', 'scheduler'].includes(u.id)),
  },
  {
    id: 'OpenAI',
    name: 'OpenAI',
    avatarUrl: 'https://picsum.photos/seed/openai/100/100',
    lastMessagePreview: 'No messages yet',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 15,
    unreadCount: 0,
    members: ALL_MOCK_USERS.filter(u => [CURRENT_USER_ID, 'bayram', 'merdan', 'researcher', 'sdr', 'scheduler'].includes(u.id)),
  },
];

// SVG Icons
const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "w-6 h-6 inline-block" }) => (
  <span className={className}>{children}</span>
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  </IconWrapper>
);

export const UserOutlineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  </IconWrapper>
);

export const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.5 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  </IconWrapper>
);

export const ChatBubbleAltIcon: React.FC<{ className?: string }> = ({ className }) => ( // Used in Control Tower Header & ChatPage
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443h2.393c1.584 0 2.707-1.407 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.344 48.344 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  </IconWrapper>
);

export const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  </IconWrapper>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  </IconWrapper>
);

export const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    {/* Standardized Bot Icon from previous image assets */}
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/>
      <path d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z"/>
      <circle cx="8.5" cy="10.5" r="1.5"/>
      <circle cx="15.5" cy="10.5" r="1.5"/>
    </svg>
  </IconWrapper>
);

export const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93s.844.17 1.259.02l.865-.34c.52-.206 1.096.09 1.337.586l.547 1.093c.24.496.088 1.105-.32 1.459l-.757.68c-.39.35-.624.85-.624 1.38s.234 1.03.624 1.38l.757.68c.408.354.56.963.32 1.459l-.547-1.093c-.24.496-.817.792-1.337.586l-.865-.34c-.415-.148-.89-.048-1.259.02s-.71.506-.78.93l-.149.894c-.09.542-.56.94-1.11.94h-1.093c-.55 0-1.02-.398-1.11-.94l-.149-.894c-.07-.424-.384-.764-.78-.93s-.844-.17-1.259-.02l-.865.34c-.52-.206-1.096-.09-1.337-.586l-.547-1.093c-.24-.496-.088-1.105.32-1.459l.757-.68c.39-.35.624.85.624-1.38s-.234-1.03-.624-1.38l-.757-.68c-.408-.354-.56-.963.32-1.459l.547-1.093c.24-.496.817-.792-1.337-.586l.865.34c.415.148.89.048 1.259-.02s.71-.506.78-.93l.149-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  </IconWrapper>
);


export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  </IconWrapper>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  </IconWrapper>
);

// Icons for ChatPage Header (from Amazon Account Room design)
export const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  </IconWrapper>
);

export const DocumentDuplicateIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 4.625v2.625a2.25 2.25 0 01-2.25 2.25H15M6.75 21H9v-2.625M3.75 17.25V7.875c0-.621.504-1.125 1.125-1.125H6.75m0 0H21m-14.25 0a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25m-4.5 0V21" />
    </svg>
  </IconWrapper>
);

export const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  </IconWrapper>
);

export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  </IconWrapper>
);

export const SmileIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4.072 4.072 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </IconWrapper>
);

// Simple text-based Emoji components from ControlTowerPage design
export const EmojiLaugh: React.FC<{ className?: string }> = ({ className }) => <span className={className} role="img" aria-label="laughing emoji">😂</span>;
export const EmojiMoney: React.FC<{ className?: string }> = ({ className }) => <span className={className} role="img" aria-label="money emoji">🤑</span>;
export const EmojiNerd: React.FC<{ className?: string }> = ({ className }) => <span className={className} role="img" aria-label="nerd emoji">🤓</span>;
export const EmojiParty: React.FC<{ className?: string }> = ({ className }) => <span className={className} role="img" aria-label="party emoji">🎉</span>;
export const EmojiGrimace: React.FC<{ className?: string }> = ({ className }) => <span className={className} role="img" aria-label="grimacing emoji">😬</span>;

// Your existing icons, kept for completeness / if used by WebSocket generic messages
export const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  </IconWrapper>
);

// Generic ChatBubbleIcon (can be used for placeholders if ChannelList / ChatPage needs it for empty states)
export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.861 8.25-8.625 8.25S3.75 16.556 3.75 12C3.75 7.444 7.611 3.75 12.375 3.75S21 7.444 21 12z" />
    </svg>
  </IconWrapper>
);

// UsersIcon (now UserOutlineIcon is preferred for profile, but keep if used elsewhere)
export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  </IconWrapper>
);

// Original KPI icons - these are not directly used in the new designs but kept in case your WebSocket logic sends messages that might reference them indirectly or for other parts of your app.
export const LeadsIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <IconWrapper className={className}>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A8.962 8.962 0 016 18v-3.09m0 0v-3.09m0 0a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25m-6 0a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25m0 0V5.172a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v3.09m0 0A2.25 2.25 0 019 13.5h1.5a2.25 2.25 0 012.25-2.25m0 0V6a2.25 2.25 0 00-2.25-2.25H9A2.25 2.25 0 006.75 6v3.09m11.25 6A2.25 2.25 0 0019.5 15V5.25A2.25 2.25 0 0017.25 3h-1.5a2.25 2.25 0 00-2.25 2.25v.091M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A8.962 8.962 0 016 18v-3.09" />
  </svg>
  </IconWrapper>
);

export const FollowUpIcon: React.FC<{ className?: string }> = ({ className }) => ( 
  <IconWrapper className={className}>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
  </IconWrapper>
);

export const ProposalIcon: React.FC<{ className?: string }> = ({ className }) => ( 
 <IconWrapper className={className}>
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
</svg>
</IconWrapper>
);

export const AlertIcon: React.FC<{ className?: string }> = ({ className }) => ( 
 <IconWrapper className={className}>
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
</svg>
</IconWrapper>
);




// ChartIcon from your constants.tsx - not directly in SalesHQ designs but could be useful.
export const ChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <IconWrapper className={className}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V9m4 8V5m4 12v-4" />
    </svg>
  </IconWrapper>
);
