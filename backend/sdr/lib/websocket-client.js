import WebSocket from 'ws';

class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.isConnected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        console.log('[WebSocket] Connected to server');
        this.isConnected = true;
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('[WebSocket] Connection closed');
        this.isConnected = false;
      });
    });
  }

  sendMessage(text) {
    if (!this.isConnected) {
      console.error('[WebSocket] Not connected to server');
      return;
    }

    const message = {
      type: "sendMessage",
      payload: {
        userId: "user_sales_sarah",
        channelId: "channel_prospector",
        text: text
      }
    };

    this.ws.send(JSON.stringify(message));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export default WebSocketClient; 