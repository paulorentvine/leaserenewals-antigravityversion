import type { LeaseRenewal, RenewalSortState } from '../../types';

export interface GridColumn {
    key: string;
    label: string;
    sortable?: boolean;
    align?: 'left' | 'right' | 'center';
    minWidth?: string;
    sticky?: boolean;           // true = sticky left (for unit column)
    editable?: boolean;         // true = cell will be editable in Prompt 1.5
    mono?: boolean;             // true = use font-mono for cell content
}

import type { UseEditableGridReturn } from '../../hooks/useEditableGrid';

export interface RenewalGridProps {
    renewals: LeaseRenewal[];
    sort: RenewalSortState;
    onSortChange: (sort: RenewalSortState) => void;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    editableGrid: UseEditableGridReturn;
    totalCount: number;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
}

export interface RenewalRowProps {
    renewal: LeaseRenewal;
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
    editableGrid: UseEditableGridReturn;
}
