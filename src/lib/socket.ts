import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'https://contaminous-shemika-superelated.ngrok-free.dev';

let socket: Socket | null = null;
let currentUserId: string | null = null;

/**
 * Get user ID from localStorage
 */
const getUserId = (): string => {
  if (currentUserId) return currentUserId;
  
  const user = localStorage.getItem('user');
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      currentUserId = userData.id || userData._id || 'default-user';
      return currentUserId;
    } catch (e) {
      console.error('Failed to parse user data:', e);
    }
  }
  
  currentUserId = 'default-user';
  return currentUserId;
};

/**
 * Get auth token from server-side JWT generation
 */
const getAuthToken = async (): Promise<string> => {
  const user = localStorage.getItem('user');
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      const userId = userData.id || userData._id || 'default-user';
      const userName = userData.username || userData.name || userData.email || 'Anonymous';
      const userRole = userData.role || 'admin';
      
      // Request JWT token from server
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          name: userName,
          role: userRole
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.token;
      }
    } catch (e) {
      console.error('Failed to get auth token:', e);
    }
  }
  
  // Generate default token from server
  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'default-user',
        name: 'Anonymous',
        role: 'admin'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.token;
    }
  } catch (e) {
    console.error('Failed to get default token:', e);
  }
  
  return 'fallback-token';
};

/**
 * Initialize socket connection
 */
export const initializeSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    return socket;
  }

  const authToken = await getAuthToken();

  socket = io(SOCKET_URL, {
    auth: { token: authToken },
    transports: ['websocket', 'polling']
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Join a chat room
 */
export const joinRoom = async (roomName?: string): Promise<void> => {
  if (!socket) return;
  
  const userId = getUserId();
  const room = roomName || `user-${userId}`;
  
  socket.emit('join_room', room);
  console.log(`📥 Joined room: ${room}`);
};

/**
 * Send a chat message
 */
export const sendChatMessage = async (message: string, roomName?: string): Promise<void> => {
  if (!socket) {
    console.error('Socket not initialized');
    return;
  }

  const userId = getUserId();
  const room = roomName || `user-${userId}`;

  socket.emit('chat_message', {
    room,
    message
  });
  
  console.log(`💬 Sent message to ${room}:`, message);
};

/**
 * Listen for AI responses
 */
export const onResponse = (callback: (data: any) => void): void => {
  if (!socket) return;
  
  socket.on('response', callback);
};

/**
 * Listen for status messages
 */
export const onStatus = (callback: (data: any) => void): void => {
  if (!socket) return;
  
  socket.on('status', callback);
};

/**
 * Listen for connection status
 */
export const onConnect = (callback: () => void): void => {
  if (!socket) return;
  
  socket.on('connect', callback);
};

/**
 * Listen for disconnection
 */
export const onDisconnect = (callback: () => void): void => {
  if (!socket) return;
  
  socket.on('disconnect', callback);
};

/**
 * Listen for connection errors
 */
export const onConnectionError = (callback: (error: Error) => void): void => {
  if (!socket) return;
  
  socket.on('connect_error', callback);
};

/**
 * Remove all event listeners
 */
export const removeAllListeners = (): void => {
  if (!socket) return;
  
  socket.removeAllListeners();
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Disconnected from AI server');
  }
};
