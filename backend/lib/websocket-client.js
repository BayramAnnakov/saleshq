import WebSocket from 'ws';

class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.isConnected = false;
    this.onMessage = null;
    console.log('[WebSocket] Client initialized with URL:', url);
  }

  connect() {
    console.log('[WebSocket] Attempting to connect...');
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        console.log('[WebSocket] WebSocket instance created');

        this.ws.on('open', () => {
          console.log('[WebSocket] Connection opened successfully');
          this.isConnected = true;
          resolve();
        });

        this.ws.on('error', (error) => {
          console.error('[WebSocket] Connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.ws.on('close', (code, reason) => {
          console.log(`[WebSocket] Connection closed. Code: ${code}, Reason: ${reason}`);
          this.isConnected = false;
        });

        this.ws.on('message', (data) => {
          console.log('[WebSocket] Raw message received:', data.toString());
          if (this.onMessage) {
            try {
              const message = JSON.parse(data.toString());
              console.log('[WebSocket] Parsed message:', message);
              
              // Handle newMessage type from the server
              if (message.type === 'newMessage' && message.payload) {
                console.log('[WebSocket] Processing newMessage:', message.payload);
                this.onMessage(message.payload);
              } else {
                console.log('[WebSocket] Unhandled message type or missing payload:', message);
              }
            } catch (error) {
              console.error('[WebSocket] Error parsing message:', error);
            }
          } else {
            console.log('[WebSocket] No message handler registered');
          }
        });
      } catch (error) {
        console.error('[WebSocket] Error creating WebSocket:', error);
        reject(error);
      }
    });
  }

  sendMessage(from_user, channel, text) {
    if (!this.isConnected) {
      console.error('[WebSocket] Cannot send message: Not connected to server');
      return;
    }

    const message = {
      type: "sendMessage",
      payload: {
        userId: from_user,
        channelId: channel,
        text: text
      }
    };

    console.log('[WebSocket] Sending message:', message);
    try {
      this.ws.send(JSON.stringify(message));
      console.log('[WebSocket] Message sent successfully');
    } catch (error) {
      console.error('[WebSocket] Error sending message:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      console.log('[WebSocket] Disconnecting...');
      this.ws.close();
    }
  }
}

export default WebSocketClient; 