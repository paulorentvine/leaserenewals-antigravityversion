import { useReducer, useCallback } from 'react';
import type { LeaseRenewal, NewTermOption } from '../types';
import type { UseUndoStackReturn } from './useUndoStack';
import {
    parseCellAddress,
    buildCellId,
    getNextCell,
    getVerticalCell
} from '../components/RenewalGrid/CellNavigation';
import { TERM_OPTIONS } from '../constants';
import { formatCurrency } from '../utils';

interface UseEditableGridOptions {
    renewals: LeaseRenewal[];
    onRenewalChange: (id: string, changes: Partial<LeaseRenewal>) => void;
    undoStack: UseUndoStackReturn<Partial<LeaseRenewal> & { id: string }>;
}

interface EditableGridState {
    activeCellId: string | null;
    editingCellId: string | null;
    editingValue: string;
    editingOriginalValue: string;
    validationError: string | null;
}

type Action =
    | { type: 'FOCUS_CELL'; cellId: string }
    | { type: 'EDIT_START'; cellId: string; initialValue: string; originalValue: string }
    | { type: 'EDIT_CHANGE'; value: string; validationError: string | null }
    | { type: 'EDIT_CANCEL' }
    | { type: 'CLEAR_EDIT_STATE' }
    | { type: 'SET_ACTIVE_CELL'; cellId: string | null };

function gridReducer(state: EditableGridState, action: Action): EditableGridState {
    switch (action.type) {
        case 'FOCUS_CELL':
            return {
                ...state,
                activeCellId: action.cellId,
            };
        case 'EDIT_START':
            return {
                ...state,
                activeCellId: action.cellId,
                editingCellId: action.cellId,
                editingOriginalValue: action.originalValue,
                editingValue: action.initialValue,
                validationError: null,
            };
        case 'EDIT_CHANGE':
            return {
                ...state,
                editingValue: action.value,
                validationError: action.validationError,
            };
        case 'EDIT_CANCEL':
            return {
                ...state,
                activeCellId: state.editingCellId,
                editingCellId: null,
                editingValue: '',
                validationError: null,
            };
        case 'CLEAR_EDIT_STATE':
            return {
                ...state,
                editingCellId: null,
                editingValue: '',
                validationError: null,
            };
        case 'SET_ACTIVE_CELL':
            return {
                ...state,
                activeCellId: action.cellId,
            };
        default:
            return state;
    }
}

export interface UseEditableGridReturn {
    activeCellId: string | null;
    editingCellId: string | null;
    editingValue: string;
    validationError: string | null;

    handleCellFocus: (cellId: string) => void;
    handleCellEditStart: (cellId: string, initialValue?: string) => void;
    handleCellEditCommit: (cellId: string, rawValue: string) => void;
    handleCellEditCancel: () => void;
    handleEditingValueChange: (value: string) => void;
    handleGridKeyDown: (e: React.KeyboardEvent) => void;
    getCellState: (cellId: string) => 'idle' | 'active' | 'editing' | 'error';
}

