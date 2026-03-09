import React from 'react';
import { PencilLine, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercent, calculateRentChangePercent } from '../../utils';
import { buildCellId } from './CellNavigation';

interface EditableRentCellProps {
    renewalId: string;
    value: number;
    currentRent: number;
    cellState: 'idle' | 'active' | 'editing' | 'error';
    editingValue: string;
    validationError: string | null;
    onFocus: (cellId: string) => void;
    onEditStart: (cellId: string, initialValue?: string) => void;
    onCommit: (cellId: string, rawValue: string) => void;
    onCancel: () => void;
    onValueChange: (value: string) => void;
}

export const EditableRentCell: React.FC<EditableRentCellProps> = ({
    renewalId,
    value,
    currentRent,
    cellState,
    editingValue,
    validationError,
    onFocus,
    onEditStart,
    onCommit,
    onValueChange,
}) => {
    const cellId = buildCellId(renewalId, 'proposedRent');
    const isEditing = cellState === 'editing' || cellState === 'error';

    // Determine if it's a hard error or a warning
    const isHardError = cellState === 'error';

    if (isEditing) {
        return (
            <td
                role="gridcell"
                className={`
                    relative py-1 px-2 min-w-[120px] bg-white ring-2 ring-inset transition-colors duration-100
                    ${isHardError ? 'ring-[var(--color-error)]' : validationError ? 'ring-amber-400' : 'ring-[var(--color-brand)]'}
                `}
            >
                <div className="relative flex items-center h-full">
                    <span className="absolute left-2 text-sm text-gray-400 pointer-events-none">$</span>
                    <input
                        type="text"
                        inputMode="decimal"
                        autoFocus
                        value={editingValue}
                        onChange={(e) => onValueChange(e.target.value)}
                        onBlur={() => onCommit(cellId, editingValue)}
                        onFocus={(e) => e.target.select()}
                        className="w-full text-right font-mono text-sm text-gray-900 bg-transparent outline-none border-none pl-5"
                        aria-label="Edit rent amount"
                        aria-invalid={validationError !== null}
                        aria-describedby={validationError ? `${cellId}-error` : undefined}
                    />
                </div>

                {!isHardError && validationError && (
                    <AlertTriangle size={10} className="absolute top-1 right-1 text-amber-500" />
                )}

                {validationError && (
                    <div
                        id={`${cellId}-error`}
                        className="absolute bottom-full left-0 mb-1 z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded-[var(--radius-050)] whitespace-nowrap pointer-events-none"
                    >
                        {validationError}
                        <div className="absolute -bottom-1 left-3 w-2 h-2 bg-gray-900 rotate-45" />
                    </div>
                )}
            </td>
        );
    }

    const rentChange = calculateRentChangePercent(currentRent, value);
    const isPositive = rentChange > 0;

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
                relative py-3 px-3 min-w-[120px] text-right cursor-default select-none transition-colors duration-100 outline-none
                ${cellState === 'idle' ? 'bg-green-50/40' : cellState === 'active' ? 'bg-green-100/60 ring-2 ring-inset ring-[var(--color-brand)]/40' : ''}
            `}
            aria-label={`New rent for renewal, currently ${formatCurrency(value)}`}
        >
            <div className={`inline-flex flex-col items-end ${cellState === 'idle' ? 'border-b border-dashed border-green-300' : ''}`}>
                <div className="text-sm font-mono text-gray-900 leading-tight">
                    {formatCurrency(value)}
                </div>
                <div className={`text-[10px] mt-0.5 font-medium ${isPositive ? 'text-green-600' : rentChange < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {rentChange === 0 ? '0.0%' : formatPercent(rentChange, true)}
                </div>
            </div>

            {cellState === 'active' && (
                <PencilLine size={10} className="absolute top-1 right-1 text-[var(--color-brand)]/60" />
            )}
        </td>
    );
};
