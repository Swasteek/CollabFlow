// Email validation
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Password validation (min 6 characters)
export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

// Password match validation
export const passwordsMatch = (password, confirmPassword) => {
    return password === confirmPassword;
};

// Name validation (not empty)
export const isValidName = (name) => {
    return name && name.trim().length > 0;
};

// Project name validation
export const isValidProjectName = (name) => {
    return name && name.trim().length >= 2 && name.trim().length <= 100;
};

// Task title validation
export const isValidTaskTitle = (title) => {
    return title && title.trim().length >= 1 && title.trim().length <= 200;
};

// Form validation helper
export const validateLoginForm = (formData) => {
    const errors = {};

    if (!formData.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
        errors.password = 'Password must be at least 8 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateSignupForm = (formData) => {
    const errors = {};

    if (!formData.name) {
        errors.name = 'Name is required';
    } else if (!isValidName(formData.name)) {
        errors.name = 'Please enter a valid name';
    }

    if (!formData.email) {
        errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
        errors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
    } else if (!passwordsMatch(formData.password, formData.confirmPassword)) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateProjectForm = (formData) => {
    const errors = {};

    if (!formData.name) {
        errors.name = 'Project name is required';
    } else if (!isValidProjectName(formData.name)) {
        errors.name = 'Project name must be between 2 and 100 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateTaskForm = (formData) => {
    const errors = {};

    if (!formData.title) {
        errors.title = 'Task title is required';
    } else if (!isValidTaskTitle(formData.title)) {
        errors.title = 'Task title must be between 1 and 200 characters';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export default {
    isValidEmail,
    isValidPassword,
    passwordsMatch,
    isValidName,
    isValidProjectName,
    isValidTaskTitle,
    validateLoginForm,
    validateSignupForm,
    validateProjectForm,
    validateTaskForm
};
