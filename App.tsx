
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Channel, Message, User } from './types';
import { INITIAL_CHANNELS, ALL_MOCK_USERS, CURRENT_USER_ID, MOCK_SALES_TEAM_USERS } from './constants';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';

// --- TOGGLE FOR MESSAGE SIMULATION ---
const ENABLE_MESSAGE_SIMULATION = false; // Set to true to enable automatic test message sending

const App: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const initialMessages: Record<string, Message[]> = {};
    INITIAL_CHANNELS.forEach(channel => {
      initialMessages[channel.id] = []; // Start with an empty array of messages
    });
    return initialMessages;
  });
  
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // This remains useful for a global notification indicator if needed elsewhere,
  // but dashboard cards will show per-channel counts.
  const totalUnreadCount = channels.reduce((sum, channel) => sum + channel.unreadCount, 0);

  const markChannelAsRead = useCallback((channelId: string) => {
    setMessages(prevMessages => {
      const channelMessages = prevMessages[channelId] || [];
      return {
        ...prevMessages,
        [channelId]: channelMessages.map(msg => ({ ...msg, isRead: true })),
      };
    });
    setChannels(prevChannels =>
      prevChannels.map(ch =>
        ch.id === channelId ? { ...ch, unreadCount: 0 } : ch
      )
    );
  }, []);

  const handleSelectChannel = useCallback((channelId: string) => {
    setActiveChannelId(channelId);
    const channel = channels.find(ch => ch.id === channelId);
    if (channel && channel.unreadCount > 0) {
      markChannelAsRead(channelId);
    }
  }, [markChannelAsRead, channels]);

  const handleSendMessage = useCallback((channelId: string, text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg-user-${Date.now()}`,
      channelId,
      senderId: CURRENT_USER_ID,
      text,
      timestamp: Date.now(),
      isRead: true, 
    };

    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMessage],
    }));
    setChannels(prev => prev.map(ch => 
      ch.id === channelId ? { ...ch, lastMessagePreview: `You: ${text}`, lastMessageTimestamp: newMessage.timestamp, unreadCount: 0 } : ch
    ));
    // If the current user sends a message to the active channel, ensure its unread count remains 0 or is set to 0.
    if (channelId === activeChannelId) {
      markChannelAsRead(channelId);
    }

  }, [activeChannelId, markChannelAsRead]);

  // Simulate new messages from sales team members
  useEffect(() => {
    if (!ENABLE_MESSAGE_SIMULATION) {
      return; // Exit if simulation is disabled
    }

    const intervalId = setInterval(() => {
      setChannels(prevChannels => {
        const channelsCopy = [...prevChannels];
        // Pick a random channel that is NOT the currently active one (if any)
        const availableChannelsToReceiveMessage = channelsCopy.filter(ch => ch.id !== activeChannelId);
        if (availableChannelsToReceiveMessage.length === 0) return prevChannels; // No channels to send to or only active one

        const targetChannel = availableChannelsToReceiveMessage[Math.floor(Math.random() * availableChannelsToReceiveMessage.length)];
        
        // Pick a random sales team member (excluding current user)
        const potentialSenders = MOCK_SALES_TEAM_USERS.filter(u => u.id !== CURRENT_USER_ID && targetChannel.members.find(m => m.id === u.id));
        if (potentialSenders.length === 0) return prevChannels; // No valid sender for this channel
        
        const sender = potentialSenders[Math.floor(Math.random() * potentialSenders.length)];

        // Generate sales-relevant message based on channel
        let newMessageText = "Just a quick update.";
        switch(targetChannel.id) {
          case 'channel_leads':
            newMessageText = [
              "New lead from 'BigCorp Inc.' - looks promising!", 
              "Followed up with 'StartupX', they requested a demo.",
              "Can someone take a look at the lead from the webinar?",
              "Assigned 'Lead Y' to Emily."
            ][Math.floor(Math.random() * 4)];
            break;
          case 'channel_followups':
            newMessageText = [
              "Reminder: Call with 'ClientA' scheduled for tomorrow at 10 AM.",
              "Just finished my follow-up with 'TechSolutions', notes are in the CRM.",
              "Who is handling the follow-up for 'OldLead Co.'?",
              "SalesBot: Automated follow-up email sent to 'ProspectZ'."
            ][Math.floor(Math.random() * 4)];
            if (sender.name.includes("SalesBot")) newMessageText = "SalesBot: Automated follow-up sequence initiated for 'Zeta Corp'.";
            break;
          case 'channel_proposals':
            newMessageText = [
              "Proposal for 'Omega Ltd.' has been sent. Fingers crossed!",
              "Received feedback on the 'Alpha Group' proposal, need to revise section 3.",
              "Can we get a status update on the 'Gamma Project' proposal?",
              "Draft proposal for 'Delta Inc.' ready for review."
            ][Math.floor(Math.random() * 4)];
            break;
          case 'channel_alerts':
            newMessageText = [
              "Urgent: Client 'Critical Systems' reporting an issue with their latest invoice.",
              "SalesBot: High churn risk detected for 'Unstable Corp'.",
              "Need immediate assistance with 'VIP Client' request.",
              "System Alert: Quota for API calls nearing limit."
            ][Math.floor(Math.random() * 4)];
            if (sender.name.includes("SalesBot")) newMessageText = "SalesBot: Payment failed for 'Client Theta'. Account suspended.";
            break;
        }

        const newMessage: Message = {
          id: `msg-sim-${Date.now()}`,
          channelId: targetChannel.id,
          senderId: sender.id,
          text: newMessageText,
          timestamp: Date.now(),
          isRead: false, // New messages are unread
        };

        setMessages(prevMsgs => ({
          ...prevMsgs,
          [targetChannel.id]: [...(prevMsgs[targetChannel.id] || []), newMessage],
        }));
        
        return channelsCopy.map(ch =>
          ch.id === targetChannel.id
            ? {
                ...ch,
                unreadCount: ch.unreadCount + 1,
                lastMessagePreview: newMessage.text,
                lastMessageTimestamp: newMessage.timestamp,
              }
            : ch
        );
      });
    }, Math.random() * 5000 + 15000); // Simulate a new message every 15-20 seconds

    return () => clearInterval(intervalId);
  }, [activeChannelId]); // Rerun if activeChannelId changes to ensure sim messages don't go to active one immediately

  const currentUser = ALL_MOCK_USERS.find(u => u.id === CURRENT_USER_ID);
  if (!currentUser) {
    // This should ideally not happen if CURRENT_USER_ID is in ALL_MOCK_USERS
    console.error("Current user not found!");
    return <React.Fragment>Error: Current user configuration issue.</React.Fragment>;
  }

  return (
    <HashRouter>
      <div className="h-screen w-screen flex flex-col antialiased text-gray-800 overflow-hidden">
        <Routes>
          <Route path="/" element={
            <DashboardPage 
              channels={channels} // Pass all channels for individual card data
            />
          }/>
          <Route path="/chat" element={ // General chat path, will redirect to a specific channel
            <ChatPage
              channels={channels}
              messages={messages}
              activeChannelId={activeChannelId}
              onSelectChannel={handleSelectChannel}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              users={ALL_MOCK_USERS}
            />
          }/>
           <Route path="/chat/:channelId" element={ // Specific channel path
            <ChatPage
              channels={channels}
              messages={messages}
              activeChannelId={activeChannelId} // Will be updated by ChatPage's useEffect based on URL
              onSelectChannel={handleSelectChannel}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              users={ALL_MOCK_USERS}
            />
          }/>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;