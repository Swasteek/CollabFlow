import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { validateLoginForm } from '../../utils/validators';
import { ButtonLoader } from '../shared/LoadingSpinner';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form
        const validation = validateLoginForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            await login(formData);
            toast.success('Welcome back!');
            
            // Redirect to intended page or dashboard
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(error.message || 'Invalid email or password');
            setErrors({ general: error.message || 'Login failed' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">C</span>
                    </div>
                    <span className="text-xl font-bold text-white">CollabFlow</span>
                </div>
                <div className="text-slate-400 text-sm">
                    Already have an account? <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">Log in</Link>
                </div>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">C</span>
                        </div>
                    </div>
                    <h2 className="auth-title">Login to your account</h2>
                    <p className="auth-subtitle">Manage your team's workflow in real-time.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* General Error */}
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {errors.general}
                        </div>
                    )}

                    {/* Email Field */}
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                name="email"
                                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="Email address"
                                value={formData.email}
                                onChange={handleChange}
                                style={{ paddingLeft: '2.5rem' }}
                                disabled={isLoading}
                                autoComplete="email"
                            />
                            <Mail
                                size={18}
                                color="#94a3b8"
                                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                            />
                        </div>
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                            <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                            <Link to="#" className="text-sm text-blue-400 hover:text-blue-300">Forgot password?</Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                disabled={isLoading}
                                autoComplete="current-password"
                            />
                            <Lock
                                size={18}
                                color="#94a3b8"
                                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0,
                                    display: 'flex'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                            </button>
                        </div>
                        {errors.password && <p className="form-error">{errors.password}</p>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading}
                        style={{ marginTop: '1rem' }}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <ButtonLoader />
                                Signing in...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>

                    {/* Separator */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[var(--glass-bg)] text-slate-400">OR</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700/50 transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="text-sm font-medium">Google</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white hover:bg-slate-700/50 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span className="text-sm font-medium">SSO</span>
                        </button>
                    </div>
                </form>

                <div className="auth-footer">
                    <p className="text-xs text-slate-500 mb-4">
                        By logging in, you agree to our{' '}
                        <Link to="#" className="text-blue-400 hover:text-blue-300">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</Link>.
                    </p>
                    <div>
                        Don't have an account? <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium">Sign up</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
