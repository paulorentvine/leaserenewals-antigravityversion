import React, { useRef, useEffect } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, FileSearch, PencilLine, ClipboardList } from 'lucide-react';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { Tooltip } from '../../../../components/ui/Tooltip';
import type { RenewalGridProps, GridColumn } from './RenewalGrid.types';
import { RenewalRow } from './RenewalRow';

const GRID_COLUMNS: GridColumn[] = [
    { key: 'select', label: '', align: 'center', minWidth: '40px' },
    { key: 'unit', label: 'Unit / Address', sortable: true, minWidth: '200px', sticky: true },
    { key: 'tenant', label: 'Tenant', sortable: true, minWidth: '160px' },
    { key: 'currentRent', label: 'Current Rent', sortable: true, align: 'right', minWidth: '120px', mono: true },
    { key: 'proposedRent', label: 'New Rent', sortable: true, align: 'right', minWidth: '120px', mono: true, editable: true },
    { key: 'rentChangePct', label: '% Change', sortable: true, align: 'right', minWidth: '100px' },
    { key: 'leaseEndDate', label: 'Lease End', sortable: true, minWidth: '120px' },
    { key: 'proposedTerm', label: 'New Term', minWidth: '140px', editable: true },
    { key: 'mtmPolicy', label: 'MTM', minWidth: '140px' },
    { key: 'status', label: 'Status', sortable: true, minWidth: '160px' },
    { key: 'ownerApproval', label: 'Owner Approval', minWidth: '160px' },
    { key: 'actions', label: '', align: 'center', minWidth: '40px' },
];

export const RenewalGrid: React.FC<RenewalGridProps> = ({
    renewals,
    sort,
    onSortChange,
    selectedIds,
    onSelectionChange,
    editableGrid,
    totalCount,
    hasActiveFilters,
    onClearFilters
}) => {
    const headerCheckboxRef = useRef<HTMLInputElement>(null);

    const allSelected = renewals.length > 0 && Array.from(renewals).every(r => selectedIds.has(r.id));
    const someSelected = selectedIds.size > 0 && !allSelected;

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = someSelected;
        }
    }, [someSelected]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set([...Array.from(selectedIds), ...renewals.map(r => r.id)]);
            onSelectionChange(allIds);
        } else {
            const remainingIds = new Set(Array.from(selectedIds).filter(id => !renewals.some(r => r.id === id)));
            onSelectionChange(remainingIds);
        }
    };

    const handleToggleSort = (key: any) => {
        if (sort.column === key) {
            if (sort.direction === 'asc') {
                onSortChange({ ...sort, direction: 'desc' });
            } else {
                // Return to default sort
                onSortChange({ ...sort, column: 'leaseEndDate', direction: 'asc' });
            }
        } else {
            onSortChange({ ...sort, column: key, direction: 'asc' });
        }
    };

    return (
        <div
            className="flex-1 overflow-auto bg-white custom-scrollbar"
            onKeyDown={editableGrid.handleGridKeyDown}
        >
            <table
                role="grid"
                aria-label="Lease renewals"
                aria-rowcount={renewals.length}
                className="w-full min-w-[1200px] text-sm border-collapse table-fixed"
            >
                <thead className="sticky top-0 z-10">
                    <tr role="row" className="border-y border-gray-200 bg-gray-50/90 backdrop-blur-sm">
                        {GRID_COLUMNS.map((col) => {
                            const isSorted = sort.column === col.key;
                            const SortIcon = isSorted
                                ? (sort.direction === 'asc' ? ArrowUp : ArrowDown)
                                : ArrowUpDown;

                            return (
                                <th
                                    key={col.key}
                                    style={{ width: col.minWidth, minWidth: col.minWidth }}
                                    className={`
                    py-3 px-3 text-left text-xs font-semibold text-neutral-muted uppercase tracking-wider whitespace-nowrap
                    ${col.align === 'right' ? 'text-right' : ''}
                    ${col.align === 'center' ? 'text-center' : ''}
                    ${col.sticky ? 'sticky left-0 bg-gray-50 z-20 shadow-[1px_0_0_0_rgba(0,0,0,0.1)]' : ''}
                  `}
                                >
                                    {col.key === 'select' ? (
                                        <input
                                            ref={headerCheckboxRef}
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand focus:ring-opacity-25 transition-all cursor-pointer"
                                            aria-label="Select all renewals"
                                        />
                                    ) : col.sortable ? (
                                        <Tooltip content={`Sort by ${col.label}`}>
                                            <button
                                                onClick={() => handleToggleSort(col.key)}
                                                className={`
                                                    inline-flex items-center gap-1.5 transition-colors
                                                    ${isSorted ? 'text-neutral' : 'hover:text-neutral'}
                                                    ${col.align === 'right' ? 'flex-row-reverse' : ''}
                                                `}
                                                aria-sort={isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                                            >
                                                <span>{col.label}</span>
                                                <SortIcon size={12} className={isSorted ? 'text-[var(--color-brand)]' : 'text-gray-400'} />
                                                {col.editable && <PencilLine size={10} className="text-gray-300 ml-0.5" />}
                                            </button>
                                        </Tooltip>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <span>{col.label}</span>
                                            {col.editable && <PencilLine size={10} className="text-gray-300" />}
                                        </div>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {renewals.length > 0 ? (
                        renewals.map((renewal) => (
                            <RenewalRow
                                key={renewal.id}
                                renewal={renewal}
                                isSelected={selectedIds.has(renewal.id)}
                                onSelect={(val) => {
                                    const newSet = new Set(selectedIds);
                                    if (val) newSet.add(renewal.id);
                                    else newSet.delete(renewal.id);
                                    onSelectionChange(newSet);
                                }}
                                editableGrid={editableGrid}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan={GRID_COLUMNS.length} className="py-24">
                                {totalCount === 0 ? (
                                    <EmptyState
                                        icon={ClipboardList}
                                        heading="No renewals yet"
                                        body="Leases approaching their end date will appear here automatically."
                                    />
                                ) : (
                                    <EmptyState
                                        icon={FileSearch}
                                        heading="No renewals match your filters"
                                        body="Try adjusting the date range or clearing active filters."
                                        actionLabel={hasActiveFilters ? "Clear all filters" : undefined}
                                        onAction={hasActiveFilters ? onClearFilters : undefined}
                                    />
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};
