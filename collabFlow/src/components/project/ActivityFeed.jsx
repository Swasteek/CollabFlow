import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Plus, Edit3, Trash2, ArrowRight, User, Clock, ChevronDown } from 'lucide-react';
import { formatActivityTime } from '../../utils/dateHelpers';

// Activity type icons and colors
const activityConfig = {
    'task_created': {
        icon: Plus,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        verb: 'created'
    },
    'task_updated': {
        icon: Edit3,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        verb: 'updated'
    },
    'task_moved': {
        icon: ArrowRight,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        verb: 'moved'
    },
    'task_deleted': {
        icon: Trash2,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        verb: 'deleted'
    },
    'task_assigned': {
        icon: User,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        verb: 'assigned'
    }
};

// Mock activities for MVP
const mockActivities = [
    {
        id: 1,
        type: 'task_moved',
        user: { id: 1, name: 'Alice' },
        task: { id: 'task-1', title: 'Design Landing Page' },
        details: { from: 'To Do', to: 'In Progress' },
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2 min ago
    },
    {
        id: 2,
        type: 'task_created',
        user: { id: 2, name: 'Bob' },
        task: { id: 'task-2', title: 'Setup React Project' },
        details: {},
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() // 5 min ago
    },
    {
        id: 3,
        type: 'task_assigned',
        user: { id: 1, name: 'You' },
        task: { id: 'task-3', title: 'Implement Auth' },
        details: { assignee: 'Charlie' },
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 min ago
    },
    {
        id: 4,
        type: 'task_updated',
        user: { id: 3, name: 'Charlie' },
        task: { id: 'task-4', title: 'Database Schema' },
        details: { field: 'priority', value: 'High' },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 min ago
    },
    {
        id: 5,
        type: 'task_moved',
        user: { id: 2, name: 'Bob' },
        task: { id: 'task-5', title: 'API Integration' },
        details: { from: 'In Progress', to: 'Done' },
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1 hour ago
    }
];

const ActivityItem = ({ activity }) => {
    const config = activityConfig[activity.type] || activityConfig.task_updated;
    const Icon = config.icon;

    const getActivityText = () => {
        switch (activity.type) {
            case 'task_created':
                return (
                    <>
                        <span className="font-medium text-white">{activity.user.name}</span>
                        {' created '}
                        <span className="font-medium text-slate-200">"{activity.task.title}"</span>
                    </>
                );
            case 'task_moved':
                return (
                    <>
                        <span className="font-medium text-white">{activity.user.name}</span>
                        {' moved '}
                        <span className="font-medium text-slate-200">"{activity.task.title}"</span>
                        {' to '}
                        <span className={`font-medium ${config.color}`}>{activity.details.to}</span>
                    </>
                );
            case 'task_assigned':
                return (
                    <>
                        <span className="font-medium text-white">{activity.user.name}</span>
                        {' assigned '}
                        <span className="font-medium text-slate-200">"{activity.task.title}"</span>
                        {' to '}
                        <span className="font-medium text-blue-400">{activity.details.assignee}</span>
                    </>
                );
            case 'task_updated':
                return (
                    <>
                        <span className="font-medium text-white">{activity.user.name}</span>
                        {' updated '}
                        <span className="font-medium text-slate-200">"{activity.task.title}"</span>
                    </>
                );
            case 'task_deleted':
                return (
                    <>
                        <span className="font-medium text-white">{activity.user.name}</span>
                        {' deleted '}
                        <span className="font-medium text-slate-200">"{activity.task.title}"</span>
                    </>
                );
            default:
                return (
                    <>
                        <span className="font-medium text-white">{activity.user.name}</span>
                        {' performed an action'}
                    </>
                );
        }
    };

    return (
        <div className="flex gap-3 p-3 hover:bg-slate-800/30 rounded-lg transition-colors">
            <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon size={14} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 leading-relaxed">
                    {getActivityText()}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                    <Clock size={10} />
                    <span>{formatActivityTime(activity.timestamp)}</span>
                </div>
            </div>
        </div>
    );
};

const ActivityFeed = ({ projectId, isOpen = true, onToggle }) => {
    const [activities, setActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    // Fetch activities
    useEffect(() => {
        const fetchActivities = async () => {
            setIsLoading(true);

            const config = (await import('../../config')).default;
            const USE_MOCK_API = config.USE_MOCK_API;

            if (USE_MOCK_API) {
                // Mock implementation
                await new Promise(resolve => setTimeout(resolve, 500));
                setActivities(mockActivities);
            } else {
                try {
                    // Real API call
                    const { activitiesAPI } = await import('../../services/api');
                    const response = await activitiesAPI.getByProject(projectId, { limit: 20 });
                    const activitiesData = response.data.activities || response.data.data || [];
                    setActivities(activitiesData);
                } catch (error) {
                    console.error('Failed to fetch activities:', error);
                    setActivities([]);
                }
            }

            setIsLoading(false);
        };

        if (projectId) {
            fetchActivities();
        }
    }, [projectId]);

    // Add new activity (called from socket events)
    const addActivity = useCallback((newActivity) => {
        setActivities(prev => [newActivity, ...prev].slice(0, 20));
    }, []);

    const loadMore = async () => {
        // Mock load more
        setHasMore(false);
    };

    if (!isOpen) return null;

    return (
        <div className="w-80 bg-slate-800/50 border-l border-white/5 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-slate-400" />
                    <h3 className="font-semibold text-white">Activity</h3>
                </div>
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="p-1 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
                    >
                        <ChevronDown size={18} />
                    </button>
                )}
            </div>

            {/* Activity List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(n => (
                            <div key={n} className="flex gap-3 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-slate-700" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-700 rounded w-3/4" />
                                    <div className="h-3 bg-slate-700/50 rounded w-1/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : activities.length === 0 ? (
                    <div className="p-8 text-center">
                        <Activity size={32} className="text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No activity yet</p>
                    </div>
                ) : (
                    <div className="py-2">
                        {activities.map(activity => (
                            <ActivityItem key={activity.id} activity={activity} />
                        ))}

                        {hasMore && (
                            <button
                                onClick={loadMore}
                                className="w-full py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                            >
                                Load more
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
