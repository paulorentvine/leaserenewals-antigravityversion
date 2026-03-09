import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { FileText, Undo2, Redo2, WifiOff, RefreshCw } from 'lucide-react';
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
import { useChargeGuardrails } from './hooks/useChargeGuardrails';
import { ChargeGuardrailsModal } from './components/ChargeGuardrailsModal/ChargeGuardrailsModal';
import { useMTMRules } from './hooks/useMTMRules';
import { MTMRulesDrawer } from './components/MTMRulesDrawer/MTMRulesDrawer';
import { RenewalSettingsTab } from './components/Settings/RenewalSettingsTab';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { FilterBarSkeleton } from './components/FilterBar/FilterBarSkeleton';
import { RenewalGridSkeleton } from './components/RenewalGrid/RenewalGridSkeleton';
import { Toast } from '../../components/ui/Toast';
import { Tooltip } from '../../components/ui/Tooltip';
import type {
    LeaseRenewal,
    RenewalFilters,
    RenewalSortState,
} from './types';
import { RenewalStatus } from './types';
import type { RenewalTab } from './components/Tabs/RenewalTabs.types';
import { MOCK_RENEWALS } from './mockData';
import { filterRenewals, sortRenewals, formatCurrency } from './utils';

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
    const [mtmDrawerOpen, setMtmDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [liveAnnouncement, setLiveAnnouncement] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            const SIMULATE_ERROR = false;
            if (SIMULATE_ERROR) {
                setLoadError('Failed to load renewals. Please try again.');
            }
            setIsLoading(false);
            setLiveAnnouncement(!SIMULATE_ERROR ? `${MOCK_RENEWALS.length} renewals loaded.` : 'Failed to load renewals.');
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!liveAnnouncement) return;
        const t = setTimeout(() => setLiveAnnouncement(''), 3000);
        return () => clearTimeout(t);
    }, [liveAnnouncement]);

    // 2. RULES HOOKS
    const mtmRules = useMTMRules();

    // 3. BULK ACTIONS HOOK
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
        onBeforeBulkRentChange: (items) => {
            chargeGuardrails.triggerBulkGuardrail(items);
            return false; // block direct apply
        }
    });

    // 4. DERIVED DATA
    const ownerOptions = useMemo(() => {
        const seen = new Set<string>();
        return renewals
            .filter(r => {
                if (seen.has(r.owner.id)) return false;
                seen.add(r.owner.id);
                return true;
            })
            .map(r => ({
                value: r.owner.id,
                label: `${r.owner.firstName} ${r.owner.lastName}`,
                email: r.owner.email,
                portfolioId: r.property.portfolioId,
            }));
    }, [renewals]);

    const renewalsWithResolvedMTM = useMemo(() =>
        renewals.map(r => {
            const resolved = mtmRules.resolveRuleForRenewal(
                r.property.portfolioId,
                r.owner.id
            );
            return {
                ...r,
                mtmPolicy: resolved.policy,
                mtmPremiumPercent: resolved.premiumPercent,
            };
        }),
        [renewals, mtmRules.config, mtmRules.resolveRuleForRenewal]);

    const filteredRenewals = useMemo(() => {
        let data = filterRenewals(renewalsWithResolvedMTM, filters);

        // Tab-specific overrides
        if (activeTab === 'completed') {
            data = data.filter(r => [RenewalStatus.COMPLETED, RenewalStatus.SIGNED].includes(r.status));
        } else if (activeTab === 'active') {
            data = data.filter(r => ![RenewalStatus.COMPLETED, RenewalStatus.SIGNED].includes(r.status));
        }

        return data;
    }, [renewalsWithResolvedMTM, filters, activeTab]);

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
    }, [renewalsWithResolvedMTM]);

    // 5. HANDLERS
    const handleRenewalChange = useCallback((id: string, changes: Partial<LeaseRenewal>) => {
        setRenewals(prev => prev.map(r =>
            r.id === id ? { ...r, ...changes, isDirty: true } : r
        ));
    }, []);

    const undoStack = useUndoStack<Partial<LeaseRenewal> & { id: string }>(50);

    const chargeGuardrails = useChargeGuardrails({
        renewals,
        onRenewalsConfirmed: (updates) => {
            setRenewals(prev => prev.map(r => {
                const update = updates.find(u => u.id === r.id);
                return update ? { ...r, ...update } : r;
            }));

            updates.forEach(update => {
                const renewal = renewals.find(r => r.id === update.id);
                if (!renewal) return;
                undoStack.push({
                    previous: {
                        id: update.id,
                        proposedRent: renewal.proposedRent,
                        isDirty: renewal.isDirty,
                    },
                    next: {
                        id: update.id,
                        proposedRent: update.proposedRent,
                        isDirty: true,
                    },
                    label: `Rent changed: ${formatCurrency(renewal.proposedRent)} → ${formatCurrency(update.proposedRent)}`,
                    timestamp: Date.now(),
                });
            });
        },
        onRenewalsReverted: (reverts) => {
            setRenewals(prev => prev.map(r => {
                const revert = reverts.find(rv => rv.id === r.id);
                return revert ? { ...r, proposedRent: revert.proposedRent } : r;
            }));
        },
    });

    const editableGrid = useEditableGrid({
        renewals: sortedRenewals,
        onRenewalChange: handleRenewalChange,
        undoStack,
        onChargeGuardrailNeeded: chargeGuardrails.triggerGuardrail,
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
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="sr-only"
            >
                {liveAnnouncement}
            </div>

            <a
                href="#renewal-grid"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-white focus:border focus:border-gray-200 focus:rounded-[var(--radius-100)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-gray-900 focus:shadow-[var(--shadow-md)]"
            >
                Skip to renewal grid
            </a>

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
                        <div id="renewal-grid" className="flex flex-col flex-1 overflow-hidden">
                            {isLoading ? (
                                <>
                                    <FilterBarSkeleton />
                                    <RenewalGridSkeleton rows={8} />
                                </>
                            ) : loadError ? (
                                <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                                    <div className="w-14 h-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4">
                                        <WifiOff size={24} className="text-red-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700">
                                        Failed to load renewals
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-[260px]">
                                        {loadError}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setLoadError(null);
                                            setIsLoading(true);
                                            setTimeout(() => {
                                                setIsLoading(false);
                                                setLiveAnnouncement(`${MOCK_RENEWALS.length} renewals loaded.`);
                                            }, 800);
                                        }}
                                        className="mt-4 flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-[var(--radius-100)] px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150"
                                    >
                                        <RefreshCw size={13} /> Try again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <ErrorBoundary resetKey="filterbar">
                                        <FilterBar
                                            filters={filters}
                                            onChange={setFilters}
                                            onReset={handleFiltersReset}
                                            onSaveView={() => console.log('Save view clicked')}
                                            portfolioOptions={portfolioOptions}
                                        />
                                    </ErrorBoundary>
                                    <GridToolbar
                                        totalCount={renewals.length}
                                        filteredCount={sortedRenewals.length}
                                        selectedCount={selectedIds.size}
                                        onEditColumns={() => console.log('Edit columns clicked')}
                                    />
                                    <ErrorBoundary
                                        resetKey={activeTab}
                                        onError={(e) => console.error('RenewalGrid error:', e)}
                                    >
                                        <RenewalGrid
                                            renewals={sortedRenewals}
                                            sort={sort}
                                            onSortChange={setSort}
                                            selectedIds={selectedIds}
                                            onSelectionChange={setSelectedIds}
                                            editableGrid={editableGrid}
                                            totalCount={renewals.length}
                                            hasActiveFilters={filters.search !== '' || filters.expiringWithin !== 30}
                                            onClearFilters={handleFiltersReset}
                                        />
                                    </ErrorBoundary>
                                </>
                            )}
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
                        <RenewalSettingsTab
                            onOpenMTMDrawer={() => setMtmDrawerOpen(true)}
                            rulesHook={mtmRules}
                        />
                    )}
                </div>
            </AppShell>

            {/* Global Overlays */}
            <ErrorBoundary resetKey="bulk-toolbar">
                <BulkActionToolbar
                    selectedCount={selectedIds.size}
                    selectedRenewals={selectedRenewals}
                    onAction={handleAction}
                    onClearSelection={() => setSelectedIds(new Set())}
                />
            </ErrorBoundary>

            {confirmVariant && (
                <ErrorBoundary resetKey="bulk-toolbar">
                    <BulkConfirmModal
                        variant={confirmVariant}
                        selectedCount={selectedRenewals.length}
                        payload={confirmPayload}
                        onConfirm={handleConfirm}
                        onCancel={handleCancelConfirm}
                    />
                </ErrorBoundary>
            )}

            {chargeGuardrails.pendingPayload && (
                <ErrorBoundary resetKey="guardrails">
                    <ChargeGuardrailsModal
                        payload={chargeGuardrails.pendingPayload}
                        onConfirm={chargeGuardrails.confirmGuardrail}
                        onCancel={chargeGuardrails.cancelGuardrail}
                    />
                </ErrorBoundary>
            )}

            {/* Undo Indicator */}
            {(undoStack.historySize > 0 || undoStack.canRedo) && (
                <div className={`
                    fixed right-4 z-30 transition-all duration-300
                    bg-white border border-gray-200 rounded-[var(--radius-150)]
                    shadow-[var(--shadow-md)] flex items-center gap-1 p-1
                    ${selectedIds.size > 0 ? 'bottom-[72px]' : 'bottom-4'}
                `}>
                    <Tooltip content={undoStack.lastUndoLabel ? `Undo: ${undoStack.lastUndoLabel}` : 'Undo'}>
                        <button
                            onClick={() => {
                                const entry = undoStack.undo();
                                if (entry) {
                                    handleRenewalChange(entry.previous.id, entry.previous);
                                    showToast(`Undone: ${entry.label}`);
                                }
                            }}
                            disabled={!undoStack.canUndo}
                            className={`
                                px-2 py-1.5 rounded-[var(--radius-075)] flex items-center gap-1.5 text-xs font-medium transition-colors duration-100
                                ${undoStack.canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}
                            `}
                        >
                            <Undo2 size={13} />
                            Undo
                            {undoStack.historySize > 0 && <span className="ml-1 text-[10px] text-gray-400">{undoStack.historySize} {undoStack.historySize === 1 ? 'change' : 'changes'}</span>}
                        </button>
                    </Tooltip>

                    <div className="w-px h-4 bg-gray-200" />

                    <Tooltip content={undoStack.lastRedoLabel ? `Redo: ${undoStack.lastRedoLabel}` : 'Redo'}>
                        <button
                            onClick={() => {
                                const entry = undoStack.redo();
                                if (entry) {
                                    handleRenewalChange(entry.next.id, entry.next);
                                    showToast(`Redone: ${entry.label}`);
                                }
                            }}
                            disabled={!undoStack.canRedo}
                            className={`
                                px-2 py-1.5 rounded-[var(--radius-075)] flex items-center gap-1.5 text-xs font-medium transition-colors duration-100
                                ${undoStack.canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'}
                            `}
                        >
                            <Redo2 size={13} />
                            Redo
                        </button>
                    </Tooltip>
                </div>
            )}

            {/* Toast */}
            <Toast
                message={toastMessage.message}
                visible={toastMessage.visible}
                onClose={() => setToastMessage({ message: '', visible: false })}
            />

            <ErrorBoundary resetKey="mtm-drawer">
                <MTMRulesDrawer
                    isOpen={mtmDrawerOpen}
                    onClose={() => setMtmDrawerOpen(false)}
                    rulesHook={mtmRules}
                    portfolioOptions={portfolioOptions}
                    ownerOptions={ownerOptions}
                />
            </ErrorBoundary>
        </>
    );
};
