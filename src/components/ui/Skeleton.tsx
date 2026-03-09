import React from 'react';

export interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
    rounded?: 'sm' | 'md' | 'lg' | 'full';
    lines?: number;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    rounded = 'md',
    lines = 1,
    style,
}) => {
    // Prompt fixes
    const exactRoundedClass = rounded === 'sm' ? 'rounded-[var(--radius-050)]' :
        rounded === 'md' ? 'rounded-[var(--radius-100)]' :
            rounded === 'lg' ? 'rounded-[var(--radius-150)]' :
                'rounded-full';

    if (lines > 1) {
        return (
            <div className={`flex flex-col gap-2 ${className}`}>
                {Array.from({ length: lines }).map((_, i) => {
                    const isLast = i === lines - 1;
                    return (
                        <div
                            key={i}
                            className={`bg-gray-200 animate-pulse ${exactRoundedClass} ${isLast ? 'w-[60%]' : 'w-full'} ${height || 'h-3'}`}
                        />
                    );
                })}
            </div>
        );
    }

    return (
        <div
            className={`bg-gray-200 animate-pulse ${exactRoundedClass} ${className}`}
            style={{ width, height: height || '12px', ...style }}
        />
    );
};
