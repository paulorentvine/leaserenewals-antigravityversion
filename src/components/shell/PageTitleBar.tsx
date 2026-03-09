import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { PageTitleBarProps } from './shell.types';

const getIcon = (name?: string) => {
    if (!name) return null;
    const pascalName = name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const Icon = (LucideIcons as any)[pascalName];
    return Icon || null;
};

export const PageTitleBar: React.FC<PageTitleBarProps> = ({
    title,
    primaryAction,
    secondaryAction
}) => {
    const PrimaryIcon = getIcon(primaryAction?.icon);
    const SecondaryIcon = getIcon(secondaryAction?.icon);

    return (
        <section
            className="bg-white border-b border-black/[0.2] px-4 py-2 flex items-center justify-between min-h-[52px]"
            aria-labelledby="page-title"
        >
            {/* Left: Title */}
            <h1
                id="page-title"
                className="text-xl lg:text-[28px] font-semibold text-gray-900 tracking-[-0.8px] leading-[34px] truncate max-w-[50%] lg:max-w-none"
            >
                {title}
            </h1>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {primaryAction && (
                    <button
                        onClick={primaryAction.onClick}
                        className="
              flex items-center gap-2
              bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
              active:bg-[var(--color-primary-active)]
              text-white text-sm font-medium
              px-4 py-2.5 rounded-[var(--radius-100)]
              transition-colors duration-150
              focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-brand)] outline-none
              shadow-sm
            "
                    >
                        {PrimaryIcon && <PrimaryIcon size={16} />}
                        <span className="hidden sm:inline">{primaryAction.label}</span>
                    </button>
                )}

                {secondaryAction && (
                    <button
                        onClick={secondaryAction.onClick}
                        className="
              bg-gray-200 hover:bg-gray-300
              p-2.5 rounded-[var(--radius-100)]
              text-gray-600
              transition-colors duration-150
              focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 outline-none
            "
                        aria-label={secondaryAction.ariaLabel}
                    >
                        {SecondaryIcon && <SecondaryIcon size={16} />}
                    </button>
                )}
            </div>
        </section>
    );
};
