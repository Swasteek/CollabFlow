import { useContext, useEffect, useCallback } from 'react';
import { SocketContext } from '../contexts/SocketContext';
import { SOCKET_EVENTS } from '../services/socket';

export const useSocket = () => {
    const context = useContext(SocketContext);
    
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    
    return context;
};

// Hook for subscribing to real-time task events
export const useTaskEvents = (handlers = {}) => {
    const { subscribe } = useSocket();
    
    useEffect(() => {
        const unsubscribers = [];
        
        if (handlers.onTaskCreated) {
            unsubscribers.push(subscribe(SOCKET_EVENTS.TASK_CREATED, handlers.onTaskCreated));
        }
        
        if (handlers.onTaskUpdated) {
            unsubscribers.push(subscribe(SOCKET_EVENTS.TASK_UPDATED, handlers.onTaskUpdated));
        }
        
        if (handlers.onTaskMoved) {
            unsubscribers.push(subscribe(SOCKET_EVENTS.TASK_MOVED, handlers.onTaskMoved));
        }
        
        if (handlers.onTaskDeleted) {
            unsubscribers.push(subscribe(SOCKET_EVENTS.TASK_DELETED, handlers.onTaskDeleted));
        }
        
        return () => {
            unsubscribers.forEach(unsub => unsub && unsub());
        };
    }, [subscribe, handlers]);
};

// Hook for subscribing to user presence events
export const usePresenceEvents = (handlers = {}) => {
    const { subscribe } = useSocket();
    
    useEffect(() => {
        const unsubscribers = [];
        
        if (handlers.onUserJoined) {
            unsubscribers.push(subscribe(SOCKET_EVENTS.USER_JOINED, handlers.onUserJoined));
        }
        
        if (handlers.onUserLeft) {
            unsubscribers.push(subscribe(SOCKET_EVENTS.USER_LEFT, handlers.onUserLeft));
        }
        
        if (handlers.onUserEditing) {
            unsubscribers.push(subscribe(SOCKET_EVENTS.USER_EDITING, handlers.onUserEditing));
        }
        
        return () => {
            unsubscribers.forEach(unsub => unsub && unsub());
        };
    }, [subscribe, handlers]);
};

// Hook for subscribing to activity events
export const useActivityEvents = (onNewActivity) => {
    const { subscribe } = useSocket();
    
    useEffect(() => {
        if (onNewActivity) {
            const unsub = subscribe(SOCKET_EVENTS.ACTIVITY_NEW, onNewActivity);
            return unsub;
        }
    }, [subscribe, onNewActivity]);
};

export default useSocket;
