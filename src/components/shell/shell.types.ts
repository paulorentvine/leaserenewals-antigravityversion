import React from 'react';

export interface NavChild {
    label: string;
    href?: string;
    isActive?: boolean;
}

export interface NavItemConfig {
    label: string;
    icon: string;            // lucide icon name, kebab-case
    href?: string;
    children?: NavChild[];
    isActive?: boolean;      // true = this item or one of its children is active
    isOpen?: boolean;        // true = children are expanded
}

export interface PageTitleBarProps {
    title: string;
    primaryAction?: {
        label: string;
        icon?: string;         // lucide icon name
        onClick: () => void;
    };
    secondaryAction?: {
        icon: string;
        onClick: () => void;
        ariaLabel: string;
    };
}

export interface AppShellProps {
    children: React.ReactNode;
    pageTitleBarProps: PageTitleBarProps;
}
