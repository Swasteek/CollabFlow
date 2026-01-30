import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import TaskColumn from '../components/project/TaskColumn';
import Navbar from '../components/shared/Navbar';
import TaskDetailModal from '../components/project/TaskDetailModal';
import ActivityFeed from '../components/project/ActivityFeed';
import ActiveUsers from '../components/project/ActiveUsers';
import { Users, Settings, Filter, ArrowLeft, Plus, Activity, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket, useTaskEvents, usePresenceEvents } from '../hooks/useSocket';
import { useProjects } from '../hooks/useProjects';
import { toast } from 'react-toastify';
import { PageLoader } from '../components/shared/LoadingSpinner';
import { transformTaskFromBackend, toFrontendStatus } from '../utils/apiHelpers';

// Initial board structure
const createInitialBoardData = () => ({
    tasks: {
        'task-1': { id: 'task-1', title: 'Design Landing Page', description: '', priority: 'High', assignee: 'Alice', dueDate: 'Oct 24', status: 'To Do' },
        'task-2': { id: 'task-2', title: 'Setup React Project', description: '', priority: 'High', assignee: 'Bob', dueDate: 'Oct 20', status: 'To Do' },
        'task-3': { id: 'task-3', title: 'Implement Auth', description: '', priority: 'Medium', assignee: 'Charlie', dueDate: 'Oct 25', status: 'In Progress' },
        'task-4': { id: 'task-4', title: 'Database Schema', description: '', priority: 'Low', assignee: 'Alice', dueDate: 'Oct 28', status: 'Done' },
    },
    columns: {
        'col-1': { id: 'col-1', title: 'To Do', taskIds: ['task-1', 'task-2'] },
        'col-2': { id: 'col-2', title: 'In Progress', taskIds: ['task-3'] },
        'col-3': { id: 'col-3', title: 'Done', taskIds: ['task-4'] },
    },
    columnOrder: ['col-1', 'col-2', 'col-3'],
});