export function useEditableGrid({ renewals, onRenewalChange, undoStack }: UseEditableGridOptions): UseEditableGridReturn {
    const [state, dispatch] = useReducer(gridReducer, {
        activeCellId: null,
        editingCellId: null,
        editingValue: '',
        editingOriginalValue: '',
        validationError: null,
    });

    const isHardError = (error: string | null) => {
        if (!error) return false;
        return error === 'Please enter a valid number' || error === 'Rent must be greater than $0' || error === 'Rent amount is required';
    };

    const validateRent = (val: string, currentRent: number) => {
        if (val.trim() === '') return 'Rent amount is required';
        const num = parseFloat(val.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return 'Please enter a valid number';
        if (num <= 0) return 'Rent must be greater than $0';
        if (num > currentRent * 3) return 'Rent increase seems unusually high — double-check';
        return null;
    };

    const handleEditingValueChange = useCallback((value: string) => {
        let error: string | null = null;
        if (state.editingCellId) {
            const addr = parseCellAddress(state.editingCellId, renewals);
            if (addr && addr.column === 'proposedRent') {
                const row = renewals[addr.rowIndex];
                error = validateRent(value, row.currentRent);
            }
        }
        dispatch({ type: 'EDIT_CHANGE', value, validationError: error });
    }, [state.editingCellId, renewals]);

    const handleCellFocus = useCallback((cellId: string) => {
        dispatch({ type: 'FOCUS_CELL', cellId });
    }, []);

    const handleCellEditStart = useCallback((cellId: string, initialValue?: string) => {
        const addr = parseCellAddress(cellId, renewals);
        if (!addr) return;

        const row = renewals[addr.rowIndex];
        let originalValue = '';
        if (addr.column === 'proposedRent') {
            originalValue = row.proposedRent.toString();
        } else if (addr.column === 'proposedTerm') {
            originalValue = row.proposedTerm;
        }

        const startValue = initialValue ?? (addr.column === 'proposedRent' ? formatCurrency(row.proposedRent) : originalValue);

        dispatch({
            type: 'EDIT_START',
            cellId,
            initialValue: startValue,
            originalValue,
        });

        if (initialValue !== undefined && addr.column === 'proposedRent') {
            const error = validateRent(startValue, row.currentRent);
            dispatch({ type: 'EDIT_CHANGE', value: startValue, validationError: error });
        }
    }, [renewals]);

    const handleCellEditCommit = useCallback((cellId: string, rawValue: string) => {
        const addr = parseCellAddress(cellId, renewals);
        if (!addr) return;

        const row = renewals[addr.rowIndex];

        if (addr.column === 'proposedRent') {
            const error = validateRent(rawValue, row.currentRent);
            if (isHardError(error)) {
                return; // Block commit
            }

            let parsedValue = parseFloat(rawValue.replace(/[^0-9.]/g, ''));
            if (isNaN(parsedValue)) parsedValue = 0;
            parsedValue = Math.round(parsedValue);

            if (parsedValue === row.proposedRent) {
                dispatch({ type: 'CLEAR_EDIT_STATE' });
                return;
            }

            onRenewalChange(row.id, { proposedRent: parsedValue, isDirty: true });

            undoStack.push({
                previous: { id: row.id, proposedRent: row.proposedRent, isDirty: row.isDirty },
                next: { id: row.id, proposedRent: parsedValue, isDirty: true },
                label: `Rent changed: ${formatCurrency(row.proposedRent)} → ${formatCurrency(parsedValue)}`,
                timestamp: Date.now()
            });

        } else if (addr.column === 'proposedTerm') {
            const parsedValue = rawValue as NewTermOption;
            if (parsedValue === row.proposedTerm) {
                dispatch({ type: 'CLEAR_EDIT_STATE' });
                return;
            }

            onRenewalChange(row.id, { proposedTerm: parsedValue, isDirty: true });

            const termLabel = TERM_OPTIONS.find((t: { value: NewTermOption, label: string }) => t.value === parsedValue)?.label || parsedValue;
            undoStack.push({
                previous: { id: row.id, proposedTerm: row.proposedTerm, isDirty: row.isDirty },
                next: { id: row.id, proposedTerm: parsedValue, isDirty: true },
                label: `Term changed to ${termLabel}`,
                timestamp: Date.now()
            });
        }

        dispatch({ type: 'CLEAR_EDIT_STATE' });
    }, [renewals, onRenewalChange, undoStack]);

    const handleCellEditCancel = useCallback(() => {
        dispatch({ type: 'EDIT_CANCEL' });
    }, []);

    const focusCellDOM = (cellId: string) => {
        // Find DOM element and focus if possible
        const el = document.getElementById(`cell-${cellId}`) || document.querySelector(`[data-cell-id="${cellId}"]`);
        if (el instanceof HTMLElement) {
            el.focus();
        }
    };

    const handleGridKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (!state.activeCellId && !state.editingCellId) return;

        const currentCellId = state.editingCellId || state.activeCellId!;
        const addr = parseCellAddress(currentCellId, renewals);
        if (!addr) return;

        if (!state.editingCellId) {
            // NOT EDITING
            if (e.key === 'Tab') {
                e.preventDefault();
                const next = getNextCell(addr, renewals.length, e.shiftKey ? 'backward' : 'forward');
                if (next) {
                    const nextId = buildCellId(renewals[next.rowIndex].id, next.column);
                    dispatch({ type: 'FOCUS_CELL', cellId: nextId });
                    setTimeout(() => focusCellDOM(nextId), 0);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = getVerticalCell(addr, renewals.length, 'down');
                if (next) {
                    const nextId = buildCellId(renewals[next.rowIndex].id, next.column);
                    dispatch({ type: 'FOCUS_CELL', cellId: nextId });
                    setTimeout(() => focusCellDOM(nextId), 0);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const next = getVerticalCell(addr, renewals.length, 'up');
                if (next) {
                    const nextId = buildCellId(renewals[next.rowIndex].id, next.column);
                    dispatch({ type: 'FOCUS_CELL', cellId: nextId });
                    setTimeout(() => focusCellDOM(nextId), 0);
                }
            } else if (e.key === 'Enter' || e.key === 'F2') {
                e.preventDefault();
                handleCellEditStart(currentCellId);
            } else if (addr.column === 'proposedRent' && /^[0-9]$/.test(e.key)) {
                e.preventDefault();
                handleCellEditStart(currentCellId, e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                handleCellEditStart(currentCellId, '');
            }
        } else {
            // EDITING
            if (e.key === 'Enter') {
                if (addr.column !== 'proposedTerm') { // Dropdown handles its own Enter
                    e.preventDefault();
                    handleCellEditCommit(state.editingCellId, state.editingValue);
                    if (!isHardError(state.validationError)) {
                        const next = getNextCell(addr, renewals.length, 'forward');
                        if (next) {
                            const nextId = buildCellId(renewals[next.rowIndex].id, next.column);
                            dispatch({ type: 'FOCUS_CELL', cellId: nextId });
                            setTimeout(() => focusCellDOM(nextId), 0);
                        }
                    }
                }
            } else if (e.key === 'Tab') {
                // For term dropdown, it handles tab natively, but we need to intercept if we are at grid level?
                // Actually if a child inputs preventDefault it will stop. Let's just catch it.
                if (addr.column !== 'proposedTerm') {
                    e.preventDefault();
                    handleCellEditCommit(state.editingCellId, state.editingValue);
                    if (!isHardError(state.validationError)) {
                        const next = getNextCell(addr, renewals.length, e.shiftKey ? 'backward' : 'forward');
                        if (next) {
                            const nextId = buildCellId(renewals[next.rowIndex].id, next.column);
                            dispatch({ type: 'FOCUS_CELL', cellId: nextId });
                            setTimeout(() => focusCellDOM(nextId), 0);
                        }
                    }
                }
            } else if (e.key === 'Escape') {
                // If the dropdown doesn't catch it
                if (addr.column !== 'proposedTerm') {
                    e.preventDefault();
                    handleCellEditCancel();
                    setTimeout(() => focusCellDOM(currentCellId), 0);
                }
            }
        }

    }, [state.activeCellId, state.editingCellId, state.editingValue, state.validationError, renewals, handleCellEditStart, handleCellEditCommit, handleCellEditCancel]);

    const getCellState = useCallback((cellId: string) => {
        if (cellId === state.editingCellId) {
            return isHardError(state.validationError) ? 'error' : 'editing';
        }
        if (cellId === state.activeCellId) {
            return 'active';
        }
        return 'idle';
    }, [state.editingCellId, state.activeCellId, state.validationError]);

    return {
        activeCellId: state.activeCellId,
        editingCellId: state.editingCellId,
        editingValue: state.editingValue,
        validationError: state.validationError,
        handleCellFocus,
        handleCellEditStart,
        handleCellEditCommit,
        handleCellEditCancel,
        handleEditingValueChange,
        handleGridKeyDown,
        getCellState,
    };
}
