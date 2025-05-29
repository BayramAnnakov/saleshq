import React from 'react';
import { User, Channel } from './types';

// The user interacting with this dashboard application
export const CURRENT_USER_ID = 'user_current_app_user'; 

// Simulated Sales Team Users & System Bot
// These users will be the Senders of messages in the channels
export const MOCK_SALES_TEAM_USERS: User[] = [
  { id: CURRENT_USER_ID, name: 'You (Dashboard User)', avatarUrl: 'https://picsum.photos/seed/currentUser/100/100' },
  { id: 'user_sales_sarah', name: 'Sarah Miller (Sales Rep)', avatarUrl: 'https://picsum.photos/seed/sarah/100/100' },
  { id: 'user_sales_john', name: 'John Davis (Sales Manager)', avatarUrl: 'https://picsum.photos/seed/john/100/100' },
  { id: 'user_sales_emily', name: 'Emily Carter (Account Exec)', avatarUrl: 'https://picsum.photos/seed/emily/100/100' },
  { id: 'user_sales_michael', name: 'Michael Chen (Sales Ops)', avatarUrl: 'https://picsum.photos/seed/michael/100/100' },
  { id: 'user_system_bot', name: 'SalesBot (System)', avatarUrl: 'https://picsum.photos/seed/bot/100/100' },
];

// Combine all users for easier lookup. The first user is the current dashboard user.
export const ALL_MOCK_USERS: User[] = MOCK_SALES_TEAM_USERS;

// Sales KPI Channels
export const INITIAL_CHANNELS: Channel[] = [
  {
    id: 'channel_leads',
    name: 'New Leads',
    avatarUrl: 'https://picsum.photos/seed/leadsChannel/100/100', // Consider specific icons later
    lastMessagePreview: 'Inquiry from Acme Corp about enterprise plan.',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    unreadCount: 2,
    members: ALL_MOCK_USERS.filter(u => u.id !== 'user_sales_michael'), // Example: Michael (Sales Ops) might not be in all lead discussions
  },
  {
    id: 'channel_followups',
    name: 'Follow-Ups Due',
    avatarUrl: 'https://picsum.photos/seed/followupsChannel/100/100',
    lastMessagePreview: 'Reminder: Follow up with Beta Inc scheduled for today 3 PM.',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    unreadCount: 1,
    members: ALL_MOCK_USERS.filter(u => u.id !== 'user_system_bot'), // Example: Bot might not be in direct follow-up discussions
  },
  {
    id: 'channel_proposals',
    name: 'Active Proposals',
    avatarUrl: 'https://picsum.photos/seed/proposalsChannel/100/100',
    lastMessagePreview: 'Proposal for Gamma Ltd sent. Awaiting feedback.',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
    unreadCount: 0,
    members: ALL_MOCK_USERS.filter(u => !['user_system_bot'].includes(u.id)),
  },
  {
    id: 'channel_alerts',
    name: 'Critical Alerts',
    avatarUrl: 'https://picsum.photos/seed/alertsChannel/100/100',
    lastMessagePreview: 'System Alert: Integration with CRM failed. Needs attention.',
    lastMessageTimestamp: Date.now() - 1000 * 60 * 2, // 2 minutes ago
    unreadCount: 3,
    members: ALL_MOCK_USERS, // All relevant members including system bot
  },
];

// SVG Icons (no changes from previous, kept for consistency)
export const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export const ChatBubbleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.543-3.091A9.117 9.117 0 0112.25 12.75h-1.5a9.117 9.117 0 01-3.201-.659L4.5 15.75V12.75A9.117 9.117 0 013.75 12.75H2.25c-1.136 0-1.98-.967-1.98-2.193v-4.286c0-.97.616-1.813 1.5-2.097A14.525 14.525 0 0112.25 6h1.5a14.525 14.525 0 016.5 2.511z" />
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

// Specific icons for Sales KPIs might be better
export const LeadsIcon: React.FC<{ className?: string }> = ({ className }) => ( // Placeholder, same as UsersIcon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A8.962 8.962 0 016 18v-3.09m0 0v-3.09m0 0a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25m-6 0a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25m0 0V5.172a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v3.09m0 0A2.25 2.25 0 019 13.5h1.5a2.25 2.25 0 012.25-2.25m0 0V6a2.25 2.25 0 00-2.25-2.25H9A2.25 2.25 0 006.75 6v3.09m11.25 6A2.25 2.25 0 0019.5 15V5.25A2.25 2.25 0 0017.25 3h-1.5a2.25 2.25 0 00-2.25 2.25v.091M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A8.962 8.962 0 016 18v-3.09" />
  </svg>
);

export const FollowUpIcon: React.FC<{ className?: string }> = ({ className }) => ( // Placeholder, Calendar icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
  </svg>
);

export const ProposalIcon: React.FC<{ className?: string }> = ({ className }) => ( // Placeholder, Document icon
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
</svg>
);

export const AlertIcon: React.FC<{ className?: string }> = ({ className }) => ( // Placeholder, Exclamation triangle
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
</svg>
);


export const CogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-1.5 0H12m7.5 0H12m2.25-4.5a3.75 3.75 0 10-7.5 0 3.75 3.75 0 007.5 0zM4.5 19.5a3.75 3.75 0 107.5 0 3.75 3.75 0 00-7.5 0zm11.25 0a3.75 3.75 0 107.5 0 3.75 3.75 0 00-7.5 0z" />
  </svg>
);
// UsersIcon is no longer used on dashboard, but keep for ChatWindow if needed or general use.
export const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);
