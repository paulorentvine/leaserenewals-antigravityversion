import React from 'react';
import { Menu, PanelLeft, Search, Bell } from 'lucide-react';

interface TopHeaderProps {
    onMobileMenuOpen: () => void;
    onSidebarToggle: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
    onMobileMenuOpen,
    onSidebarToggle
}) => {
    const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const kbdText = isMac ? '⌘K' : 'Ctrl K';

    return (
        <header
            className="fixed top-0 left-0 right-0 h-[52px] z-30 bg-white border-b border-black/[0.2] px-4 flex items-center gap-3"
            role="banner"
        >
            {/* Sidebar Toggles */}
            <div className="flex items-center">
                {/* Mobile Toggle */}
                <button
                    onClick={onMobileMenuOpen}
                    className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Open mobile menu"
                >
                    <Menu size={20} />
                </button>

                {/* Desktop Toggle */}
                <button
                    onClick={onSidebarToggle}
                    className="hidden lg:flex p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Toggle sidebar"
                >
                    <PanelLeft size={20} />
                </button>
            </div>

            {/* Center Search Bar */}
            <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex w-full max-w-[400px]">
                <div className="w-full flex items-center gap-2 border border-gray-200 rounded-[var(--radius-100)] bg-gray-50 px-3 py-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--color-brand)] focus-within:ring-opacity-20 transition-all group">
                    <Search size={16} className="text-gray-400 group-focus-within:text-[var(--color-brand)]" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="text-sm text-gray-500 bg-transparent outline-none flex-1 placeholder:text-gray-400"
                    />
                    <kbd className="bg-white border border-gray-200 rounded px-1.5 py-0.5 text-[10px] text-gray-400 font-mono shadow-sm">
                        {kbdText}
                    </kbd>
                </div>
            </div>

            {/* Right Section */}
            <div className="ml-auto flex items-center gap-2">
                <button
                    className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md transition-colors relative"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    <span className="absolute w-1.5 h-1.5 rounded-full bg-red-500 top-1.5 right-1.5 border border-white" />
                </button>

                <button
                    className="p-0.5 rounded-full hover:ring-2 hover:ring-gray-200 transition-all"
                    aria-label="User menu"
                >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow-sm">
                        AJ
                    </div>
                </button>
            </div>
        </header>
    );
};
