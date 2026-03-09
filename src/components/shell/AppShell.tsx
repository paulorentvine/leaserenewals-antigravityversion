import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { PageTitleBar } from './PageTitleBar';
import type { AppShellProps } from './shell.types';

export const AppShell: React.FC<AppShellProps> = ({
    children,
    pageTitleBarProps
}) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">

            {/* Sidebar — always rendered, hidden on mobile unless open */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(prev => !prev)}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
            />

            {/* Main Column */}
            <div
                className="flex flex-col flex-1 min-w-0 transition-[margin-left] duration-200 ease-in-out h-full"
                style={{
                    marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
                        ? sidebarCollapsed
                            ? 'var(--sidebar-width-collapsed)'
                            : 'var(--sidebar-width-expanded)'
                        : '0'
                }}
            >
                {/* Top Header */}
                <TopHeader
                    onMobileMenuOpen={() => setMobileMenuOpen(true)}
                    onSidebarToggle={() => setSidebarCollapsed(prev => !prev)}
                />

                {/* Page title bar area */}
                <div className="mt-[52px]"> {/* Fixed offset for top header */}
                    <PageTitleBar {...pageTitleBarProps} />
                </div>

                {/* Scrollable Main Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 overflow-x-hidden">
                    {children}
                </main>

            </div>

            {/* Dynamic CSS injection for simple media query responsiveness without a lot of extra hooks */}
            <style>{`
        @media (max-width: 1023px) {
          .flex-1.min-w-0 { margin-left: 0 !important; }
        }
      `}</style>
        </div>
    );
};