const ProjectBoard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchProject } = useProjects();
    const { joinProject, leaveProject, emitTaskMoved, emitTaskCreated, emitTaskUpdated, emitTaskDeleted, connected } = useSocket();
    
    const [project, setProject] = useState(null);
    const [data, setData] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showActivityFeed, setShowActivityFeed] = useState(true);
    const [activeUsers, setActiveUsers] = useState([
        { id: 1, name: 'Alice', status: 'active' },
        { id: 2, name: 'Bob', status: 'active' }
    ]);

    // Load project and tasks data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const projectData = await fetchProject(id);
                setProject(projectData);
                
                // Load tasks from localStorage or use initial data
                const storedTasks = localStorage.getItem(`tasks_${id}`);
                if (storedTasks) {
                    setData(JSON.parse(storedTasks));
                } else {
                    const initialData = createInitialBoardData();
                    localStorage.setItem(`tasks_${id}`, JSON.stringify(initialData));
                    setData(initialData);
                }
            } catch (error) {
                toast.error('Failed to load project');
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [id, fetchProject, navigate]);

    // Join project room on mount
    useEffect(() => {
        if (id && connected) {
            joinProject(id);
        }
        
        return () => {
            if (id) {
                leaveProject(id);
            }
        };
    }, [id, connected, joinProject, leaveProject]);

    // Save data to localStorage whenever it changes
    const saveData = useCallback((newData) => {
        localStorage.setItem(`tasks_${id}`, JSON.stringify(newData));
    }, [id]);

    // Real-time event handlers
    const handleExternalTaskCreated = useCallback((eventData) => {
        if (eventData.projectId !== id) return;
        
        // Transform task from backend format
        const transformedTask = transformTaskFromBackend(eventData.task);
        
        setData(prev => {
            const columnId = Object.keys(prev.columns).find(
                colId => prev.columns[colId].title === transformedTask.status
            ) || 'col-1';
            
            const newData = {
                ...prev,
                tasks: { ...prev.tasks, [transformedTask.id]: transformedTask },
                columns: {
                    ...prev.columns,
                    [columnId]: {
                        ...prev.columns[columnId],
                        taskIds: [...prev.columns[columnId].taskIds, transformedTask.id]
                    }
                }
            };
            saveData(newData);
            return newData;
        });
        
        toast.info(`${eventData.username || 'Someone'} created a new task`);
    }, [id, saveData]);

    const handleExternalTaskUpdated = useCallback((eventData) => {
        if (eventData.projectId !== id) return;
        
        setData(prev => {
            const newData = {
                ...prev,
                tasks: {
                    ...prev.tasks,
                    [eventData.taskId]: { ...prev.tasks[eventData.taskId], ...eventData.updates }
                }
            };
            saveData(newData);
            return newData;
        });
    }, [id, saveData]);

    const handleExternalTaskMoved = useCallback((eventData) => {
        if (eventData.projectId !== id) return;
        
        // Convert backend status to frontend format
        const frontendOldStatus = toFrontendStatus(eventData.oldStatus);
        const frontendNewStatus = toFrontendStatus(eventData.newStatus);
        
        setData(prev => {
            const sourceColId = Object.keys(prev.columns).find(
                colId => prev.columns[colId].title === frontendOldStatus
            );
            const destColId = Object.keys(prev.columns).find(
                colId => prev.columns[colId].title === frontendNewStatus
            );
            
            if (!sourceColId || !destColId) return prev;
            
            const newColumns = { ...prev.columns };
            newColumns[sourceColId] = {
                ...newColumns[sourceColId],
                taskIds: newColumns[sourceColId].taskIds.filter(taskId => taskId !== eventData.taskId)
            };
            newColumns[destColId] = {
                ...newColumns[destColId],
                taskIds: [...newColumns[destColId].taskIds, eventData.taskId]
            };
            
            const newData = {
                ...prev,
                tasks: {
                    ...prev.tasks,
                    [eventData.taskId]: { ...prev.tasks[eventData.taskId], status: frontendNewStatus }
                },
                columns: newColumns
            };
            saveData(newData);
            return newData;
        });
        
        toast.info(`${eventData.username || 'Someone'} moved a task to ${frontendNewStatus}`);
    }, [id, saveData]);

    const handleExternalTaskDeleted = useCallback((eventData) => {
        if (eventData.projectId !== id) return;
        
        setData(prev => {
            const newTasks = { ...prev.tasks };
            delete newTasks[eventData.taskId];
            
            const newColumns = { ...prev.columns };
            Object.keys(newColumns).forEach(colId => {
                newColumns[colId] = {
                    ...newColumns[colId],
                    taskIds: newColumns[colId].taskIds.filter(id => id !== eventData.taskId)
                };
            });
            
            const newData = { ...prev, tasks: newTasks, columns: newColumns };
            saveData(newData);
            return newData;
        });
        
        toast.info(`${eventData.username || 'Someone'} deleted a task`);
    }, [id, saveData]);

    // Subscribe to task events
    useTaskEvents({
        onTaskCreated: handleExternalTaskCreated,
        onTaskUpdated: handleExternalTaskUpdated,
        onTaskMoved: handleExternalTaskMoved,
        onTaskDeleted: handleExternalTaskDeleted
    });

    // Handle user presence
    const handleUserJoined = useCallback((userData) => {
        setActiveUsers(prev => {
            if (prev.find(u => u.id === userData.userId)) return prev;
            return [...prev, { id: userData.userId, name: userData.username, status: 'active' }];
        });
        toast.info(`${userData.username} joined the project`);
    }, []);

    const handleUserLeft = useCallback((userData) => {
        setActiveUsers(prev => prev.filter(u => u.id !== userData.userId));
    }, []);

    usePresenceEvents({
        onUserJoined: handleUserJoined,
        onUserLeft: handleUserLeft
    });

    // Drag and drop handler
    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const start = data.columns[source.droppableId];
        const finish = data.columns[destination.droppableId];

        // Moving in same column
        if (start === finish) {
            const newTaskIds = Array.from(start.taskIds);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, draggableId);

            const newColumn = { ...start, taskIds: newTaskIds };
            const newData = { ...data, columns: { ...data.columns, [newColumn.id]: newColumn } };
            setData(newData);
            saveData(newData);
            return;
        }

        // Moving between columns
        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(source.index, 1);
        const newStart = { ...start, taskIds: startTaskIds };

        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destination.index, 0, draggableId);
        const newFinish = { ...finish, taskIds: finishTaskIds };

        // Update task status
        const updatedTask = { ...data.tasks[draggableId], status: finish.title };

        const newData = {
            ...data,
            tasks: { ...data.tasks, [draggableId]: updatedTask },
            columns: { ...data.columns, [newStart.id]: newStart, [newFinish.id]: newFinish },
        };
        
        setData(newData);
        saveData(newData);
        
        // Emit socket event
        emitTaskMoved(draggableId, start.title, finish.title, id);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleAddTask = (columnId) => {
        const newTaskId = `task-${Date.now()}`;
        const newTask = {
            id: newTaskId,
            title: 'New Task',
            description: '',
            priority: 'Medium',
            assignee: '',
            status: data.columns[columnId].title,
            dueDate: ''
        };

        const newTasks = { ...data.tasks, [newTaskId]: newTask };
        const newColumn = {
            ...data.columns[columnId],
            taskIds: [...data.columns[columnId].taskIds, newTaskId]
        };

        const newData = {
            ...data,
            tasks: newTasks,
            columns: { ...data.columns, [columnId]: newColumn }
        };
        
        setData(newData);
        saveData(newData);

        // Emit socket event
        emitTaskCreated(newTask, id);

        // Open modal immediately
        setSelectedTask(newTask);
        setIsModalOpen(true);
    };

    const handleUpdateTask = (updatedTask) => {
        const newData = {
            ...data,
            tasks: {
                ...data.tasks,
                [updatedTask.id]: updatedTask
            }
        };
        
        setData(newData);
        saveData(newData);
        
        // Emit socket event
        emitTaskUpdated(updatedTask.id, updatedTask, id);
    };

    const handleDeleteTask = (taskId) => {
        // Remove from tasks
        const newTasks = { ...data.tasks };
        delete newTasks[taskId];

        // Remove from columns
        const newColumns = { ...data.columns };
        Object.keys(newColumns).forEach(colId => {
            newColumns[colId] = {
                ...newColumns[colId],
                taskIds: newColumns[colId].taskIds.filter(id => id !== taskId)
            };
        });

        const newData = { ...data, tasks: newTasks, columns: newColumns };
        setData(newData);
        saveData(newData);
        setIsModalOpen(false);
        
        // Emit socket event
        emitTaskDeleted(taskId, id);
    };

    if (isLoading || !data) {
        return <PageLoader text="Loading project..." />;
    }

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-dark)] overflow-hidden">
            <Navbar />

            {/* Project Header */}
            <div className="border-b border-[var(--border)] bg-slate-800/30 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-white flex items-center gap-2">
                            {project?.name || 'Project Board'}
                            <span className="text-xs font-normal text-slate-500 border border-slate-700 px-2 py-0.5 rounded-full">
                                {connected ? 'Live' : 'Offline'}
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Active Users */}
                    <ActiveUsers projectId={id} />

                    <div className="h-6 w-px bg-slate-700 mx-1"></div>

                    <button className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
                        <Filter size={16} /> Filter
                    </button>
                    
                    <button 
                        onClick={() => setShowActivityFeed(!showActivityFeed)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${showActivityFeed ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}
                    >
                        <Activity size={16} /> Activity
                    </button>
                    
                    <button className="flex items-center gap-1.5 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium">
                        <Settings size={16} /> Settings
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Board Canvas */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="h-full flex p-6 gap-6 min-w-max">
                            {data.columnOrder.map((columnId) => {
                                const column = data.columns[columnId];
                                const tasks = column.taskIds.map((taskId) => data.tasks[taskId]).filter(Boolean);
                                return (
                                    <TaskColumn
                                        key={column.id}
                                        column={column}
                                        tasks={tasks}
                                        onAddTask={handleAddTask}
                                        onTaskClick={handleTaskClick}
                                    />
                                );
                            })}

                            {/* Add Column Button */}
                            <button className="w-80 h-12 rounded-xl bg-slate-800/30 border border-dashed border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all flex-shrink-0">
                                <Plus size={20} className="mr-2" /> Add Column
                            </button>
                        </div>
                    </DragDropContext>
                </div>

                {/* Activity Feed Sidebar */}
                {showActivityFeed && (
                    <ActivityFeed 
                        projectId={id} 
                        isOpen={showActivityFeed}
                        onToggle={() => setShowActivityFeed(false)}
                    />
                )}
            </div>

            <TaskDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                task={selectedTask}
                onSave={handleUpdateTask}
                onDelete={handleDeleteTask}
            />
        </div>
    );
};

export default ProjectBoard;
