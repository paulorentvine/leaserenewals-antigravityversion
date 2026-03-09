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

export interface RenewalGridProps {
    renewals: LeaseRenewal[];
    sort: RenewalSortState;
    onSortChange: (sort: RenewalSortState) => void;
    selectedIds: Set<string>;
    onSelectionChange: (ids: Set<string>) => void;
    editingCellId: string | null;
    onCellEditStart: (cellId: string) => void;
    onCellEditEnd: () => void;
    onRenewalChange: (id: string, changes: Partial<LeaseRenewal>) => void;
}

export interface RenewalRowProps {
    renewal: LeaseRenewal;
    columns: GridColumn[];
    isSelected: boolean;
    onSelect: (selected: boolean) => void;
    editingCellId: string | null;
    onCellEditStart: (cellId: string) => void;
    onCellEditEnd: () => void;
    onChange: (changes: Partial<LeaseRenewal>) => void;
}
