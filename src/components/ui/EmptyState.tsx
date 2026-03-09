import React from 'react';

interface EmptyStateProps {
    icon: React.ComponentType<{ size?: number | string; className?: string }>;
    heading: string;
    body: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    heading,
    body,
    actionLabel,
    onAction,
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center py-24 text-center px-4 ${className}`}>
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-200">
                <Icon size={48} />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">{heading}</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-[260px]">{body}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded-[var(--radius-050)] px-2"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};
