import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Channel, User } from '../types'; // Assuming types are in '../types'
import { 
  SearchIcon, UserOutlineIcon, UserPlusIcon, ChatBubbleAltIcon, LogoutIcon, CogIcon, MenuIcon,
  BotIcon, EmojiLaugh, EmojiMoney, EmojiNerd, EmojiParty, EmojiGrimace // Assuming these are in '../constants'
} from '../constants'; // Assuming icons are in '../constants'

// --- Mock Chart Components from File B ---
const MockPieChart: React.FC = () => (
  <div className="relative w-40 h-40 sm:w-48 sm:h-48 mx-auto">
    <svg viewBox="0 0 36 36" className="w-full h-full">
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="#1e293b" // slate-800
        strokeWidth="3"
      />
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 13.8023 23.8732 L18 18 Z"
        fill="#06b6d4" // cyan-500
        stroke="#0891b2" // cyan-600
        strokeWidth="0.5"
      />
      <path
        d="M18 2.0845
          a 15.9155 15.9155 0 0 1 -3.9809 30.8251 L18 18 Z"
        transform="rotate(250, 18, 18)" // Adjusted rotation for the third segment
        fill="#14b8a6" // teal-500
        stroke="#0f766e" // teal-700
        strokeWidth="0.5"
      />
       <circle cx="18" cy="18" r="8" fill="#0f172a" />
    </svg>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-2xl font-bold text-cyan-400">72%</span>
    </div>
  </div>
);

const MockSmallDonutChart: React.FC<{ percentage: number, label: string, value?: string }> = ({ percentage, label, value }) => (
    <div className="flex flex-col items-center p-3 bg-slate-700/50 rounded-lg shadow-md w-full">
        <div className="relative w-16 h-16 mb-2">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="transparent" stroke="#334155" strokeWidth="3" />
                <circle 
                    cx="18" cy="18" r="15.9155" fill="transparent" 
                    stroke="#22d3ee" // cyan-400
                    strokeWidth="3" 
                    strokeDasharray={`${percentage}, 100`} 
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-cyan-300">{value || `${percentage}%`}</span>
            </div>
        </div>
        <p className="text-xs text-slate-300 text-center">{label}</p>
    </div>
);

const MockBarChart: React.FC = () => (
  <div className="h-40 w-full bg-slate-700/30 p-3 rounded-lg flex items-end space-x-2">
    {[60, 80, 40, 70, 90, 50, 75, 30].map((height, idx) => (
      <div key={idx} className="flex-1 bg-cyan-500 rounded-t-sm hover:bg-cyan-400 transition-all" style={{ height: `${height}%` }} />
    ))}
  </div>
);

const MockLineChart: React.FC<{ small?: boolean }> = ({small}) => (
  <div className={`w-full bg-slate-700/30 p-3 rounded-lg ${small ? 'h-20' : 'h-40'}`}>
    <svg width="100%" height="100%" viewBox="0 0 100 50" preserveAspectRatio="none">
      <path d="M 0 40 C 10 10, 20 10, 30 20 S 40 5, 50 15 S 60 40, 70 30 S 80 10, 90 20 L 100 25" stroke="#22d3ee" strokeWidth="1.5" fill="none" />
       <defs>
        <linearGradient id="lineChartGradientMerged" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{stopColor: '#22d3ee', stopOpacity: 0.3}} />
          <stop offset="100%" style={{stopColor: '#0f172a', stopOpacity: 0.1}} />
        </linearGradient>
      </defs>
      <path d="M 0 40 C 10 10, 20 10, 30 20 S 40 5, 50 15 S 60 40, 70 30 S 80 10, 90 20 L 100 25 L 100 50 L 0 50 Z" fill="url(#lineChartGradientMerged)" />
    </svg>
  </div>
);

