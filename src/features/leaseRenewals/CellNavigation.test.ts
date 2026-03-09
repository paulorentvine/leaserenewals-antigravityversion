import { describe, it, expect } from 'vitest';
import {
    parseCellAddress,
    buildCellId,
    getNextCell,
    getVerticalCell,
    isCellEditable,
    EDITABLE_COLUMNS,
} from './components/RenewalGrid/CellNavigation';
import type { LeaseRenewal } from './types';

// Minimal mock renewals for testing
const mockRenewals = [
    { id: 'r1' },
    { id: 'r2' },
    { id: 'r3' },
] as LeaseRenewal[];

describe('buildCellId', () => {
    it('creates a cell id from renewal id and column', () => {
        expect(buildCellId('r1', 'proposedRent')).toBe('r1:proposedRent');
    });
});

describe('parseCellAddress', () => {
    it('parses a valid cell id', () => {
        const result = parseCellAddress('r2:proposedRent', mockRenewals);
        expect(result).toEqual({ rowIndex: 1, column: 'proposedRent' });
    });
    it('returns null for invalid column', () => {
        const result = parseCellAddress('r1:status', mockRenewals);
        expect(result).toBeNull();
    });
    it('returns null for unknown renewal id', () => {
        const result = parseCellAddress('unknown:proposedRent', mockRenewals);
        expect(result).toBeNull();
    });
    it('returns null for malformed cell id', () => {
        expect(parseCellAddress('badformat', mockRenewals)).toBeNull();
    });
});

describe('getNextCell', () => {
    it('moves forward to next column in same row', () => {
        const current = { rowIndex: 0, column: EDITABLE_COLUMNS[0] };
        const next = getNextCell(current, 3, 'forward');
        expect(next).toEqual({ rowIndex: 0, column: EDITABLE_COLUMNS[1] });
    });
    it('wraps to next row when at last column', () => {
        const current = { rowIndex: 0, column: EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1] };
        const next = getNextCell(current, 3, 'forward');
        expect(next).toEqual({ rowIndex: 1, column: EDITABLE_COLUMNS[0] });
    });
    it('returns null at last cell', () => {
        const current = { rowIndex: 2, column: EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1] };
        const next = getNextCell(current, 3, 'forward');
        expect(next).toBeNull();
    });
    it('moves backward to previous column', () => {
        const current = { rowIndex: 0, column: EDITABLE_COLUMNS[1] };
        const prev = getNextCell(current, 3, 'backward');
        expect(prev).toEqual({ rowIndex: 0, column: EDITABLE_COLUMNS[0] });
    });
    it('wraps to previous row when at first column', () => {
        const current = { rowIndex: 1, column: EDITABLE_COLUMNS[0] };
        const prev = getNextCell(current, 3, 'backward');
        expect(prev).toEqual({ rowIndex: 0, column: EDITABLE_COLUMNS[EDITABLE_COLUMNS.length - 1] });
    });
    it('returns null at first cell going backward', () => {
        const current = { rowIndex: 0, column: EDITABLE_COLUMNS[0] };
        const prev = getNextCell(current, 3, 'backward');
        expect(prev).toBeNull();
    });
});

describe('getVerticalCell', () => {
    it('moves down', () => {
        const result = getVerticalCell({ rowIndex: 0, column: 'proposedRent' }, 3, 'down');
        expect(result).toEqual({ rowIndex: 1, column: 'proposedRent' });
    });
    it('moves up', () => {
        const result = getVerticalCell({ rowIndex: 2, column: 'proposedTerm' }, 3, 'up');
        expect(result).toEqual({ rowIndex: 1, column: 'proposedTerm' });
    });
    it('returns null at bottom', () => {
        const result = getVerticalCell({ rowIndex: 2, column: 'proposedRent' }, 3, 'down');
        expect(result).toBeNull();
    });
    it('returns null at top', () => {
        const result = getVerticalCell({ rowIndex: 0, column: 'proposedRent' }, 3, 'up');
        expect(result).toBeNull();
    });
});

describe('isCellEditable', () => {
    it('returns true for editable columns', () => {
        expect(isCellEditable('proposedRent')).toBe(true);
        expect(isCellEditable('proposedTerm')).toBe(true);
    });
    it('returns false for non-editable columns', () => {
        expect(isCellEditable('status')).toBe(false);
        expect(isCellEditable('leaseEndDate')).toBe(false);
    });
});
