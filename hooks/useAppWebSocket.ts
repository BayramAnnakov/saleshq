
import { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '../types';
import { CURRENT_USER_ID } from '../constants';

// Message types for WebSocket communication based on README
interface ClientToServerSendMessage {
  type: 'sendMessage';
  payload: {
    userId: string;
    channelId: string;
    text: string;
  };
}

interface ServerToClientNewMessage {
  type: 'newMessage';
  payload: Message; // Our existing Message type matches the payload
}

interface ServerToClientError {
  type: 'error';
  payload: {
    message: string;
  };
}

type ServerToClientMessage = ServerToClientNewMessage | ServerToClientError;

export interface AppWebSocket {
  isConnected: boolean;
  lastError: string | null;
  connect: (url: string) => void;
  disconnect: () => void;
  sendMessageToServer: (channelId: string, text: string) => void;
}

interface UseAppWebSocketOptions {
  onMessageReceived: (message: Message) => void;
  onConnectionStatusChange?: (isConnected: boolean) => void;
  onErrorReceived?: (error: string) => void;
}

export const useAppWebSocket = ({ 
  onMessageReceived, 
  onConnectionStatusChange,
  onErrorReceived 
}: UseAppWebSocketOptions): AppWebSocket => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  // Ref to hold the current WebSocket, to avoid stale closures
  const socketRef = useRef<WebSocket | null>(null);

  // Keep socketRef in sync with state
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // To prevent stale closures in WebSocket event handlers
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onConnectionStatusChangeRef = useRef(onConnectionStatusChange);
  const onErrorReceivedRef = useRef(onErrorReceived);

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    onConnectionStatusChangeRef.current = onConnectionStatusChange;
  }, [onConnectionStatusChange]);

  useEffect(() => {
    onErrorReceivedRef.current = onErrorReceived;
  }, [onErrorReceived]);


  const connect = useCallback((url: string) => {
    const current = socketRef.current;
    if (current && (current.readyState === WebSocket.OPEN || current.readyState === WebSocket.CONNECTING)) {
      console.warn('[WS] Already connected or connecting.');
      return;
    }
    console.log(`[WS] Attempting to connect to ${url}`);
    setLastError(null);
    const ws = new WebSocket(url);
    // Track in ref immediately
    socketRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      console.log('[WS] Connected.');
      setIsConnected(true);
      setLastError(null);
      onConnectionStatusChangeRef.current?.(true);
    };

    ws.onmessage = (event: MessageEvent) => {
      console.log('[WS] Message received:', event.data);
      try {
        const serverMessage = JSON.parse(event.data as string) as ServerToClientMessage;
        
        if (serverMessage.type === 'newMessage' && serverMessage.payload) {
          // Validate payload structure before calling onMessageReceived
          const msg = serverMessage.payload;
          if(typeof msg.id === 'string' &&
             typeof msg.channelId === 'string' &&
             typeof msg.senderId === 'string' &&
             typeof msg.text === 'string' &&
             typeof msg.timestamp === 'number') {
            onMessageReceivedRef.current(msg);
          } else {
            console.error('[WS] Invalid newMessage payload structure:', msg);
            setLastError('Received invalid message data from server.');
            onErrorReceivedRef.current?.('Received invalid message data from server.');
          }
        } else if (serverMessage.type === 'error' && serverMessage.payload) {
          console.error('[WS] Server error:', serverMessage.payload.message);
          setLastError(serverMessage.payload.message);
          onErrorReceivedRef.current?.(serverMessage.payload.message);
        } else {
          console.warn('[WS] Received unhandled message type or invalid structure:', serverMessage);
        }
      } catch (e) {
        console.error('[WS] Failed to parse message:', e);
        setLastError('Received malformed message from server.');
        onErrorReceivedRef.current?.('Received malformed message from server.');
      }
    };

    ws.onerror = (event: Event) => {
      // Log the type of event instead of the generic event object
      console.error('[WS] WebSocket onerror event. Type:', event.type);
      setLastError('WebSocket connection error. Check server URL and availability.');
      setIsConnected(false);
      onConnectionStatusChangeRef.current?.(false);
      onErrorReceivedRef.current?.('WebSocket connection error.');
    };

    ws.onclose = (event: CloseEvent) => {
      console.log(`[WS] Disconnected. Code: ${event.code}, Reason: "${event.reason}"`);
      setIsConnected(false);
      setSocket(null); // Allow re-connection by creating a new socket instance
      onConnectionStatusChangeRef.current?.(false);
      if (!event.wasClean) {
        const errorMsg = `Connection closed unexpectedly (Code: ${event.code}).`;
        setLastError(errorMsg);
        onErrorReceivedRef.current?.(errorMsg);
      } else {
        // If it was a clean disconnect and no error was set prior, set a generic "Disconnected"
        if (!lastError && onErrorReceivedRef.current) onErrorReceivedRef.current('Disconnected.');
        else if(!lastError) setLastError('Disconnected.');
      }
    };

    setSocket(ws);
  }, []); // no dependencies; uses socketRef and refs for latest values

  const disconnect = useCallback(() => {
    const current = socketRef.current;
    if (current) {
      console.log('[WS] Disconnecting...');
      current.close(1000, 'User initiated disconnect');
    }
  }, []);

  const sendMessageToServer = useCallback((channelId: string, text: string) => {
    const current = socketRef.current;
    if (current && current.readyState === WebSocket.OPEN) {
      const messagePayload: ClientToServerSendMessage = {
        type: 'sendMessage',
        payload: {
          userId: CURRENT_USER_ID,
          channelId,
          text,
        },
      };
      try {
        current.send(JSON.stringify(messagePayload));
        console.log('[WS] Message sent:', messagePayload);
      } catch (e) {
        console.error('[WS] Failed to send message:', e);
        setLastError('Failed to send message.');
        onErrorReceivedRef.current?.('Failed to send message.');
      }
    } else {
      console.warn('[WS] Cannot send message, socket not connected.');
      setLastError('Cannot send message. Not connected.');
      onErrorReceivedRef.current?.('Cannot send message. Not connected.');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const currentSocket = socket;
    return () => {
      if (currentSocket && (currentSocket.readyState === WebSocket.OPEN || currentSocket.readyState === WebSocket.CONNECTING)) {
        console.log('[WS] Cleaning up WebSocket connection on unmount.');
        currentSocket.close(1000, "Component unmounting");
      }
    };
  }, [socket]);

  return { isConnected, lastError, connect, disconnect, sendMessageToServer };
};
