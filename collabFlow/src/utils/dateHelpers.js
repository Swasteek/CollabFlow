import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

// Format date to readable string (e.g., "Oct 24, 2024")
export const formatDate = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return date; // Return original if invalid
    
    return format(dateObj, 'MMM d, yyyy');
};

// Format date to short format (e.g., "Oct 24")
export const formatDateShort = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return date;
    
    return format(dateObj, 'MMM d');
};

// Format date to relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return date;
    
    return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Format date for input fields (e.g., "2024-10-24")
export const formatDateForInput = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, 'yyyy-MM-dd');
};

// Format time (e.g., "2:30 PM")
export const formatTime = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, 'h:mm a');
};

// Format datetime (e.g., "Oct 24, 2024 at 2:30 PM")
export const formatDateTime = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, "MMM d, yyyy 'at' h:mm a");
};

// Check if date is today
export const isToday = (date) => {
    if (!date) return false;
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    
    const today = new Date();
    return (
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear()
    );
};

// Check if date is in the past
export const isPastDue = (date) => {
    if (!date) return false;
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return false;
    
    return dateObj < new Date();
};

// Get day of week (e.g., "Monday")
export const getDayOfWeek = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, 'EEEE');
};

// Format activity timestamp
export const formatActivityTime = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return date;
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return formatDate(dateObj);
    }
};

export default {
    formatDate,
    formatDateShort,
    formatRelativeTime,
    formatDateForInput,
    formatTime,
    formatDateTime,
    isToday,
    isPastDue,
    getDayOfWeek,
    formatActivityTime
};
