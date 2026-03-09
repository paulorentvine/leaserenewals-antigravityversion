import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import type { NavItemConfig } from '@/components/shell/shell.types';

interface NavItemProps {
    item: NavItemConfig;
    collapsed: boolean;
    onToggle: () => void;
}

/**
 * Maps kebab-case icon name to Lucide PascalCase component name.
 * e.g. 'layout-dashboard' -> 'LayoutDashboard'
 */
const getIconComponent = (name: string) => {
    const pascalName = name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const Icon = (LucideIcons as any)[pascalName];
    return Icon || LucideIcons.HelpCircle;
};

export const NavItem: React.FC<NavItemProps> = ({ item, collapsed, onToggle }) => {
    const [isHovered, setIsHovered] = useState(false);
    const Icon = getIconComponent(item.icon);
    const ChevronDown = LucideIcons.ChevronDown;
    const ChevronUp = LucideIcons.ChevronUp;

    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.isActive;
    const isOpen = item.isOpen;

    return (
        <div
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <button
                onClick={onToggle}
                className={`
          w-full flex items-center px-2 py-1.5 text-sm rounded-md transition-colors duration-150 relative
          ${isActive && !hasChildren
                        ? 'text-white bg-[var(--sidebar-active)]'
                        : 'text-gray-400 hover:text-white hover:bg-[var(--sidebar-hover)]'}
          focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand)] outline-none
        `}
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-current={isActive && !hasChildren ? 'page' : undefined}
            >
                {/* Active bar */}
                {isActive && !hasChildren && (
                    <div className="absolute left-0 w-0.5 h-5 rounded-full bg-[var(--color-brand)]" />
                )}

                <Icon size={18} className="shrink-0" />

                <span
                    className={`
            ml-3 truncate transition-all duration-200
            ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}
          `}
                >
                    {item.label}
                </span>

                {hasChildren && !collapsed && (
                    <div className="ml-auto">
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                )}
            </button>

            {/* Children List */}
            {hasChildren && !collapsed && (
                <div
                    className={`
            overflow-hidden transition-all duration-200 ease-in-out pl-9 space-y-0.5
            ${isOpen ? 'max-h-96 mt-0.5' : 'max-h-0'}
          `}
                >
                    {item.children?.map((child, idx) => (
                        <button
                            key={idx}
                            className={`
                w-full text-left py-1.5 px-2 text-sm rounded-md relative transition-colors duration-150
                ${child.isActive
                                    ? 'text-white font-medium'
                                    : 'text-gray-400 hover:text-white hover:bg-[var(--sidebar-hover)]'}
                focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-brand)] outline-none
              `}
                            aria-current={child.isActive ? 'page' : undefined}
                        >
                            {child.isActive && (
                                <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-brand)]" />
                            )}
                            {child.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Tooltip when collapsed */}
            {collapsed && isHovered && (
                <div
                    className="absolute left-full top-0 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-[var(--radius-050)] whitespace-nowrap z-50 pointer-events-none shadow-lg"
                    role="tooltip"
                >
                    {item.label}
                </div>
            )}
        </div>
    );
};
