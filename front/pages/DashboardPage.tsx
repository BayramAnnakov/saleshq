import React from 'react';
import { Link } from 'react-router-dom';
import { Channel } from '../types';
import { LeadsIcon, FollowUpIcon, ProposalIcon, AlertIcon, CogIcon } from '../constants'; // Using available icons

interface DashboardPageProps {
  channels: Channel[];
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  linkTo: string;
  cta: string;
  attention?: boolean;
  channelId: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, linkTo, cta, attention }) => (
  <div className={`bg-white shadow-xl rounded-xl p-6 flex flex-col justify-between transform transition-all hover:scale-105 hover:shadow-2xl ${attention ? 'ring-2 ring-red-500 animate-pulse-slow' : 'ring-1 ring-slate-200'}`}>
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className={`p-3 rounded-full ${attention ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'}`}>
          {icon}
        </div>
      </div>
      <p className={`text-5xl font-bold mb-1 ${attention ? 'text-red-600' : 'text-gray-800'}`}>{value}</p>
      <p className={`text-sm ${attention ? 'text-red-500' : 'text-gray-500'}`}>
        {attention ? (Number(value) === 1 ? 'New Item' : 'New Items') : 'Up to date'}
      </p>
    </div>
    <Link
      to={linkTo}
      className={`mt-6 block w-full text-center px-4 py-3 rounded-lg font-semibold transition-colors
                  ${attention ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                              : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md hover:shadow-lg'}`}
    >
      {cta}
    </Link>
  </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ channels }) => {
  const targetChannelIds = [
    'channel_samang', 
    'channel_al_hay', 
    'channel_human_apport', 
    'channel_ren', 
    'channel_hunter', 
    'channel_nice_vo'
  ];

  const displayChannels = channels.filter(ch => targetChannelIds.includes(ch.id));

  const getIconForChannel = (channelId: string): React.ReactNode => {
    switch (channelId) {
      case 'channel_samang':        return <CogIcon className="w-8 h-8" />;        // General AI / System
      case 'channel_al_hay':      return <LeadsIcon className="w-8 h-8" />;        // Prospector
      case 'channel_human_apport':  return <FollowUpIcon className="w-8 h-8" />;   // SDR / Follow-up
      case 'channel_ren':           return <LeadsIcon className="w-8 h-8" />;        // Hunter
      case 'channel_hunter':        return <LeadsIcon className="w-8 h-8" />;        // Hunter Bot
      case 'channel_nice_vo':       return <ProposalIcon className="w-8 h-8" />;   // Qualifier / Proposals
      default:                      return <AlertIcon className="w-8 h-8" />;        // Default fallback
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">Sales Dashboard</h1>
        <p className="text-lg sm:text-xl text-slate-300">Your command center for sales activities.</p>
      </header>

      {displayChannels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl mb-10">
          {displayChannels.map(channel => (
            <DashboardCard
              key={channel.id}
              channelId={channel.id}
              title={channel.name || 'Unnamed Channel'} // Use channel.name, provide fallback
              value={channel.unreadCount}
              icon={getIconForChannel(channel.id)}
              linkTo={`/chat/${channel.id}`}
              cta={`Open ${channel.name || 'Channel'}`}
              attention={channel.unreadCount > 0}
            />
          ))}
        </div>
      )}
      
      {displayChannels.length === 0 && channels.length > 0 && (
         <div className="text-center text-slate-400 p-8 bg-slate-800 rounded-lg shadow-xl mt-10">
            <h2 className="text-2xl font-semibold mb-3">Specified Channels Not Found</h2>
            <p>The required sales channels for this view are not available. Please check the configuration or channel data.</p>
        </div>
      )}

      {channels.length === 0 && (
         <div className="text-center text-slate-400 p-8 bg-slate-800 rounded-lg shadow-xl mt-10">
            <h2 className="text-2xl font-semibold mb-3">Channels Not Loaded</h2>
            <p>Sales channel data is currently unavailable. Please check configuration.</p>
        </div>
      )}

      <footer className="mt-auto pt-8 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Sales Automation Platform. All rights reserved.</p>
        <div className="mt-2 flex items-center justify-center space-x-2">
          <CogIcon className="w-4 h-4" /> 
          <span>System status: All systems operational.</span>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;