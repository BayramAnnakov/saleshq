
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Message, ClientToServerMessage, ServerToClientMessage } from '../types';

export interface WebSocketClient {
  socket: WebSocket | null;
  isConnected: boolean;
  messages: Message[];
  error: string | null;
  connect: (url: string, userId: string) => void;
  disconnect: () => void;
  sendMessage: (channelId: string, text: string) => void;
}

// Type guard for Message payload - handles both userId and senderId
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

// Type guard for Error payload
const isErrorPayload = (payload: any): payload is { message: string } => {
  return payload && typeof payload.message === 'string';
};

export const useWebSocketClient = (): WebSocketClient => {
  const [socket, _setSocket] = useState<WebSocket | null>(null);
  const [isConnected, _setIsConnected] = useState<boolean>(false);
  const [messages, _setMessages] = useState<Message[]>([]);
  
  // Wrapper for setMessages with logging
  const setMessages = useCallback((newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof newMessages === 'function') {
      _setMessages((prevMessages) => {
        console.log('[WS State] setMessages called with function. Current messages count:', prevMessages.length);
        const result = newMessages(prevMessages);
        console.log('[WS State] setMessages function result. New messages count:', result.length);
        console.log('[WS State] New messages array:', result);
        return result;
      });
    } else {
      console.log('[WS State] setMessages called with array. New messages count:', newMessages.length);
      console.log('[WS State] New messages array:', newMessages);
      _setMessages(newMessages);
    }
  }, []);
  const [error, _setError] = useState<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // Wrappers for state setters to include logging
  const setSocket = useCallback((newSocket: WebSocket | null) => {
    console.log(`[WS State] setSocket called. New socket:`, newSocket ? `WebSocket (readyState: ${newSocket.readyState})` : 'null');
    _setSocket(newSocket);
  }, []);

  const setIsConnected = useCallback((connected: boolean) => {
    console.log(`[WS State] setIsConnected called. Value: ${connected}`);
    _setIsConnected(connected);
  }, []);

  const setError = useCallback((errorMessage: string | null) => {
    console.log(`[WS State] setError called. Value:`, errorMessage);
    _setError(errorMessage);
  }, []);


  const connect = useCallback((url: string, userId: string) => {
    console.log('[WS Connect] Attempting to connect. Current socket state:', socket?.readyState, 'IsConnected:', isConnected);
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.warn("[WS Connect] Already connected.");
      setError("Already connected.");
      return;
    }
    if (socket && socket.readyState === WebSocket.CONNECTING) {
      console.warn("[WS Connect] Connection attempt already in progress.");
      setError("Connection attempt already in progress.");
      return;
    }

    if (!url || !userId) {
      console.error("[WS Connect] WebSocket URL and User ID are required.");
      setError("WebSocket URL and User ID are required.");
      return;
    }
    
    currentUserIdRef.current = userId;
    setError(null); // Clear previous errors
    
    console.log(`[WS Connect] Preparing to connect to: ${url} with User ID: ${userId}`);
    
    try {
      console.log('[WS Connect] Creating new WebSocket object...');
      const ws = new WebSocket(url);
      console.log('[WS Connect] WebSocket object created. Assigning event handlers.');
      
      setSocket(ws); 
      setIsConnected(false); // Explicitly set to false while connecting

      ws.onopen = () => {
        console.log(`[WS onopen] WebSocket connected successfully! Socket readyState: ${ws.readyState}`);
        setIsConnected(true);
        setError(null);
        // Example: Send an initialization or registration message if your server expects one
        // console.log('[WS onopen] Sending registration message for user:', currentUserIdRef.current);
        // ws.send(JSON.stringify({ type: 'register', payload: { userId: currentUserIdRef.current } }));
      };

      ws.onmessage = (event: MessageEvent) => {
        console.log(`[WS onmessage] ===== MESSAGE RECEIVED =====`);
        console.log(`[WS onmessage] Socket readyState: ${ws.readyState}`);
        console.log(`[WS onmessage] Raw message data:`, event.data);
        console.log(`[WS onmessage] Raw message type:`, typeof event.data);
        console.log(`[WS onmessage] Raw message length:`, event.data?.length);
        
        try {
          const rawMessage = event.data as string;
          console.log('[WS onmessage] Attempting to parse JSON...');
          const receivedMessage = JSON.parse(rawMessage) as ServerToClientMessage;
          console.log('[WS onmessage] ✅ JSON parsing successful!');
          console.log('[WS onmessage] Parsed message object:', receivedMessage);
          console.log('[WS onmessage] Message type:', receivedMessage.type);
          console.log('[WS onmessage] Message payload:', receivedMessage.payload);

          if (receivedMessage.type === 'newMessage') {
            console.log('[WS onmessage] Processing newMessage. Payload:', receivedMessage.payload);
            console.log('[WS onmessage] Payload validation check:');
            console.log('  - has id:', typeof receivedMessage.payload?.id);
            console.log('  - has userId:', typeof receivedMessage.payload?.userId);
            console.log('  - has channelId:', typeof receivedMessage.payload?.channelId);
            console.log('  - has text:', typeof receivedMessage.payload?.text);
            console.log('  - has timestamp:', typeof receivedMessage.payload?.timestamp);
            
            if (isMessagePayload(receivedMessage.payload)) {
              console.log('[WS onmessage] Received "newMessage" with valid payload. Updating state.');
              
              // Normalize payload - convert senderId to userId if needed
              const normalizedPayload: Message = {
                id: receivedMessage.payload.id,
                userId: (receivedMessage.payload as any).userId || (receivedMessage.payload as any).senderId,
                channelId: receivedMessage.payload.channelId,
                text: receivedMessage.payload.text,
                timestamp: receivedMessage.payload.timestamp
              };
              
              console.log('[WS onmessage] Normalized message payload:', normalizedPayload);
              console.log('[WS onmessage] Adding message to state:', normalizedPayload);
              
              setMessages((prevMessages) => {
                // Check for duplicates (in case server echoes back our optimistic message)
                const isDuplicate = prevMessages.some(msg => 
                  msg.userId === normalizedPayload.userId &&
                  msg.channelId === normalizedPayload.channelId &&
                  msg.text === normalizedPayload.text &&
                  Math.abs(msg.timestamp - normalizedPayload.timestamp) < 5000 // Within 5 seconds
                );
                
                if (isDuplicate) {
                  console.log('[WS onmessage] Duplicate message detected, skipping:', normalizedPayload);
                  return prevMessages;
                }
                
                const newMessages = [...prevMessages, normalizedPayload];
                console.log('[WS onmessage] New messages array length:', newMessages.length);
                return newMessages;
              });
            } else {
              console.error('[WS onmessage] Received "newMessage" with invalid payload structure:', receivedMessage.payload);
              setError('Received invalid message data from server (newMessage).');
            }
          } else if (receivedMessage.type === 'error') {
             if (isErrorPayload(receivedMessage.payload)) {
              console.error('[WS onmessage] Received "error" message from server:', receivedMessage.payload.message);
              setError(`Server error: ${receivedMessage.payload.message || 'Unknown error'}`);
            } else {
              console.error('[WS onmessage] Received "error" with invalid payload structure:', receivedMessage.payload);
              setError('Received invalid error data from server.');
            }
          } else {
             console.warn('[WS onmessage] Received message with unhandled type:', receivedMessage);
             setError('Received message with unknown type from server.');
          }
        } catch (e) {
          console.error('[WS onmessage] ❌ PARSING ERROR ❌');
          console.error('[WS onmessage] Raw data that failed to parse:', event.data);
          console.error('[WS onmessage] Error details:', e);
          console.error('[WS onmessage] Error message:', e instanceof Error ? e.message : 'Unknown error');
          console.error('[WS onmessage] Error stack:', e instanceof Error ? e.stack : 'No stack trace');
          setError('Received malformed message from server.');
        }
        console.log(`[WS onmessage] ===== MESSAGE PROCESSING COMPLETE =====`);
      };

      ws.onerror = (event: Event) => {
        console.error(`[WS onerror] WebSocket error event occurred. Socket readyState: ${ws.readyState}. Event object:`, event);
        setError('WebSocket connection error. Check URL, server status, and browser console (Network tab) for details.');
        setIsConnected(false);
        // Note: ws.onclose will usually be called after onerror
      };

      ws.onclose = (event: CloseEvent) => {
        console.log(`[WS onclose] WebSocket disconnected. Socket readyState: ${ws.readyState}. Code: ${event.code}, Reason: "${event.reason}", Was Clean: ${event.wasClean}. Event object:`, event);
        setIsConnected(false);
        setSocket(null); 
        
        if (!event.wasClean) {
          let closeError = `Connection closed unexpectedly (Code: ${event.code}).`;
          if (event.reason) {
            closeError += ` Reason: ${event.reason}.`;
          }
          
          switch (event.code) {
            case 1000: // Normal Closure - should be clean, but if not...
              setError('Disconnected.'); 
              break;
            case 1001: // Going Away
              setError('Server is going away or browser navigation.');
              break;
            case 1002: // Protocol Error
              setError('WebSocket protocol error from server.');
              break;
            case 1003: // Unsupported Data
              setError('Server received unsupported data type.');
              break;
            case 1005: // No Status Recvd (internal)
              setError('Connection closed without a status code.');
              break;
            case 1006: // Abnormal Closure
              setError('Connection closed abnormally (e.g., network issue, server down). Check server availability and network. (Code: 1006)');
              break;
            default:
              setError(closeError);
          }
        } else {
           console.log('[WS onclose] Connection closed cleanly.');
           if (error === null) setError('Disconnected.'); 
        }
      };

    } catch (e: any) {
      console.error("[WS Connect] CRITICAL: Failed to initialize WebSocket instance:", e);
      let errorMessage = "Failed to initialize WebSocket.";
      if (e && typeof e.message === 'string') {
        errorMessage += ` ${e.message}. Check URL format (e.g., use ws:// or wss://).`;
      } else {
        errorMessage += " Ensure URL is valid (e.g., ws://localhost:8080).";
      }
      setError(errorMessage);
      setIsConnected(false);
      setSocket(null);
    }
  }, [socket, error, isConnected, setError, setIsConnected, setSocket]); // Added isConnected to deps of connect for guard logic

  const disconnect = useCallback(() => {
    if (socket) {
      console.log('[WS Disconnect] User initiated disconnect...');
      setError(null); 
      socket.close(1000, "User initiated disconnect"); 
    } else {
      console.log('[WS Disconnect] No active socket to disconnect.');
    }
  }, [socket, setError]);

  const sendMessage = useCallback((channelId: string, text: string) => {
    console.log('[WS SendMessage] Attempting to send message. Socket state:', socket?.readyState, 'IsConnected:', isConnected);
    if (socket && isConnected && currentUserIdRef.current) {
      const messageToSend: ClientToServerMessage = {
        type: 'sendMessage',
        payload: {
          userId: currentUserIdRef.current,
          channelId,
          text,
        },
      };
      
      // Add message optimistically to local state
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}-${Math.random()}`,
        userId: currentUserIdRef.current,
        channelId,
        text,
        timestamp: Date.now(),
      };
      
      console.log('[WS SendMessage] Adding optimistic message to local state:', optimisticMessage);
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
      
      try {
        socket.send(JSON.stringify(messageToSend));
        console.log('[WS SendMessage] Sent message:', messageToSend);
      } catch (e) {
        console.error('[WS SendMessage] Failed to send message:', e);
        // Remove the optimistic message if sending failed
        setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== optimisticMessage.id));
        setError('Failed to send message. Connection might be lost.');
      }
    } else {
      const reason = !socket ? 'No socket' : !isConnected ? 'Not connected' : 'User ID not set';
      setError(`Cannot send message. ${reason}.`);
      console.warn(`[WS SendMessage] Attempted to send message while: ${reason}.`);
    }
  }, [socket, isConnected, setError]);

  // Add effect to track messages state changes
  useEffect(() => {
    console.log(`[WS State] 🔄 Messages state changed! New count: ${messages.length}`);
    if (messages.length > 0) {
      console.log('[WS State] Current messages in state:', messages);
      console.log('[WS State] Last message:', messages[messages.length - 1]);
    }
  }, [messages]);

  useEffect(() => {
    const currentSocket = socket;
    // This effect runs when 'socket' instance changes or on component unmount.
    return () => {
      if (currentSocket && (currentSocket.readyState === WebSocket.OPEN || currentSocket.readyState === WebSocket.CONNECTING)) {
        console.log('[WS Cleanup] Cleaning up WebSocket connection (hook unmount or socket instance change). Closing socket. ReadyState:', currentSocket.readyState);
        // Clear handlers to prevent them from firing on an old, abandoned socket during close
        currentSocket.onopen = null;
        currentSocket.onmessage = null;
        currentSocket.onerror = null;
        currentSocket.onclose = null;
        currentSocket.close(1000, "Client component unmounted or hook re-ran");
      }
    };
  }, [socket]); 


  return { socket, isConnected, messages, error, connect, disconnect, sendMessage };
};
