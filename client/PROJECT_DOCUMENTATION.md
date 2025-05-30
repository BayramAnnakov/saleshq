# SalesHQ WebSocket Chat Client - Complete Project Documentation

## Project Overview

This is a React-based WebSocket chat client designed for sales teams to communicate in real-time across different channels. The application provides a modern, responsive interface for connecting to a WebSocket server, sending messages, and receiving live updates from other users.

### Key Features
- Real-time WebSocket communication
- Multiple chat channels (Leads, Follow-ups, Proposals, Alerts)
- Optimistic message updates (messages appear immediately when sent)
- Comprehensive error handling and logging
- Responsive design with Tailwind CSS
- TypeScript for type safety

## Technology Stack

- **Frontend Framework**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 5.3.1
- **Styling**: Tailwind CSS 3.4.4
- **Communication**: Native WebSocket API
- **State Management**: React Hooks (useState, useCallback, useEffect)
- **Type System**: TypeScript 5.4.5

## Project Structure

```
SalesHQ-client/
├── components/           # React UI components
│   ├── ChannelSelector.tsx    # Channel selection dropdown
│   ├── ChatInterface.tsx      # Main chat interface container
│   ├── ConnectForm.tsx        # WebSocket connection form
│   ├── MessageInput.tsx       # Message input field and send button
│   ├── MessageList.tsx        # Display list of messages
│   └── StatusIndicator.tsx    # Connection status display
├── hooks/               # Custom React hooks
│   └── useWebSocketClient.ts  # WebSocket connection logic
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── types.ts            # TypeScript type definitions
├── constants.ts        # Application constants and config
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
└── README.md           # Basic project information
```

## Detailed File Documentation

### 1. Core Application Files

#### `App.tsx` - Main Application Component
**Purpose**: Root component that orchestrates the entire application

**Key Responsibilities**:
- Manages global application state (WebSocket URL, User ID, current channel)
- Handles WebSocket connection lifecycle
- Provides connection form when disconnected
- Renders chat interface when connected
- Displays comprehensive message logs for debugging

**State Management**:
```typescript
const [wsUrl, setWsUrl] = useState<string>(DEFAULT_WS_URL);
const [userId, setUserId] = useState<string>(DEFAULT_USER_ID);
const [currentChannel, setCurrentChannel] = useState<string>(CHANNELS[0].id);
```

**Key Features**:
- Message filtering by channel: `messages.filter(msg => msg.channelId === currentChannel || msg.channelId === 'broadcast')`
- Disconnect functionality with proper cleanup
- Debug information display showing all received messages

#### `index.tsx` - Application Entry Point
**Purpose**: Bootstraps the React application

**Functionality**:
- Renders the root App component
- Provides React 18+ concurrent features via createRoot
- Applies global CSS including Tailwind

### 2. Custom Hooks

#### `hooks/useWebSocketClient.ts` - WebSocket Management Hook
**Purpose**: Encapsulates all WebSocket communication logic

**Core Features**:

1. **Connection Management**:
   ```typescript
   const connect = (url: string, userId: string) => {
     // Creates WebSocket connection
     // Sets up event handlers
     // Manages connection state
   }
   ```

2. **Message Handling**:
   - Receives messages from server
   - Validates message structure
   - Normalizes data (converts `senderId` to `userId`)
   - Prevents duplicate messages
   - Updates local state

3. **Optimistic Updates**:
   ```typescript
   const sendMessage = (channelId: string, text: string) => {
     // Immediately adds message to local state
     // Sends to server
     // Removes if sending fails
   }
   ```

4. **Comprehensive Logging**:
   - Connection events
   - Message parsing
   - State changes
   - Error tracking

**WebSocket Event Handlers**:
- `onopen`: Connection established
- `onmessage`: Incoming message processing
- `onerror`: Error handling
- `onclose`: Disconnection handling with detailed error codes

