import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    visible: boolean;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    visible,
    duration = 2000,
    onClose,
}) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onClose]);

    return (
        <div
            role="status"
            aria-live="polite"
            className={`
                fixed bottom-12 left-1/2 -translate-x-1/2 z-[100]
                bg-gray-900 text-white text-xs font-medium
                px-3 py-2 rounded-[var(--radius-full)] shadow-[var(--shadow-lg)]
                pointer-events-none transition-all duration-150
                ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
        >
            {message}
        </div>
    );
};
