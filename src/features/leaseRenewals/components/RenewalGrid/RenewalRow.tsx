import React from 'react';
import { MoreVertical, CalendarClock } from 'lucide-react';
import type { RenewalRowProps } from './RenewalGrid.types';
import { StatusBadge } from './StatusBadge';
import { MTMBadge } from './MTMBadge';
import { OwnerApprovalCell } from './OwnerApprovalCell';
import {
    formatCurrency,
    calculateRentChangePercent,
    formatPercent,
    formatLeaseEndDate,
    isLeaseEndingSoon
} from '../../utils';
import { RenewalStatus, OwnerApprovalStatus } from '../../types';
import { EditableRentCell } from './EditableRentCell';
import { EditableTermCell } from './EditableTermCell';
import { buildCellId } from './CellNavigation';

export const RenewalRow: React.FC<RenewalRowProps> = React.memo(({
    renewal,
    isSelected,
    onSelect,
    editableGrid
}) => {
    const pct = calculateRentChangePercent(renewal.currentRent, renewal.proposedRent);
    const isEndingSoon = isLeaseEndingSoon(renewal.leaseEndDate, 30);

    const requiresAttention = renewal.status === RenewalStatus.VACATING ||
        renewal.ownerApprovalStatus === OwnerApprovalStatus.REQUIRES_ACTION;

    const {
        getCellState,
        editingCellId,
        editingValue,
        validationError,
        handleCellFocus,
        handleCellEditStart,
        handleCellEditCommit,
        handleCellEditCancel,
        handleEditingValueChange,
    } = editableGrid;

    return (
        <tr
            className={`
        hover:bg-gray-50/50 transition-colors duration-100 border-b border-border group
        ${isSelected ? 'bg-brand-surface' : ''}
        ${requiresAttention ? 'border-l-2 border-l-error' : ''}
        ${renewal.isDirty ? 'border-l-2 border-l-warning' : ''}
      `}
        >
            {/* 1. Checkbox */}
            <td className="w-10 pl-3 pr-1 py-3 text-center">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-opacity-25 transition-all cursor-pointer"
                    aria-label={`Select renewal for ${renewal.tenant.firstName} ${renewal.tenant.lastName}`}
                />
            </td>

            {/* 2. Unit / Address */}
            <td className="py-3 px-3 min-w-[200px]">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral truncate">
                        {renewal.property.unitNumber ? `Unit ${renewal.property.unitNumber} · ` : ''}
                        {renewal.property.address}
                    </span>
                    <span className="text-xs text-neutral-muted">
                        {renewal.property.city}, {renewal.property.state}
                    </span>
                    <div className="mt-1 flex">
                        <span className="inline-flex items-center bg-gray-100 rounded px-1.5 py-px text-[10px] text-neutral-muted font-medium">
                            {renewal.property.portfolioName}
                        </span>
                    </div>
                </div>
            </td>

            {/* 3. Tenant */}
            <td className="py-3 px-3 min-w-[160px]">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-neutral truncate">
                        {renewal.tenant.firstName} {renewal.tenant.lastName}
                    </span>
                    <span className="text-xs text-neutral-muted truncate max-w-[160px]">
                        {renewal.tenant.email}
                    </span>
                </div>
            </td>

            {/* 4. Current Rent */}
            <td className="py-3 px-3 min-w-[120px] text-right font-mono text-sm text-neutral">
                {formatCurrency(renewal.currentRent)}
            </td>

            {/* 5. New Rent */}
            <EditableRentCell
                renewalId={renewal.id}
                value={renewal.proposedRent}
                currentRent={renewal.currentRent}
                cellState={getCellState(buildCellId(renewal.id, 'proposedRent'))}
                editingValue={editingCellId === buildCellId(renewal.id, 'proposedRent') ? editingValue : ''}
                validationError={editingCellId === buildCellId(renewal.id, 'proposedRent') ? validationError : null}
                onFocus={handleCellFocus}
                onEditStart={handleCellEditStart}
                onCommit={handleCellEditCommit}
                onCancel={handleCellEditCancel}
                onValueChange={handleEditingValueChange}
            />

            {/* 6. % Change */}
            <td className="py-3 px-3 min-w-[100px] text-right">
                {pct > 0 ? (
                    <span className="text-sm font-semibold text-success">{formatPercent(pct, true)}</span>
                ) : pct < 0 ? (
                    <span className="text-sm font-semibold text-error">{formatPercent(pct, true)}</span>
                ) : (
                    <span className="text-sm text-neutral-muted">—</span>
                )}
            </td>

            {/* 7. Lease End */}
            <td className="py-3 px-3 min-w-[120px] text-sm">
                <div className={`flex items-center gap-1 ${isEndingSoon ? 'text-warning font-semibold' : 'text-neutral'}`}>
                    <span>{formatLeaseEndDate(renewal.leaseEndDate)}</span>
                    {isEndingSoon && <CalendarClock size={12} className="shrink-0" />}
                </div>
            </td>

            {/* 8. New Term */}
            <EditableTermCell
                renewalId={renewal.id}
                value={renewal.proposedTerm}
                mtmPolicy={renewal.mtmPolicy}
                cellState={getCellState(buildCellId(renewal.id, 'proposedTerm'))}
                onFocus={handleCellFocus}
                onEditStart={handleCellEditStart}
                onCommit={handleCellEditCommit}
                onCancel={handleCellEditCancel}
            />

            {/* 9. MTM */}
            <td className="py-3 px-3 min-w-[140px]">
                <MTMBadge
                    policy={renewal.mtmPolicy}
                    premiumPercent={renewal.mtmPremiumPercent}
                />
            </td>

            {/* 10. Status */}
            <td className="py-3 px-3 min-w-[160px]">
                <StatusBadge status={renewal.status} />
            </td>

            {/* 11. Owner Approval */}
            <td className="py-3 px-3 min-w-[160px]">
                <OwnerApprovalCell status={renewal.ownerApprovalStatus} />
            </td>

            {/* 12. Actions */}
            <td className="w-10 py-3 px-1 text-center">
                <button
                    className="p-1.5 rounded-md text-neutral-muted hover:text-neutral hover:bg-gray-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Row actions"
                    onClick={() => console.log('Row actions clicked', renewal.id)}
                >
                    <MoreVertical size={16} />
                </button>
            </td>
        </tr>
    );
});
RenewalRow.displayName = 'RenewalRow';
