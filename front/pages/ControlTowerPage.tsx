import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Channel } from '../types';
import ChannelList from '../components/ChannelList';
import { SearchIcon, MenuIcon, ChatBubbleIcon, CogIcon, UsersIcon, ChartIcon } from '../constants';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface ControlTowerPageProps {
  channels: Channel[];
}

const ControlTowerPage: React.FC<ControlTowerPageProps> = ({ channels }) => {
  const navigate = useNavigate();

  // Sample data for charts
  const pieData = [
    { name: 'Leads', value: 58 },
    { name: 'Opportunities', value: 27 },
    { name: 'Prospects', value: 15 },
  ];
  const pieColors = ['#1d4ed8', '#3b82f6', '#60a5fa'];

  const barData = [
    { time: '00', value: 50 },
    { time: '01', value: 80 },
    { time: '02', value: 65 },
    { time: '03', value: 90 },
    { time: '04', value: 75 },
    { time: '05', value: 100 },
    { time: '06', value: 85 },
  ];

  const emailsData = [
    { time: 'Mon', value: 200 },
    { time: 'Tue', value: 450 },
    { time: 'Wed', value: 300 },
    { time: 'Thu', value: 500 },
    { time: 'Fri', value: 400 },
  ];

  const revenueData = [
    { month: 'Jan', value: 4000 },
    { month: 'Feb', value: 5000 },
    { month: 'Mar', value: 6000 },
    { month: 'Apr', value: 7000 },
    { month: 'May', value: 8500 },
  ];

  // Static metrics
  const metrics = [
    { title: 'Leads', value: '58%', subtitle: '27%' },
    { title: 'Disopportunities', value: '4.8%', subtitle: '1900 g' },
    { title: 'Prospects', value: '4.8%', subtitle: '%' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold">SalesHQ Control Tower</h1>
          <SearchIcon className="w-6 h-6 text-gray-600" />
        </div>
        <div className="flex items-center space-x-4 text-gray-600">
          <UsersIcon className="w-6 h-6" />
          <UsersIcon className="w-6 h-6" />
          <ChatBubbleIcon className="w-6 h-6" />
          <ChartIcon className="w-6 h-6" />
          <CogIcon className="w-6 h-6" />
          <MenuIcon className="w-6 h-6" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Analytics Section */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Pie Chart Card */}
            <div className="relative bg-white rounded-lg shadow p-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold">{pieData[0].value}%</p>
                <p className="text-sm text-gray-500">{pieData[1].value}%</p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {metrics.map((m, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                  <h3 className="text-sm font-semibold text-gray-500">{m.title}</h3>
                  <p className="text-3xl font-bold text-gray-800">{m.value}</p>
                  <p className="text-sm text-gray-500">{m.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Bar Chart Card */}
            <div className="bg-white rounded-lg shadow p-4 h-64">
              <h3 className="text-lg font-semibold mb-2">New Purchases</h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={barData}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Smaller Line Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-4 h-48">
                <h3 className="text-lg font-semibold mb-2">Emails Sent</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={emailsData}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-lg shadow p-4 h-48">
                <h3 className="text-lg font-semibold mb-2">Outreach Revenue</h3>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={revenueData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed / Messages Section */}
        <div className="w-full lg:w-1/3 bg-white rounded-lg shadow m-6 overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold p-4 border-b">Activity Feed</h2>
          <div className="flex-1 overflow-y-auto">
            <ChannelList
              channels={channels}
              activeChannelId={null}
              onSelectChannel={(id) => navigate(`/chat/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlTowerPage;