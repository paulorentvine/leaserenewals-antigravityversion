import type { LeaseRenewal } from '../../types';

export const EDITABLE_COLUMNS = ['proposedRent', 'proposedTerm'] as const;
export type EditableColumn = typeof EDITABLE_COLUMNS[number];

export interface CellAddress {
    rowIndex: number;
    column: EditableColumn;
}

export function parseCellAddress(cellId: string, renewals: LeaseRenewal[]): CellAddress | null {
    const parts = cellId.split(':');
    if (parts.length !== 2) return null;
    const renewalId = parts[0];
    const column = parts[1];

    if (!isCellEditable(column)) return null;

    const rowIndex = renewals.findIndex(r => r.id === renewalId);
    if (rowIndex === -1) return null;

    return { rowIndex, column };
}

export function buildCellId(renewalId: string, column: EditableColumn): string {
    return `${renewalId}:${column}`;
}

export function getNextCell(
    current: CellAddress,
    rowCount: number,
    direction: 'forward' | 'backward'
): CellAddress | null {
    const colIndex = EDITABLE_COLUMNS.indexOf(current.column);

    if (direction === 'forward') {
        if (colIndex < EDITABLE_COLUMNS.length - 1) {
            return { rowIndex: current.rowIndex, column: EDITABLE_COLUMNS[colIndex + 1] };
        } else if (current.rowIndex < rowCount - 1) {
            return { rowIndex: current.rowIndex + 1, column: EDITABLE_COLUMNS[0] };
        }
        return null;
    } else {
        if (colIndex > 0) {
            return { rowIndex: current.rowIndex, column: EDITABLE_COLUMNS[colIndex - 1] };
        } else if (current.rowIndex > 0) {
            return { rowIndex: current.rowIndex - 1, column: EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1] };
        }
        return null;
    }
}

export function getVerticalCell(
    current: CellAddress,
    rowCount: number,
    direction: 'up' | 'down'
): CellAddress | null {
    if (direction === 'down') {
        if (current.rowIndex < rowCount - 1) {
            return { rowIndex: current.rowIndex + 1, column: current.column };
        }
    } else {
        if (current.rowIndex > 0) {
            return { rowIndex: current.rowIndex - 1, column: current.column };
        }
    }
    return null;
}

export function isCellEditable(column: string): column is EditableColumn {
    return EDITABLE_COLUMNS.includes(column as any);
}
