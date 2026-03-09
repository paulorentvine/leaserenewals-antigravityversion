import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle, AlertTriangle, Check } from 'lucide-react';
import { Tooltip } from '../../../../components/ui/Tooltip';
import type { NewTermOption, MTMPolicy } from '../../types';
import { TERM_OPTIONS } from '../../constants';
import { buildCellId } from './CellNavigation';

interface EditableTermCellProps {
    renewalId: string;
    value: NewTermOption;
    mtmPolicy: MTMPolicy;
    cellState: 'idle' | 'active' | 'editing' | 'error';
    onFocus: (cellId: string) => void;
    onEditStart: (cellId: string) => void;
    onCommit: (cellId: string, value: string) => void;
    onCancel: () => void;
}

export const EditableTermCell: React.FC<EditableTermCellProps> = ({
    renewalId,
    value,
    mtmPolicy,
    cellState,
    onFocus,
    onEditStart,
    onCommit,
    onCancel,
}) => {
    const cellId = buildCellId(renewalId, 'proposedTerm');
    const [highlightIndex, setHighlightIndex] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isEditing = cellState === 'editing';

    useEffect(() => {
        if (isEditing) {
            const currentIndex = TERM_OPTIONS.findIndex(opt => opt.value === value);
            setHighlightIndex(currentIndex >= 0 ? currentIndex : 0);

            // Focus the dropdown container to catch keyboard events
            dropdownRef.current?.focus();
        }
    }, [isEditing, value]);

    useEffect(() => {
        if (!isEditing) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                onCancel();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing, onCancel]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isEditing) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightIndex(prev => (prev + 1) % TERM_OPTIONS.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightIndex(prev => (prev - 1 + TERM_OPTIONS.length) % TERM_OPTIONS.length);
                break;
            case 'Enter':
            case 'Tab': {
                e.preventDefault();
                const option = TERM_OPTIONS[highlightIndex];
                if (option.value === 'month_to_month' && mtmPolicy === 'forbidden') {
                    // Cannot select
                    return;
                }
                onCommit(cellId, option.value);
                break;
            }
            case 'Escape':
                e.preventDefault();
                onCancel();
                break;
        }
    };

    if (isEditing) {
        return (
            <td className="relative min-w-[140px] p-0 align-top z-[60]">
                {/* The cell acts as the relative anchor for the absolute absolute dropdown */}
                <div
                    ref={dropdownRef}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                    className="absolute top-0 left-0 min-w-[180px] bg-white rounded-[var(--radius-100)] border border-gray-200 shadow-[var(--shadow-lg)] overflow-hidden outline-none z-50"
                >
                    {TERM_OPTIONS.map((option, idx) => {
                        const isCurrent = option.value === value;
                        const isHighlighted = idx === highlightIndex;
                        const isMTM = option.value === 'month_to_month';
                        const isForbidden = isMTM && mtmPolicy === 'forbidden';
                        const isPremium = isMTM && mtmPolicy === 'premium';

                        return (
                            <div
                                key={option.value}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isForbidden) {
                                        onCommit(cellId, option.value);
                                    }
                                }}
                                onMouseEnter={() => setHighlightIndex(idx)}
                                className={`
                                    px-3 py-2.5 text-sm flex items-center justify-between transition-colors duration-100
                                    ${isForbidden ? 'opacity-50 cursor-not-allowed bg-white' : 'cursor-pointer hover:bg-gray-50'}
                                    ${isHighlighted && !isForbidden ? 'bg-gray-50' : ''}
                                `}
                            >
                                <div className="flex flex-col">
                                    <span className={isCurrent ? 'text-gray-900 font-medium' : 'text-gray-700'}>
                                        {option.label}
                                    </span>
                                    {isForbidden && (
                                        <span className="text-[10px] text-red-400 mt-0.5">Not allowed</span>
                                    )}
                                    {isPremium && (
                                        <span className="text-[10px] text-amber-600 mt-0.5">+{10}% premium</span>
                                    )}
                                </div>
                                {isCurrent && <Check size={14} className="text-[var(--color-brand)] ml-2" />}
                            </div>
                        );
                    })}
                </div>
            </td>
        );
    }

    const currentLabel = TERM_OPTIONS.find(opt => opt.value === value)?.label || value;
    const isMTM = value === 'month_to_month';
    const isForbidden = isMTM && mtmPolicy === 'forbidden';
    const isPremium = isMTM && mtmPolicy === 'premium';

    return (
        <td
            id={`cell-${cellId}`}
            data-cell-id={cellId}
            role="gridcell"
            tabIndex={cellState === 'idle' || cellState === 'active' ? 0 : -1}
            onFocus={() => onFocus(cellId)}
            onClick={() => onEditStart(cellId)}
            onDoubleClick={() => onEditStart(cellId)}
            className={`
                relative py-3 px-3 min-w-[140px] cursor-default transition-colors duration-100 outline-none
                ${cellState === 'idle' ? 'bg-green-50/40' : cellState === 'active' ? 'bg-green-100/60 ring-2 ring-inset ring-[var(--color-brand)]/40' : ''}
            `}
        >
            <div className={`inline-flex items-center gap-1.5 ${cellState === 'idle' ? 'border-b border-dashed border-green-300' : ''}`}>
                <span className={`text-sm ${isForbidden ? 'text-red-600 font-medium' : isPremium ? 'text-amber-700' : 'text-gray-700'}`}>
                    {currentLabel}
                </span>

                {isForbidden && (
                    <Tooltip content="Month-to-month is not allowed for this unit. Tenant must sign a fixed-term renewal.">
                        <span className="inline-flex">
                            <AlertCircle size={11} className="text-red-600" />
                        </span>
                    </Tooltip>
                )}
                {isPremium && (
                    <AlertTriangle size={11} className="text-amber-700" />
                )}
            </div>

            {cellState === 'active' && (
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-brand)]/60" />
            )}
        </td>
    );
};
