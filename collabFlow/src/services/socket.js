import { io } from 'socket.io-client';
import config from '../config';

const SOCKET_URL = config.SOCKET_URL;

let socket = null;

// Initialize socket connection
export const initSocket = (token) => {
    if (socket) {
        socket.disconnect();
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    return socket;
};

// Get current socket instance
export const getSocket = () => socket;

// Disconnect socket
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Socket event names for reference
export const SOCKET_EVENTS = {
    // Client emits
    PROJECT_JOIN: 'project:join',
    PROJECT_LEAVE: 'project:leave',
    TASK_MOVE: 'task:move',
    TASK_CREATE: 'task:create',
    TASK_UPDATE: 'task:update',
    TASK_DELETE: 'task:delete',
    TASK_EDITING: 'task:editing',

    // Server emits (client listens)
    TASK_CREATED: 'task:created',
    TASK_UPDATED: 'task:updated',
    TASK_MOVED: 'task:moved',
    TASK_DELETED: 'task:deleted',
    USER_JOINED: 'user:joined',
    USER_LEFT: 'user:left',
    ACTIVITY_NEW: 'activity:new',
    USER_EDITING: 'user:editing'
};

export default socket;
