import React from 'react';
import { Settings } from 'lucide-react';
import type { NavItemConfig } from './shell.types';
import { NavItem } from '@/components/ui/NavItem';

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

const NAV_CONFIG: NavItemConfig[] = [
    { label: 'Dashboard', icon: 'layout-dashboard' },
    { label: 'Portfolios', icon: 'folders' },
    {
        label: 'Property', icon: 'building-2',
        children: [
            { label: 'Properties' },
            { label: 'Associations' },
            { label: 'Marketing' }
        ]
    },
    {
        label: 'Screening', icon: 'file-search',
        children: [
            { label: 'Dashboard' }, { label: 'Prospects' },
            { label: 'Applications' }, { label: 'Payments' },
            { label: 'Invitations' }
        ]
    },
    {
        label: 'Leases', icon: 'clipboard-list',
        isActive: true, isOpen: true,
        children: [
            { label: 'Dashboard' },
            { label: 'Leases' },
            { label: 'Renewals', isActive: true }
        ]
    },
    { label: 'Rentsign', icon: 'file-pen' },
    {
        label: 'Accounting', icon: 'dollar-sign',
        children: [
            { label: 'Dashboard' }, { label: 'Money In' }, { label: 'Money Out' },
            { label: 'Banking' }, { label: 'Transactions' },
            { label: 'Diagnostics' }, { label: 'Manager' }
        ]
    },
    {
        label: 'Contacts', icon: 'contact',
        children: [
            { label: 'Owners' }, { label: 'Tenants' },
            { label: 'Vendors' }, { label: 'Messages' }
        ]
    },
    {
        label: 'Maintenance', icon: 'wrench',
        children: [
            { label: 'Dashboard' }, { label: 'Work Orders' }, { label: 'Projects' },
            { label: 'Inspections' }, { label: 'Technicians' }, { label: 'Price Book' }
        ]
    },
    { label: 'Reports', icon: 'chart-line' },
];

export const Sidebar: React.FC<SidebarProps> = ({
    collapsed,
    onToggle,
    mobileOpen,
    onMobileClose
}) => {
    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-200"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
          fixed inset-y-0 left-0 h-screen z-40 bg-[var(--sidebar-bg)] 
          transition-[width,transform] duration-200 ease-in-out overflow-hidden flex flex-col
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
                style={{
                    width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width-expanded)'
                }}
            >
                {/* Logo Area */}
                <div
                    onClick={onToggle}
                    className="h-[60px] flex items-center px-4 border-b border-white/10 shrink-0 cursor-pointer hover:bg-[var(--sidebar-hover)] transition-colors w-full"
                >
                    <div className="flex items-center gap-1.5">
                        <svg width="26" height="26" viewBox="0 0 100 100" fill="none" className="shrink-0" xmlns="http://www.w3.org/2000/svg">
                            <polygon points="10,65 45,30 45,65 10,100" fill="#00a54f" />
                            <polygon points="45,0 80,35 80,70 45,35" fill="#00a54f" />
                        </svg>
                        <span
                            className={`
                text-[#D1D5DB] font-medium text-[22px] tracking-tight transition-all duration-200 origin-left
                ${collapsed ? 'opacity-0 scale-x-0 w-0' : 'opacity-100 scale-x-100 w-auto ml-1'}
              `}
                        >
                            rentvine
                        </span>
                    </div>
                </div>

                {/* Nav Section */}
                <nav
                    className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 space-y-0.5 custom-scrollbar"
                    role="navigation"
                    aria-label="Main navigation"
                >
                    {NAV_CONFIG.map((item, idx) => (
                        <NavItem
                            key={idx}
                            item={item}
                            collapsed={collapsed}
                            onToggle={() => {
                                // In a real app, this would update central state.
                                // For the prompt, we assume the config is static or managed by parent.
                            }}
                        />
                    ))}
                </nav>

                {/* User Section */}
                <div className="border-t border-white/10 px-2 py-3 shrink-0">
                    <div className="flex items-center gap-2 group p-1 rounded-md hover:bg-[var(--sidebar-hover)] transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            AJ
                        </div>

                        {!collapsed && (
                            <div className="flex-1 min-w-0 transition-opacity duration-200 mr-2">
                                <p className="text-sm font-medium text-white truncate">Alex Johnson</p>
                                <p className="text-xs text-sidebar-muted truncate">Sunrise Properties</p>
                            </div>
                        )}

                        {!collapsed && (
                            <button
                                className="p-1 text-gray-400 hover:text-white transition-colors"
                                aria-label="Settings"
                            >
                                <Settings size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};