**Message Validation**:
```typescript
const isMessagePayload = (payload: any): payload is Message => {
  const hasValidUserId = typeof payload.userId === 'string' || typeof payload.senderId === 'string';
  return (
    payload &&
    typeof payload.id === 'string' &&
    hasValidUserId &&
    typeof payload.channelId === 'string' &&
    typeof payload.text === 'string' &&
    typeof payload.timestamp === 'number'
  );
};
```

### 3. UI Components

#### `components/ConnectForm.tsx` - Connection Interface
**Purpose**: Provides form to connect to WebSocket server

**Features**:
- WebSocket URL input with validation
- User ID configuration
- Connection status feedback
- Loading state during connection attempts

#### `components/ChatInterface.tsx` - Main Chat Container
**Purpose**: Orchestrates the chat experience

**Layout**:
```typescript
<div className="flex flex-col space-y-4">
  <ChannelSelector />           // Channel selection
  <div className="chat-container">
    <MessageList />             // Message display
    <MessageInput />            // Message input
  </div>
</div>
```

#### `components/ChannelSelector.tsx` - Channel Navigation
**Purpose**: Allows users to switch between chat channels

**Channels Available**:
- ProspectorBot (`channel_prospector`)
- ResearcherBot (`channel_researcher`)
- Bayram (`channel_bayram`)
- Merdan (`channel_merdan`)
- SDRBot (`channel_sdrbot`)

#### `components/MessageList.tsx` - Message Display
**Purpose**: Renders chat messages with proper formatting

**Features**:
- Auto-scroll to bottom on new messages
- Different styling for own vs others' messages
- Timestamp display
- User identification
- Empty state handling

**Message Styling**:
- Own messages: Right-aligned, blue background
- Others' messages: Left-aligned, gray background
- Timestamps and usernames for context

#### `components/MessageInput.tsx` - Message Composition
**Purpose**: Handles message input and sending

**Functionality**:
- Text input with placeholder
- Form submission handling
- Auto-clear after sending
- Send button with hover effects

#### `components/StatusIndicator.tsx` - Connection Status
**Purpose**: Displays current connection state and errors

**States**:
- Connected (green indicator)
- Disconnected (red indicator)
- Error messages with details

### 4. Configuration Files

#### `types.ts` - Type Definitions
**Purpose**: Defines TypeScript interfaces for type safety

**Key Types**:
```typescript
interface Message {
  id: string;
  userId: string;
  channelId: string;
  text: string;
  timestamp: number;
}

interface Channel {
  id: string;
  name: string;
}

type ServerToClientMessage = ServerNewMessage | ServerErrorMessage;
```

#### `constants.ts` - Application Configuration
**Purpose**: Centralized configuration values

**Constants**:
- `DEFAULT_WS_URL`: Default WebSocket server URL
- `DEFAULT_USER_ID`: Default user identifier
- `CHANNELS`: Available chat channels array

## WebSocket Communication Protocol

### Client to Server Messages
```typescript
{
  type: 'sendMessage',
  payload: {
    userId: string,
    channelId: string,
    text: string
  }
}
```

### Server to Client Messages

**New Message**:
```typescript
{
  type: 'newMessage',
  payload: {
    id: string,
    userId: string,        // or senderId (normalized by client)
    channelId: string,
    text: string,
    timestamp: number
  }
}
```

**Error Message**:
```typescript
{
  type: 'error',
  payload: {
    message: string
  }
}
```

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- WebSocket server running on specified URL

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/merdandt/SalesHQ-client.git
   cd SalesHQ-client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the application** (optional):
   Edit `constants.ts` to change default settings:
   ```typescript
   export const DEFAULT_WS_URL = 'ws://your-server:port';
   export const DEFAULT_USER_ID = 'your-default-user';
   ```

### Development

**Start development server**:
```bash
npm run dev
```
- Opens browser automatically at `http://localhost:3000`
- Hot reload enabled for instant updates
- TypeScript compilation and error checking

**Build for production**:
```bash
npm run build
```
- TypeScript compilation
- Optimized bundle creation
- Output in `dist/` directory

