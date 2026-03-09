import React, { useState, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import type { FilterDropdownProps } from './FilterBar.types';

export function FilterDropdown<T extends string | number>({
    label,
    value,
    options,
    onChange,
    icon,
    placeholder,
    clearable = false
}: FilterDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [openUpward, setOpenUpward] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);
    const TriggerIcon = icon
        ? ((LucideIcons as any)[icon.charAt(0).toUpperCase() + icon.slice(1)] || LucideIcons.ChevronDown)
        : null;

    const ChevronDown = LucideIcons.ChevronDown;
    const X = LucideIcons.X;
    const Check = LucideIcons.Check;

    // Handles closing when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handles panel positioning
    useEffect(() => {
        if (isOpen && panelRef.current && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const panelHeight = panelRef.current.offsetHeight;
            const viewportHeight = window.innerHeight;

            if (rect.bottom + panelHeight > viewportHeight && rect.top > panelHeight) {
                setOpenUpward(true);
            } else {
                setOpenUpward(false);
            }
        }
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsOpen(true);
                setActiveIndex(selectedOption ? options.indexOf(selectedOption) : 0);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % options.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + options.length) % options.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0) {
                    onChange(options[activeIndex].value);
                    setIsOpen(false);
                }
                break;
            case 'Escape':
            case 'Tab':
                setIsOpen(false);
                triggerRef.current?.focus();
                break;
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                className={`
          flex items-center gap-1.5 rounded-[var(--radius-100)] border bg-white px-3 py-1.5 text-sm transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]
          ${value !== undefined
                        ? 'text-gray-900 font-medium border-gray-400'
                        : 'text-gray-700 border-gray-200 hover:bg-gray-50'}
        `}
            >
                {TriggerIcon && <TriggerIcon size={14} className="text-gray-400" />}

                <span className="truncate">
                    {selectedOption ? selectedOption.label : (placeholder || label)}
                </span>

                {clearable && value !== undefined ? (
                    <div
                        role="button"
                        onClick={handleClear}
                        className="ml-auto p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Clear selection"
                    >
                        <X size={14} className="text-gray-400 hover:text-gray-600" />
                    </div>
                ) : (
                    <ChevronDown
                        size={14}
                        className={`ml-auto text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
                    />
                )}
            </button>

            {isOpen && (
                <div
                    ref={panelRef}
                    role="listbox"
                    className={`
            absolute z-50 mt-1 min-w-[180px] max-w-[280px] bg-white rounded-[var(--radius-100)] border border-gray-200 shadow-[var(--shadow-lg)] overflow-hidden
            ${openUpward ? 'bottom-full mb-2' : 'top-full'}
          `}
                >
                    <div className="max-h-[240px] overflow-y-auto">
                        {options.map((opt, idx) => {
                            const isSelected = opt.value === value;
                            const isActive = idx === activeIndex;

                            return (
                                <div
                                    key={opt.value}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    onMouseEnter={() => setActiveIndex(idx)}
                                    className={`
                    px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors duration-100
                    ${isActive ? 'bg-gray-50' : ''}
                    ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}
                  `}
                                >
                                    {opt.label}
                                    {isSelected && <Check size={14} className="text-[var(--color-brand)]" />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
