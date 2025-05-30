
import type { Channel } from './types';

export const DEFAULT_WS_URL = 'ws://localhost:8080'; // Default WebSocket server URL
export const DEFAULT_USER_ID = 'bayram'; // Default User ID

export const CHANNELS: Channel[] = [
  { id: 'Amazon', name: 'Amazon' },
  { id: 'Google', name: 'Google' },
  { id: 'OpenAI', name: 'OpenAI' },
];

export const USERS = [
  'bayram',
  'merdan', 
  'researcher',
  'sdr',
  'scheduler'
];
    