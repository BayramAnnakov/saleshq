
export interface Message {
  id: string; // Unique message ID from server
  userId: string;
  channelId: string;
  text: string;
  timestamp: number; // Unix timestamp
}

export interface Channel {
  id: string;
  name: string;
}

// Message structure from Client to Server
export interface ClientToServerMessage {
  type: 'sendMessage';
  payload: {
    userId: string;
    channelId: string;
    text: string;
  };
}

// Define specific types for server messages to create a discriminated union
interface ServerNewMessage {
  type: 'newMessage';
  payload: Message;
}

interface ServerErrorMessage {
  type: 'error';
  payload: { message: string };
}

// Union type for all server-to-client messages
export type ServerToClientMessage = ServerNewMessage | ServerErrorMessage;
