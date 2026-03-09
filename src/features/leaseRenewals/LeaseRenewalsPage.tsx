import React, { useState, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { AppShell } from '@/components/shell/AppShell';
import { RenewalTabs } from './components/Tabs/RenewalTabs';
import { FilterBar } from './components/FilterBar/FilterBar';
import { GridToolbar } from './components/GridToolbar/GridToolbar';
import { RenewalGrid } from './components/RenewalGrid/RenewalGrid';
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
    const [editingCellId, setEditingCellId] = useState<string | null>(null);

    // 2. DERIVED DATA
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

    // 3. HANDLERS
    const handleRenewalChange = (id: string, changes: Partial<LeaseRenewal>) => {
        setRenewals(prev => prev.map(r =>
            r.id === id ? { ...r, ...changes, isDirty: true } : r
        ));
    };

    const handleFiltersReset = () => {
        setFilters({ search: '', expiringWithin: 30 });
    };

    // 4. RENDERING
    return (
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
                            editingCellId={editingCellId}
                            onCellEditStart={setEditingCellId}
                            onCellEditEnd={() => setEditingCellId(null)}
                            onRenewalChange={handleRenewalChange}
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
    );
};
