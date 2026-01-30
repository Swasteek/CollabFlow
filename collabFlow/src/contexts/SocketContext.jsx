import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import config from '../config';

export const SocketContext = createContext(null);

const SOCKET_URL = config.SOCKET_URL;

export const SocketProvider = ({ children }) => {
    const { token, user, isAuthenticated } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState(null);

    // Initialize socket connection when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            const newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setConnected(true);
            });

            newSocket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                setConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error.message);
                setConnected(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [isAuthenticated, token]);

    // Join a project room
    const joinProject = useCallback((projectId) => {
        if (socket && connected && projectId) {
            // Leave previous project if any
            if (currentProjectId && currentProjectId !== projectId) {
                socket.emit('project:leave', { projectId: currentProjectId });
            }

            // Backend expects only { projectId } - user info comes from socket auth
            socket.emit('project:join', { projectId });
            setCurrentProjectId(projectId);
        }
    }, [socket, connected, currentProjectId]);

    // Leave a project room
    const leaveProject = useCallback((projectId) => {
        if (socket && connected && projectId) {
            // Backend expects only { projectId }
            socket.emit('project:leave', { projectId });
            if (currentProjectId === projectId) {
                setCurrentProjectId(null);
            }
        }
    }, [socket, connected, currentProjectId]);

    // Emit task moved event
    const emitTaskMoved = useCallback((taskId, oldStatus, newStatus, projectId) => {
        if (socket && connected) {
            // Backend expects { taskId, newStatus, projectId }
            // oldStatus is not needed as backend can check current status
            socket.emit('task:move', {
                taskId,
                newStatus,
                projectId: projectId || currentProjectId
            });
        }
    }, [socket, connected, currentProjectId]);

    // Emit task created event
    const emitTaskCreated = useCallback((task, projectId) => {
        // Note: Task creation is handled via REST API, not Socket.io
        // Backend will broadcast task:created after REST API call
        // This is kept for consistency but may not be used
        if (socket && connected) {
            // If backend expects this event, it would be: { taskId, projectId }
            // But typically task creation goes through REST API
        }
    }, [socket, connected, currentProjectId]);

    // Emit task updated event
    const emitTaskUpdated = useCallback((taskId, updates, projectId) => {
        // Note: Task updates are handled via REST API, not Socket.io
        // Backend will broadcast task:updated after REST API call
        // This is kept for consistency but may not be used
        if (socket && connected) {
            // If backend expects this event, it would be: { taskId, updates, projectId }
            // But typically task updates go through REST API
        }
    }, [socket, connected, currentProjectId]);

    // Emit task deleted event
    const emitTaskDeleted = useCallback((taskId, projectId) => {
        // Note: Task deletion is handled via REST API, not Socket.io
        // Backend will broadcast task:deleted after REST API call
        // This is kept for consistency but may not be used
        if (socket && connected) {
            // If backend expects this event, it would be: { taskId, projectId }
            // But typically task deletion goes through REST API
        }
    }, [socket, connected, currentProjectId]);

    // Emit task editing event (optional for real-time editing indicator)
    const emitTaskEditing = useCallback((taskId, isEditing, projectId) => {
        if (socket && connected) {
            socket.emit('task:editing', {
                taskId,
                isEditing,
                projectId: projectId || currentProjectId,
                userId: user?.id,
                username: user?.name
            });
        }
    }, [socket, connected, currentProjectId, user]);

    // Subscribe to an event
    const subscribe = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => { };
    }, [socket]);

    // Unsubscribe from an event
    const unsubscribe = useCallback((event, callback) => {
        if (socket) {
            socket.off(event, callback);
        }
    }, [socket]);

    const value = {
        socket,
        connected,
        currentProjectId,
        joinProject,
        leaveProject,
        emitTaskMoved,
        emitTaskCreated,
        emitTaskUpdated,
        emitTaskDeleted,
        emitTaskEditing,
        subscribe,
        unsubscribe
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
