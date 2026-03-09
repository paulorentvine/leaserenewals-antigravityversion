import React, { useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import type { RenewalTabConfig, RenewalTabsProps } from './RenewalTabs.types';

const TAB_CONFIG: RenewalTabConfig[] = [
    { id: 'active', label: 'Active Renewals', ariaLabel: 'Active Renewals tab' },
    { id: 'pending_offers', label: 'Pending Offers', ariaLabel: 'Pending Offers tab' },
    { id: 'completed', label: 'Completed', ariaLabel: 'Completed tab' },
    { id: 'settings', icon: 'settings', ariaLabel: 'Renewal Settings tab' },
];

export const RenewalTabs: React.FC<RenewalTabsProps> = ({ activeTab, onChange, counts }) => {
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'ArrowRight') {
            const nextIndex = (index + 1) % TAB_CONFIG.length;
            tabRefs.current[nextIndex]?.focus();
        } else if (e.key === 'ArrowLeft') {
            const prevIndex = (index - 1 + TAB_CONFIG.length) % TAB_CONFIG.length;
            tabRefs.current[prevIndex]?.focus();
        }
    };

    return (
        <div
            className="flex items-center gap-1 px-4 pt-2 border-b border-gray-200 bg-white"
            role="tablist"
            aria-orientation="horizontal"
        >
            {TAB_CONFIG.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                const count = counts[tab.id] || 0;
                const Icon = tab.icon
                    ? ((LucideIcons as any)[tab.icon.charAt(0).toUpperCase() + tab.icon.slice(1)] || LucideIcons.HelpCircle)
                    : null;

                return (
                    <button
                        key={tab.id}
                        ref={el => { tabRefs.current[idx] = el; }}
                        role="tab"
                        aria-selected={isActive}
                        aria-label={tab.ariaLabel}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => onChange(tab.id)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className={`
              flex items-center whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand)]
              ${isActive
                                ? 'text-gray-900 border-gray-900'
                                : 'text-gray-500 border-transparent hover:text-gray-700'}
              ${tab.id === 'settings' ? 'px-2' : ''}
            `}
                    >
                        {Icon && <Icon size={16} className={isActive ? 'text-gray-700' : 'text-gray-400'} />}

                        {tab.label && (
                            <span>{tab.label}</span>
                        )}

                        {count > 0 && (
                            <span
                                className={`
                  ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-medium transition-colors
                  ${isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}
                `}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