// --- ControlTowerChannelItem from File B ---
const ControlTowerChannelItem: React.FC<{ channel: Channel; onSelect: () => void; users: User[] }> = ({ channel, onSelect, users }) => {
  const getChannelUser = () => users.find(u => u.id === channel.members.find(m => m.id !== 'user_current_app_user')?.id || channel.members[0]?.id); // Consider replacing 'user_current_app_user' with currentUser.id if available and appropriate
  const channelUser = getChannelUser();
  const avatarUrl = channelUser?.avatarUrl || `https://picsum.photos/seed/${channel.id}/40/40`;
  const isBot = channelUser?.name === 'Samang' || channelUser?.name === 'Human Apport';


  const renderMessagePreview = (text: string) => {
    // This is a simplified example; a more robust solution would use a library or safer parsing
    let replacedText = text;
    if (typeof text === 'string') { // Ensure text is a string
        replacedText = text
            .replace(/😂/g, '<span role="img" aria-label="laughing emoji">😂</span>')
            .replace(/🤑/g, '<span role="img" aria-label="money emoji">🤑</span>')
            .replace(/🤓/g, '<span role="img" aria-label="nerd emoji">🤓</span>')
            .replace(/🎉/g, '<span role="img" aria-label="party emoji">🎉</span>')
            .replace(/😬/g, '<span role="img" aria-label="grimacing emoji">😬</span>');
    } else {
        replacedText = 'Invalid message preview'; // Fallback for non-string previews
    }
    return replacedText;
  };


  return (
    <li
      onClick={onSelect}
      className="bg-slate-800 p-3 rounded-lg shadow-lg hover:bg-slate-700/80 transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      aria-label={`Open chat with ${channel.name}`}
    >
      <div className="flex items-center space-x-3">
        {isBot && channel.name === 'Samang' ? <BotIcon className="w-10 h-10 text-cyan-400 flex-shrink-0" /> : 
         isBot && channel.name === 'Human Apport' ? <BotIcon className="w-10 h-10 text-teal-400 flex-shrink-0" /> :
        <img 
            src={avatarUrl} 
            alt={channel.name || 'Channel User'} 
            className="w-10 h-10 rounded-full object-cover border-2 border-slate-600 flex-shrink-0"
            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/error/40/40')} // Fallback image
        />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100 truncate">{channel.name || 'Unnamed Channel'}</p>
          <p className="text-xs text-slate-400 truncate" dangerouslySetInnerHTML={{ __html: renderMessagePreview(channel.lastMessagePreview || 'No preview available') }} />
        </div>
        {channel.unreadCount != null && channel.unreadCount > 0 && (
          <span className="bg-cyan-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
            {channel.unreadCount}
          </span>
        )}
      </div>
    </li>
  );
};

// --- ControlTowerPage Props from File B ---
interface ControlTowerPageProps {
  channels: Channel[];
  onSelectChannel: (channelId: string) => void;
  users: User[];
  currentUser: User; // This prop might be used by ControlTowerChannelItem or for other logic
}

// --- ControlTowerPage Component ---
const ControlTowerPage: React.FC<ControlTowerPageProps> = ({ channels, onSelectChannel, users, currentUser }) => {
  const navigate = useNavigate();

  const handleChannelClick = (channelId: string) => {
    onSelectChannel(channelId); // Call the prop to update app state if needed
    navigate(`/chat/${channelId}`);
  };
  
  // Sort channels by last message timestamp, newest first
  const sortedChannels = React.useMemo(() => 
    [...channels].sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0)),
    [channels]
  );

  return (
    <div className="h-full flex flex-col p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-900 text-slate-100"> {/* Added text-slate-100 for global text color */}
      {/* Header */}
      <header className="bg-slate-800/70 backdrop-blur-md text-slate-100 p-3 sm:p-4 rounded-xl shadow-2xl flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">SalesHQ Control Tower</h1>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Search">
            <SearchIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="My Profile">
            <UserOutlineIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Add User">
            <UserPlusIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Messages">
            <ChatBubbleAltIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Logout">
            <LogoutIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Settings">
            <CogIcon className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-slate-700 transition-colors lg:hidden" aria-label="Menu"> {/* Example: show menu icon on smaller screens */}
            <MenuIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden">
        {/* Left Pane - Analytics */}
        <section className="w-full lg:w-2/3 flex flex-col gap-3 sm:gap-4 overflow-y-auto custom-scrollbar-dark pr-1"> {/* Assuming custom-scrollbar-dark is defined in your CSS */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Paiv Chart Area */}
            <div className="flex-grow bg-slate-800 p-4 rounded-xl shadow-xl flex flex-col items-center justify-center">
              <h2 className="text-md font-semibold text-slate-300 mb-2 self-start">Paiv Chart</h2>
              <MockPieChart />
               <div className="flex justify-around w-full mt-3 text-xs text-slate-400">
                <span><span className="inline-block w-2 h-2 bg-cyan-500 rounded-full mr-1"></span>Leads</span>
                <span><span className="inline-block w-2 h-2 bg-teal-500 rounded-full mr-1"></span>Opportunities</span>
                <span><span className="inline-block w-2 h-2 bg-slate-600 rounded-full mr-1"></span>Prospects</span>
              </div>
            </div>
            {/* Small Donut Charts (Metrics) */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:w-auto sm:grid-cols-1 md:w-1/3 lg:w-1/4"> {/* Adjusted grid for responsiveness */}
                <MockSmallDonutChart percentage={58} label="Leads" value="58%"/>
                <MockSmallDonutChart percentage={27} label="Opportunities" value="27%"/>
                <MockSmallDonutChart percentage={15} label="Prospects" value="4.8%"/> {/* Value based on File B */}
            </div>
          </div>

          {/* New Purchases */}
          <div className="bg-slate-800 p-4 rounded-xl shadow-xl">
            <h2 className="text-md font-semibold text-slate-300 mb-3">New Purchases</h2>
            <MockBarChart />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Emails Sent */}
            <div className="bg-slate-800 p-4 rounded-xl shadow-xl">
              <h2 className="text-md font-semibold text-slate-300 mb-2">1. Emails Sent</h2>
              <div className="w-full bg-slate-700 rounded-full h-2.5 mb-3">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>( 0 )</span> {/* This seems static from File B */}
                <span>Emails Sent</span>
              </div>
              <MockLineChart small />
            </div>

            {/* Outreach Revenue */}
            <div className="bg-slate-800 p-4 rounded-xl shadow-xl">
              <h2 className="text-md font-semibold text-slate-300 mb-3">Outreach Revenue</h2>
              <MockLineChart small />
            </div>
          </div>
        </section>

        {/* Right Pane - Chat Channels / Messages */}
        <section className="w-full lg:w-1/3 bg-slate-800/50 p-3 sm:p-4 rounded-xl shadow-xl flex flex-col">
          <h2 className="text-md font-semibold text-slate-300 mb-3">Messages</h2>
          {sortedChannels.length > 0 ? (
            <ul className="space-y-3 flex-1 overflow-y-auto custom-scrollbar-dark pr-1"> {/* Assuming custom-scrollbar-dark */}
              {sortedChannels.map(channel => (
                <ControlTowerChannelItem 
                  key={channel.id} 
                  channel={channel} 
                  onSelect={() => handleChannelClick(channel.id)}
                  users={users}
                  // currentUser={currentUser} // Pass if ControlTowerChannelItem needs it directly
                />
              ))}
            </ul>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <p>No active messages.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ControlTowerPage;