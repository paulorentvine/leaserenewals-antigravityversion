import { useReducer, useCallback } from 'react';

export interface UndoEntry<T> {
    previous: T;
    next: T;
    label: string;
    timestamp: number;
    groupId?: string;
}

export interface UndoStackState<T> {
    past: UndoEntry<T>[];
    future: UndoEntry<T>[];
}

export interface UseUndoStackReturn<T> {
    canUndo: boolean;
    canRedo: boolean;
    lastUndoLabel: string | undefined;
    lastRedoLabel: string | undefined;
    push: (entry: UndoEntry<T>) => void;
    undo: () => UndoEntry<T> | undefined;
    redo: () => UndoEntry<T> | undefined;
    clear: () => void;
    historySize: number;
}

type Action<T> =
    | { type: 'PUSH'; payload: UndoEntry<T>; maxHistory: number }
    | { type: 'UNDO' }
    | { type: 'REDO' }
    | { type: 'CLEAR' };

function undoReducer<T>(state: UndoStackState<T>, action: Action<T>): UndoStackState<T> {
    switch (action.type) {
        case 'PUSH': {
            const newPast = [...state.past, action.payload];
            if (newPast.length > action.maxHistory) {
                newPast.shift();
            }
            return {
                past: newPast,
                future: [],
            };
        }
        case 'UNDO': {
            if (state.past.length === 0) return state;
            return {
                past: state.past.slice(0, state.past.length - 1),
                future: [state.past[state.past.length - 1], ...state.future],
            };
        }
        case 'REDO': {
            if (state.future.length === 0) return state;
            return {
                past: [...state.past, state.future[0]],
                future: state.future.slice(1),
            };
        }
        case 'CLEAR':
            return { past: [], future: [] };
        default:
            return state;
    }
}

export function useUndoStack<T>(maxHistory = 50): UseUndoStackReturn<T> {
    const [state, dispatch] = useReducer(undoReducer<T>, { past: [], future: [] });

    const push = useCallback((entry: UndoEntry<T>) => {
        dispatch({ type: 'PUSH', payload: entry, maxHistory });
    }, [maxHistory]);

    const undo = useCallback(() => {
        if (state.past.length === 0) return undefined;
        const entry = state.past[state.past.length - 1];
        dispatch({ type: 'UNDO' });
        return entry;
    }, [state.past]);

    const redo = useCallback(() => {
        if (state.future.length === 0) return undefined;
        const entry = state.future[0];
        dispatch({ type: 'REDO' });
        return entry;
    }, [state.future]);

    const clear = useCallback(() => {
        dispatch({ type: 'CLEAR' });
    }, []);

    return {
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        lastUndoLabel: state.past.length > 0 ? state.past[state.past.length - 1].label : undefined,
        lastRedoLabel: state.future.length > 0 ? state.future[0].label : undefined,
        push,
        undo,
        redo,
        clear,
        historySize: state.past.length,
    };
}
