import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';

interface TooltipProps {
    children: ReactNode;
    content: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
    className?: string; // added to allow spreading or customization if needed
}

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    content,
    side = 'top',
    delay = 400,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const showTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setIsVisible(true), delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    let positionClasses = '';
    let arrowClasses = '';

    switch (side) {
        case 'top':
            positionClasses = 'bottom-full mb-1.5 left-1/2 -translate-x-1/2';
            arrowClasses = 'top-[calc(100%-4px)] left-1/2 -translate-x-1/2';
            break;
        case 'bottom':
            positionClasses = 'top-full mt-1.5 left-1/2 -translate-x-1/2';
            arrowClasses = 'bottom-[calc(100%-4px)] left-1/2 -translate-x-1/2';
            break;
        case 'left':
            positionClasses = 'right-full mr-1.5 top-1/2 -translate-y-1/2';
            arrowClasses = 'left-[calc(100%-4px)] top-1/2 -translate-y-1/2';
            break;
        case 'right':
            positionClasses = 'left-full ml-1.5 top-1/2 -translate-y-1/2';
            arrowClasses = 'right-[calc(100%-4px)] top-1/2 -translate-y-1/2';
            break;
    }

    return (
        <div
            className="relative inline-block w-max"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
            aria-describedby={isVisible ? 'tooltip' : undefined}
        >
            {children}
            {isVisible && (
                <div
                    role="tooltip"
                    id="tooltip"
                    className={`absolute z-50 pointer-events-none bg-gray-900 text-white text-xs font-medium px-2 py-1.5 rounded-[var(--radius-050)] whitespace-nowrap max-w-[200px] shadow-[var(--shadow-md)] transition-all duration-100 ease-out opacity-100 scale-100 origin-center ${positionClasses}`}
                >
                    {content}
                    <div
                        className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${arrowClasses}`}
                    />
                </div>
            )}
        </div>
    );
};
