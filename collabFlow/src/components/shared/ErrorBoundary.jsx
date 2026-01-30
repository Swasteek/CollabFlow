import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        
        // Log error to console (in production, send to error tracking service)
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        
                        <h1 className="text-xl font-bold text-white mb-2">
                            Something went wrong
                        </h1>
                        
                        <p className="text-slate-400 mb-6">
                            We're sorry, but something unexpected happened. Please try again or return to the dashboard.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-slate-900 rounded-lg text-left overflow-auto max-h-40">
                                <p className="text-red-400 text-sm font-mono">
                                    {this.state.error.toString()}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                            >
                                <Home size={16} />
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional error fallback component
export const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            
            <h1 className="text-xl font-bold text-white mb-2">
                Something went wrong
            </h1>
            
            <p className="text-slate-400 mb-6">
                {error?.message || 'An unexpected error occurred'}
            </p>

            <button
                onClick={resetErrorBoundary}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors mx-auto"
            >
                <RefreshCw size={16} />
                Try Again
            </button>
        </div>
    </div>
);

// Not found component
export const NotFound = ({ message = 'Page not found' }) => (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
            <h1 className="text-6xl font-bold text-slate-700 mb-4">404</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
                <Home size={16} />
                Return to Dashboard
            </a>
        </div>
    </div>
);

export default ErrorBoundary;
