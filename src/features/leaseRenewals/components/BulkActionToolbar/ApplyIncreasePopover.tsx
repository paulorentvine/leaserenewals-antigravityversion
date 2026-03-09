import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';
import type { ApplyIncreasePopoverProps } from './BulkActionToolbar.types';
import { formatCurrency } from '../../utils';

export const ApplyIncreasePopover: React.FC<ApplyIncreasePopoverProps> = ({
    selectedCount,
    onApply,
    onClose,
    anchorRef
}) => {
    const [type, setType] = useState<'percent' | 'flat'>('percent');
    const [value, setValue] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();

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

    const validate = (val: number) => {
        if (val <= 0) return "Value must be greater than 0";
        if (type === 'percent' && val > 50) return "Increase cannot exceed 50%";
        if (type === 'flat' && val > 5000) return "Increase cannot exceed $5,000";
        return null;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue(val);
        const num = parseFloat(val);
        if (!isNaN(num)) {
            setError(validate(num));
        } else {
            setError(null);
        }
    };

    const handleApply = () => {
        const num = parseFloat(value);
        if (!isNaN(num) && !validate(num)) {
            onApply(type, num);
        }
    };

    return (
        <div
            ref={containerRef}
            className="absolute bottom-full mb-2 left-0 bg-white rounded-[var(--radius-150)] border border-gray-200 shadow-[var(--shadow-xl)] w-[280px] p-4 z-50 text-left animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
            <div className="text-sm font-semibold text-neutral mb-1">Apply Rent Increase</div>
            <div className="text-xs text-neutral-muted mb-3">
                Will be applied to {selectedCount} selected renewal{selectedCount !== 1 ? 's' : ''}
            </div>

            <div className="flex rounded-[var(--radius-075)] bg-gray-100 p-0.5 mb-4">
                <button
                    onClick={() => setType('percent')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-[var(--radius-050)] transition-all ${type === 'percent' ? 'bg-white text-neutral shadow-[var(--shadow-sm)]' : 'text-neutral-muted hover:text-neutral'
                        }`}
                >
                    Percentage
                </button>
                <button
                    onClick={() => setType('flat')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-[var(--radius-050)] transition-all ${type === 'flat' ? 'bg-white text-neutral shadow-[var(--shadow-sm)]' : 'text-neutral-muted hover:text-neutral'
                        }`}
                >
                    Flat Amount
                </button>
            </div>

            <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-neutral-muted mb-1">
                    {type === 'percent' ? 'Percentage increase' : 'Fixed amount ($)'}
                </label>
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="number"
                        value={value}
                        onChange={handleChange}
                        placeholder={type === 'percent' ? '0.0' : '0'}
                        className={`
              w-full rounded-[var(--radius-100)] border py-2 text-sm text-neutral outline-none transition-all duration-150
              ${type === 'percent' ? 'pl-3 pr-8' : 'pl-7 pr-3'}
              ${error ? 'border-error-border focus:border-error ring-error-surface' : 'border-gray-200 focus:border-brand focus:ring-1 focus:ring-brand'}
            `}
                    />
                    {type === 'percent' ? (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-muted font-medium">%</span>
                    ) : (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-muted font-medium">$</span>
                    )}
                </div>
                {error && <div className="text-[11px] text-error mt-1 font-medium">{error}</div>}
            </div>

            {!error && value && !isNaN(parseFloat(value)) && (
                <div className="bg-success-surface rounded-[var(--radius-075)] px-3 py-2 text-xs text-success flex items-center gap-2">
                    <TrendingUp size={14} className="shrink-0" />
                    <span>
                        {type === 'percent'
                            ? `e.g. $1,800 + ${value}% = ${formatCurrency(1800 * (1 + parseFloat(value) / 100))}`
                            : `e.g. $1,800 + ${formatCurrency(parseFloat(value))} = ${formatCurrency(1800 + parseFloat(value))}`
                        }
                    </span>
                </div>
            )}

            <div className="flex gap-2 mt-4">
                <button
                    onClick={onClose}
                    className="flex-1 py-2 text-sm font-medium text-neutral-muted border border-gray-200 rounded-[var(--radius-100)] hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleApply}
                    disabled={!!error || !value}
                    className={`
            flex-1 py-2 text-sm font-medium rounded-[var(--radius-100)] transition-all
            ${!!error || !value
                            ? 'bg-gray-100 text-neutral-disabled cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary-hover'}
          `}
                >
                    Apply
                </button>
            </div>
        </div>
    );
};
