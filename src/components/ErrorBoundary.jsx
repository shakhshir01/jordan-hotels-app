import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
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
      errorInfo: errorInfo,
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
            <AlertTriangle className="mx-auto text-red-600 mb-4" size={48} />
            <h2 className="text-2xl font-black mb-2 text-slate-900">Oops! Something went wrong</h2>
            <p className="text-slate-600 mb-6">We encountered an unexpected error. Our team has been notified.</p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-mono text-red-800 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-900 text-white p-3 rounded-lg font-bold hover:bg-black transition-all"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ComponentErrorBoundary = ({ children, fallback = null }) => {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