**Preview production build**:
```bash
npm run preview
```

## Usage Instructions

### 1. Starting the Application

1. Ensure your WebSocket server is running
2. Start the development server: `npm run dev`
3. Open browser to `http://localhost:3000`

### 2. Connecting to WebSocket Server

1. **Enter WebSocket URL**: Default is `ws://localhost:8080`
2. **Set User ID**: Choose a unique identifier
3. **Click Connect**: Application will attempt connection
4. **Monitor Status**: Green indicator shows successful connection

### 3. Using the Chat Interface

1. **Select Channel**: Use dropdown to choose communication channel
2. **Send Messages**: Type in input field and press Enter or click Send
3. **View Messages**: Messages appear in real-time from all connected users
4. **Switch Channels**: Change channels to see different conversations

### 4. Understanding the Interface

**Message Display**:
- Your messages appear on the right (blue)
- Others' messages appear on the left (gray)
- Timestamps show when messages were sent
- Auto-scroll keeps latest messages visible

**Status Indicators**:
- Green: Connected and ready
- Red: Disconnected or error
- Error messages provide specific details

## Debugging and Troubleshooting

### Console Logging
The application provides extensive console logging for debugging:

**Connection Events**:
```
[WS Connect] Attempting to connect...
[WS onopen] WebSocket connected successfully!
[WS State] setIsConnected called. Value: true
```

**Message Processing**:
```
[WS onmessage] ===== MESSAGE RECEIVED =====
[WS onmessage] Parsed message: {...}
[WS onmessage] Adding message to state: {...}
[WS State] Messages state changed! New count: 5
```

**Error Tracking**:
```
[WS onerror] WebSocket error event occurred
[WS onclose] Connection closed. Code: 1006
```

### Common Issues and Solutions

1. **Cannot Connect to WebSocket**:
   - Verify server is running
   - Check URL format (ws:// or wss://)
   - Confirm port number
   - Check browser console for network errors

2. **Messages Not Appearing**:
   - Check console for parsing errors
   - Verify server message format matches expected structure
   - Ensure channel IDs match between client and server

3. **Connection Drops**:
   - Check network stability
   - Monitor server logs
   - Review browser console for close codes

### Server Message Format Requirements

The client expects server messages in this exact format:
```json
{
  "type": "newMessage",
  "payload": {
    "id": "unique-message-id",
    "userId": "sender-user-id",     // or "senderId"
    "channelId": "channel_prospector",
    "text": "Message content",
    "timestamp": 1748559500625
  }
}
```

## Architecture and Design Patterns

### Component Architecture
- **Container Components**: `App.tsx`, `ChatInterface.tsx` - manage state and logic
- **Presentation Components**: `MessageList.tsx`, `MessageInput.tsx` - handle display
- **Custom Hooks**: `useWebSocketClient.ts` - encapsulate business logic

### State Management
- React built-in hooks for local state
- WebSocket hook provides centralized communication state
- Optimistic updates for better user experience

### Error Handling
- Comprehensive try-catch blocks
- User-friendly error messages
- Detailed console logging for developers
- Graceful degradation on connection issues

### Performance Considerations
- Optimistic updates reduce perceived latency
- Duplicate message prevention
- Efficient re-renders with proper dependency arrays
- Auto-scroll optimization

## Future Enhancements

Potential improvements for the application:

1. **Message Persistence**: Local storage for message history
2. **User Authentication**: Login system integration
3. **File Sharing**: Support for image/document uploads
4. **Typing Indicators**: Show when users are typing
5. **Message Reactions**: Emoji reactions to messages
6. **Push Notifications**: Browser notifications for new messages
7. **Message Search**: Search through message history
8. **User Presence**: Show online/offline status
9. **Message Threading**: Reply to specific messages
10. **Dark Mode**: Theme switching capability

This documentation provides a complete understanding of the SalesHQ WebSocket Chat Client, from basic usage to advanced architectural concepts.