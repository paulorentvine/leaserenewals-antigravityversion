import React from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, ChevronDown, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, info: ErrorInfo) => void;
    resetKey?: string | number;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    showDetails: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            showDetails: false,
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error, showDetails: false };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        if (this.props.onError) {
            this.props.onError(error, info);
        }
        console.error('[ErrorBoundary]', { error, componentStack: info });
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps) {
        if (prevProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false, error: null, showDetails: false });
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] px-6 py-8 text-center rounded-[var(--radius-150)] border border-red-100 bg-red-50/40 w-full">
                    <AlertTriangle size={32} className="text-red-300 mb-3" />
                    <h3 className="text-sm font-semibold text-gray-700">Something went wrong</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-[280px]">
                        An unexpected error occurred in this section. Your other work is not affected.
                    </p>

                    <div className="mt-3 w-full max-w-[400px]">
                        <button
                            onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 rounded px-1"
                        >
                            <ChevronDown
                                size={12}
                                className={`transition-transform duration-200 ${this.state.showDetails ? 'rotate-180' : ''}`}
                            />
                            Show error details
                        </button>

                        {this.state.showDetails && (
                            <div className="bg-white border border-gray-200 rounded-[var(--radius-075)] p-3 mt-2 text-left shadow-sm">
                                <pre className="text-[11px] text-red-700 font-mono whitespace-pre-wrap break-all overflow-auto max-h-[120px]">
                                    {this.state.error?.message}
                                    {'\n'}
                                    {this.state.error?.stack}
                                </pre>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-[var(--radius-100)] px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    >
                        <RefreshCw size={13} />
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
