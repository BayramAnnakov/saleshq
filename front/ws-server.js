#!/usr/bin/env node
import { WebSocketServer } from 'ws';
import { randomUUID } from 'crypto';

// Default port or use PORT environment variable
const PORT = process.env.PORT || 8080;

// Create a WebSocket server
const wss = new WebSocketServer({ port: Number(PORT) });

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (err) {
      console.error('Invalid JSON received:', err);
      ws.send(JSON.stringify({ type: 'error', payload: { message: 'Invalid JSON format' } }));
      return;
    }

    if (msg.type === 'sendMessage' && msg.payload) {
      const { userId, channelId, text } = msg.payload;
      // Construct a new message to broadcast
      const newMessage = {
        id: randomUUID(),
        channelId,
        senderId: userId,
        text,
        timestamp: Date.now(),
      };
      const broadcastMsg = { type: 'newMessage', payload: newMessage };

      // Broadcast to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(broadcastMsg));
        }
      });
    } else {
      console.warn('Unknown message type or missing payload:', msg.type);
      ws.send(JSON.stringify({ type: 'error', payload: { message: 'Unknown message type' } }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});