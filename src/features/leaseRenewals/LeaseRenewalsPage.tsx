import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FileText, Undo2, Redo2 } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { RenewalTabs } from './components/Tabs/RenewalTabs';
import { FilterBar } from './components/FilterBar/FilterBar';
import { GridToolbar } from './components/GridToolbar/GridToolbar';
import { RenewalGrid } from './components/RenewalGrid/RenewalGrid';
import { BulkActionToolbar } from './components/BulkActionToolbar/BulkActionToolbar';
import { BulkConfirmModal } from './components/BulkActionToolbar/BulkConfirmModal';
import { useBulkActions } from './hooks/useBulkActions';
import { useUndoStack } from './hooks/useUndoStack';
import { useEditableGrid } from './hooks/useEditableGrid';
import type {
    LeaseRenewal,
    RenewalFilters,
    RenewalSortState,
} from './types';
import { RenewalStatus } from './types';
import type { RenewalTab } from './components/Tabs/RenewalTabs.types';
import { MOCK_RENEWALS } from './mockData';
import { filterRenewals, sortRenewals } from './utils';

/**
 * Main dashboard container for the Lease Renewals feature.
 */
export const LeaseRenewalsPage: React.FC = () => {
    // 1. STATE
    const [activeTab, setActiveTab] = useState<RenewalTab>('active');
    const [renewals, setRenewals] = useState<LeaseRenewal[]>(MOCK_RENEWALS);
    const [filters, setFilters] = useState<RenewalFilters>({
        search: '',
        expiringWithin: 30,
    });
    const [sort, setSort] = useState<RenewalSortState>({
        column: 'leaseEndDate',
        direction: 'asc',
    });
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [toastMessage, setToastMessage] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

    // 2. BULK ACTIONS HOOK
    const {
        selectedRenewals,
        confirmVariant,
        confirmPayload,
        handleAction,
        handleConfirm,
        handleCancelConfirm,
    } = useBulkActions({
        renewals,
        selectedIds,
        onRenewalsChange: (updated) => setRenewals(updated),
        onSelectionChange: setSelectedIds,
    });

    // 3. DERIVED DATA
    const filteredRenewals = useMemo(() => {
        let data = filterRenewals(renewals, filters);

        // Tab-specific overrides
        if (activeTab === 'completed') {
            data = data.filter(r => [RenewalStatus.COMPLETED, RenewalStatus.SIGNED].includes(r.status));
        } else if (activeTab === 'active') {
            data = data.filter(r => ![RenewalStatus.COMPLETED, RenewalStatus.SIGNED].includes(r.status));
        }

        return data;
    }, [renewals, filters, activeTab]);

    const sortedRenewals = useMemo(() =>
        sortRenewals(filteredRenewals, sort), [filteredRenewals, sort]);

    const tabCounts = useMemo(() => ({
        active: renewals.filter(r =>
            ![RenewalStatus.COMPLETED, RenewalStatus.SIGNED].includes(r.status)
        ).length,
        pending_offers: renewals.filter(r =>
            r.status === RenewalStatus.OFFER_SENT
        ).length,
        completed: renewals.filter(r =>
            r.status === RenewalStatus.COMPLETED || r.status === RenewalStatus.SIGNED
        ).length,
    }), [renewals]);

    const portfolioOptions = useMemo(() => {
        const seen = new Set<string>();
        return renewals
            .filter(r => {
                if (seen.has(r.property.portfolioId)) return false;
                seen.add(r.property.portfolioId);
                return true;
            })
            .map(r => ({
                value: r.property.portfolioId,
                label: r.property.portfolioName
            }));
    }, [renewals]);

    // 4. HANDLERS
    const handleRenewalChange = useCallback((id: string, changes: Partial<LeaseRenewal>) => {
        setRenewals(prev => prev.map(r =>
            r.id === id ? { ...r, ...changes, isDirty: true } : r
        ));
    }, []);

    const undoStack = useUndoStack<Partial<LeaseRenewal> & { id: string }>(50);

    const editableGrid = useEditableGrid({
        renewals: sortedRenewals,
        onRenewalChange: handleRenewalChange,
        undoStack,
    });

    const showToast = useCallback((msg: string) => {
        setToastMessage({ message: msg, visible: true });
    }, []);

    useEffect(() => {
        if (toastMessage.visible) {
            const t = setTimeout(() => {
                setToastMessage(prev => ({ ...prev, visible: false }));
            }, 2000);
            return () => clearTimeout(t);
        }
    }, [toastMessage.visible]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (modifier && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) {
                    e.preventDefault();
                    if (undoStack.canRedo) {
                        const entry = undoStack.redo();
                        if (entry) {
                            handleRenewalChange(entry.next.id, entry.next);
                            showToast(`Redone: ${entry.label}`);
                        }
                    }
                } else {
                    e.preventDefault();
                    if (undoStack.canUndo) {
                        const entry = undoStack.undo();
                        if (entry) {
                            handleRenewalChange(entry.previous.id, entry.previous);
                            showToast(`Undone: ${entry.label}`);
                        }
                    }
                }
            } else if (modifier && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                if (undoStack.canRedo) {
                    const entry = undoStack.redo();
                    if (entry) {
                        handleRenewalChange(entry.next.id, entry.next);
                        showToast(`Redone: ${entry.label}`);
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [undoStack, handleRenewalChange, showToast]);

    const handleFiltersReset = () => {
        setFilters({ search: '', expiringWithin: 30 });
    };

    // 5. RENDERING
    return (
        <>
            <AppShell
                pageTitleBarProps={{
                    title: 'Lease Renewals',
                    primaryAction: {
                        label: 'Start Renewal Wave',
                        icon: 'plus',
                        onClick: () => console.log('Start Renewal Wave clicked'),
                    },
                    secondaryAction: {
                        icon: 'ellipsis-vertical',
                        onClick: () => console.log('More options clicked'),
                        ariaLabel: 'More options',
                    },
                }}
            >
                <div className="flex flex-col h-full bg-gray-50">
                    {/* Tab Strip */}
                    <RenewalTabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                        counts={tabCounts}
                    />

                    {/* Main Content Area */}
                    {(activeTab === 'active' || activeTab === 'completed') && (
                        <div className="flex flex-col flex-1 overflow-hidden">
                            <FilterBar
                                filters={filters}
                                onChange={setFilters}
                                onReset={handleFiltersReset}
                                onSaveView={() => console.log('Save view clicked')}
                                portfolioOptions={portfolioOptions}
                            />
                            <GridToolbar
                                totalCount={renewals.length}
                                filteredCount={sortedRenewals.length}
                                selectedCount={selectedIds.size}
                                onEditColumns={() => console.log('Edit columns clicked')}
                            />
                            <RenewalGrid
                                renewals={sortedRenewals}
                                sort={sort}
                                onSortChange={setSort}
                                selectedIds={selectedIds}
                                onSelectionChange={setSelectedIds}
                                editableGrid={editableGrid}
                            />
                        </div>
                    )}

                    {activeTab === 'pending_offers' && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-sm font-semibold text-gray-700">No pending offers</p>
                            <p className="text-xs text-gray-400 mt-1 max-w-[260px]">
                                Offers sent to tenants will appear here. Start by
                                selecting renewals from the Active tab.
                            </p>
                            <button
                                onClick={() => setActiveTab('active')}
                                className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors duration-150"
                            >
                                Go to Active Renewals →
                            </button>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="px-4 py-8 text-sm text-gray-400 text-center">
                            MTM rules and renewal settings coming in Prompt 1.8
                        </div>
                    )}
                </div>
            </AppShell>

            {/* Global Overlays */}
            <BulkActionToolbar
                selectedCount={selectedIds.size}
                selectedRenewals={selectedRenewals}
                onAction={handleAction}
                onClearSelection={() => setSelectedIds(new Set())}
            />

            {confirmVariant && (
                <BulkConfirmModal
                    variant={confirmVariant}
                    selectedCount={selectedRenewals.length}
                    payload={confirmPayload}
                    onConfirm={handleConfirm}
                    onCancel={handleCancelConfirm}
                />
            )}

            {/* Undo Indicator */}
            {(undoStack.historySize > 0 || undoStack.canRedo) && (
                <div className={`
                    fixed right-4 z-30 transition-all duration-300
                    bg-white border border-gray-200 rounded-[var(--radius-150)]
                    shadow-[var(--shadow-md)] flex items-center gap-1 p-1
                    ${selectedIds.size > 0 ? 'bottom-[72px]' : 'bottom-4'}
                `}>
                    <button
                        onClick={() => {
                            const entry = undoStack.undo();
                            if (entry) {
                                handleRenewalChange(entry.previous.id, entry.previous);
                                showToast(`Undone: ${entry.label}`);
                            }
                        }}
                        disabled={!undoStack.canUndo}
                        title={undoStack.lastUndoLabel ? `Undo: ${undoStack.lastUndoLabel}` : 'Undo'}
                        className={`
                            px-2 py-1.5 rounded-[var(--radius-075)] flex items-center gap-1.5 text-xs font-medium transition-colors duration-100
                            ${undoStack.canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}
                        `}
                    >
                        <Undo2 size={13} />
                        Undo
                        {undoStack.historySize > 0 && <span className="ml-1 text-[10px] text-gray-400">{undoStack.historySize} {undoStack.historySize === 1 ? 'change' : 'changes'}</span>}
                    </button>

                    <div className="w-px h-4 bg-gray-200" />

                    <button
                        onClick={() => {
                            const entry = undoStack.redo();
                            if (entry) {
                                handleRenewalChange(entry.next.id, entry.next);
                                showToast(`Redone: ${entry.label}`);
                            }
                        }}
                        disabled={!undoStack.canRedo}
                        title={undoStack.lastRedoLabel ? `Redo: ${undoStack.lastRedoLabel}` : 'Redo'}
                        className={`
                            px-2 py-1.5 rounded-[var(--radius-075)] flex items-center gap-1.5 text-xs font-medium transition-colors duration-100
                            ${undoStack.canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}
                        `}
                    >
                        <Redo2 size={13} />
                        Redo
                    </button>
                </div>
            )}

            {/* Toast */}
            <div className={`
                fixed bottom-12 left-1/2 -translate-x-1/2 z-50
                bg-gray-900 text-white text-xs font-medium
                px-3 py-2 rounded-[var(--radius-full)] shadow-[var(--shadow-lg)]
                pointer-events-none transition-all duration-150
                ${toastMessage.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
                {toastMessage.message}
            </div>
        </>
    );
};
