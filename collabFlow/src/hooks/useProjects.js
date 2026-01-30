import { useState, useCallback, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { extractResponseData, transformProjectFromBackend } from '../utils/apiHelpers';
import config from '../config';

// Flag to toggle between mock and real API
const USE_MOCK_API = config.USE_MOCK_API;

// Mock data for MVP (when backend is not available)
const mockProjects = [
    {
        id: 1,
        name: "Website Redesign",
        description: "Full revamp of the corporate portal and e-commerce engine.",
        taskCount: 24,
        activeTaskCount: 5,
        progress: 78,
        status: "on_track",
        icon: "pen",
        members: [
            { id: 1, name: 'Alice', avatar: null },
            { id: 2, name: 'Bob', avatar: null },
            { id: 3, name: 'Charlie', avatar: null }
        ],
        updatedAt: "2h ago"
    },
    {
        id: 2,
        name: "Q4 Marketing Campaign",
        description: "End of year strategy for holiday sales and promotion social ads.",
        taskCount: 12,
        activeTaskCount: 8,
        progress: 35,
        status: "high_priority",
        icon: "megaphone",
        members: [
            { id: 1, name: 'Alice', avatar: null },
            { id: 2, name: 'Bob', avatar: null },
            { id: 3, name: 'Charlie', avatar: null }
        ],
        updatedAt: "5h ago"
    },
    {
        id: 3,
        name: "Mobile App Development",
        description: "Native iOS and Android application build using Flutter framework.",
        taskCount: 45,
        activeTaskCount: 12,
        progress: 92,
        status: "on_track",
        icon: "smartphone",
        members: [
            { id: 1, name: 'Alice', avatar: null },
            { id: 2, name: 'Bob', avatar: null },
            { id: 3, name: 'Charlie', avatar: null },
            { id: 4, name: 'Diana', avatar: null },
            { id: 5, name: 'Eve', avatar: null },
            { id: 6, name: 'Frank', avatar: null },
            { id: 7, name: 'Grace', avatar: null },
            { id: 8, name: 'Henry', avatar: null },
            { id: 9, name: 'Ivy', avatar: null },
            { id: 10, name: 'Jack', avatar: null }
        ],
        updatedAt: "1d ago"
    },
    {
        id: 4,
        name: "Client Onboarding",
        description: "Standardized process for integrating new enterprise accounts.",
        taskCount: 8,
        activeTaskCount: 2,
        progress: 15,
        status: "planning",
        icon: "file",
        members: [
            { id: 1, name: 'Alice', avatar: null },
            { id: 2, name: 'Bob', avatar: null }
        ],
        updatedAt: "3d ago"
    }
];

export const useProjects = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all projects
    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (USE_MOCK_API) {
                // Mock implementation
                await new Promise(resolve => setTimeout(resolve, 800));
                const storedProjects = localStorage.getItem('projects');
                if (storedProjects) {
                    setProjects(JSON.parse(storedProjects));
                } else {
                    localStorage.setItem('projects', JSON.stringify(mockProjects));
                    setProjects(mockProjects);
                }
            } else {
                // Real API call
                const response = await projectsAPI.getAll();
                const projectsData = extractResponseData(response);
                // Transform backend format to frontend format
                const transformedProjects = Array.isArray(projectsData)
                    ? projectsData.map(transformProjectFromBackend)
                    : [];
                setProjects(transformedProjects);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to fetch projects';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch single project
    const fetchProject = useCallback(async (id) => {
        try {
            if (USE_MOCK_API) {
                // Mock implementation
                const storedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
                const project = storedProjects.find(p => p.id === parseInt(id) || p.id === id);
                return project || null;
            } else {
                // Real API call
                const response = await projectsAPI.getById(id);
                const projectData = extractResponseData(response);
                return transformProjectFromBackend(projectData);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load project';
            toast.error(errorMessage);
            throw err;
        }
    }, []);

    // Create project
    const createProject = useCallback(async (projectData) => {
        try {
            if (USE_MOCK_API) {
                // Mock implementation
                const newProject = {
                    id: Date.now(),
                    name: projectData.name,
                    description: projectData.description || '',
                    taskCount: 0,
                    activeTaskCount: 0,
                    progress: 0,
                    status: 'planning',
                    icon: 'folder',
                    members: [{ id: 1, name: 'You', avatar: null }],
                    updatedAt: 'Just now'
                };

                const updatedProjects = [newProject, ...projects];
                setProjects(updatedProjects);
                localStorage.setItem('projects', JSON.stringify(updatedProjects));

                toast.success('Project created successfully!');
                return newProject;
            } else {
                // Real API call
                const response = await projectsAPI.create(projectData);
                const responseData = extractResponseData(response);
                const newProject = transformProjectFromBackend(responseData);
                setProjects(prev => [newProject, ...prev]);
                toast.success('Project created successfully!');
                return newProject;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create project';
            toast.error(errorMessage);
            throw err;
        }
    }, [projects]);

    // Update project
    const updateProject = useCallback(async (id, updates) => {
        try {
            if (USE_MOCK_API) {
                // Mock implementation
                const updatedProjects = projects.map(p =>
                    (p.id === parseInt(id) || p.id === id)
                        ? { ...p, ...updates, updatedAt: 'Just now' }
                        : p
                );
                setProjects(updatedProjects);
                localStorage.setItem('projects', JSON.stringify(updatedProjects));

                toast.success('Project updated successfully!');
                return updatedProjects.find(p => p.id === parseInt(id) || p.id === id);
            } else {
                // Real API call
                const response = await projectsAPI.update(id, updates);
                const projectData = extractResponseData(response);
                const updatedProject = transformProjectFromBackend(projectData);
                setProjects(prev => prev.map(p => (p.id === parseInt(id) || p.id === id) ? updatedProject : p));
                toast.success('Project updated successfully!');
                return updatedProject;
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update project';
            toast.error(errorMessage);
            throw err;
        }
    }, [projects]);

    // Delete project
    const deleteProject = useCallback(async (id) => {
        try {
            if (USE_MOCK_API) {
                // Mock implementation
                const updatedProjects = projects.filter(p => p.id !== parseInt(id) && p.id !== id);
                setProjects(updatedProjects);
                localStorage.setItem('projects', JSON.stringify(updatedProjects));

                toast.success('Project deleted successfully!');
            } else {
                // Real API call
                await projectsAPI.delete(id);
                setProjects(prev => prev.filter(p => p.id !== parseInt(id) && p.id !== id));
                toast.success('Project deleted successfully!');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to delete project';
            toast.error(errorMessage);
            throw err;
        }
    }, [projects]);

    // Load projects on mount
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        isLoading,
        error,
        fetchProjects,
        fetchProject,
        createProject,
        updateProject,
        deleteProject
    };
};

export default useProjects;
