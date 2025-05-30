
import React from 'react';

interface StatusIndicatorProps {
  isConnected: boolean;
  error: string | null;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isConnected, error }) => {
  let statusText = 'Disconnected';
  let bgColor = 'bg-red-500';
  let textColor = 'text-red-100';

  if (isConnected) {
    statusText = 'Connected';
    bgColor = 'bg-green-500';
    textColor = 'text-green-100';
  } else if (error) {
    statusText = `Error: ${error}`;
    bgColor = 'bg-yellow-500';
    textColor = 'text-yellow-100';
  }

  return (
    <div className={`p-3 mb-6 rounded-md shadow-md text-center ${bgColor} ${textColor}`}>
      <p className="font-semibold">{statusText}</p>
    </div>
  );
};
    