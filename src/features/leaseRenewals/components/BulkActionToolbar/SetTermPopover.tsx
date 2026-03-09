import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import type { SetTermPopoverProps } from './BulkActionToolbar.types';
import { TERM_OPTIONS } from '../../constants';
import { MTMPolicy } from '../../types';

export const SetTermPopover: React.FC<SetTermPopoverProps> = ({
    selectedCount,
    selectedRenewals,
    onApply,
    onClose,
    anchorRef
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, anchorRef]);

    // Find the most common proposed term
    const termCounts = selectedRenewals.reduce((acc, r) => {
        acc[r.proposedTerm] = (acc[r.proposedTerm] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const mostCommonTerm = Object.entries(termCounts).reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];

    const anyForbidsMTM = selectedRenewals.some(r => r.mtmPolicy === MTMPolicy.FORBIDDEN);
    const mtmForbiddenCount = selectedRenewals.filter(r => r.mtmPolicy === MTMPolicy.FORBIDDEN).length;

    return (
        <div
            ref={containerRef}
            className="absolute bottom-full mb-2 right-0 bg-white rounded-[var(--radius-150)] border border-gray-200 shadow-[var(--shadow-xl)] w-[240px] p-4 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
            <div className="text-sm font-semibold text-neutral mb-1">Set Lease Term</div>
            <div className="text-xs text-neutral-muted mb-3">
                Apply to {selectedCount} selected renewal{selectedCount !== 1 ? 's' : ''}
            </div>

            <div className="mt-3 space-y-1">
                {TERM_OPTIONS.map((option) => {
                    const isCurrent = option.value === mostCommonTerm;
                    const isMTM = option.value === 'month_to_month';
                    const showWarning = isMTM && anyForbidsMTM;

                    return (
                        <button
                            key={option.value}
                            onClick={() => onApply(option.value)}
                            className={`
                w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-100)] text-sm transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-brand
                ${showWarning ? 'text-warning hover:bg-warning-surface' : 'text-neutral hover:bg-gray-50'}
              `}
                            title={isMTM && showWarning ? `${mtmForbiddenCount} selected renewal(s) have MTM disabled by policy` : undefined}
                        >
                            <div className="flex items-center gap-2">
                                <span>{option.label}</span>
                                {isCurrent && (
                                    <span className="bg-gray-100 text-neutral-muted text-[10px] px-1.5 py-px rounded-full font-medium">
                                        current
                                    </span>
                                )}
                                {showWarning && (
                                    <AlertTriangle size={12} className="text-warning" />
                                )}
                            </div>
                            {isCurrent && <Check size={14} className="text-brand" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
