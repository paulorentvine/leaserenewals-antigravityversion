import React from 'react';
import { Search, X, Plus, RotateCcw, Save } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import type { FilterBarProps } from './FilterBar.types';
import { RENEWAL_STATUS_CONFIG } from '../../constants';

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    onChange,
    onReset,
    onSaveView,
    portfolioOptions
}) => {
    const isDirty = filters.search !== '' ||
        filters.portfolioId !== undefined ||
        filters.status !== undefined ||
        filters.expiringWithin !== 30;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...filters, search: e.target.value });
    };

    const handleClearSearch = () => {
        onChange({ ...filters, search: '' });
    };

    const statusOptions = Object.entries(RENEWAL_STATUS_CONFIG).map(([key, config]) => ({
        value: key,
        label: config.label
    }));

    const expiringOptions = [
        { value: '30', label: 'Next 30 days' },
        { value: '60', label: 'Next 60 days' },
        { value: '90', label: 'Next 90 days' },
        { value: 'custom', label: 'Custom range...' },
    ];

    const activeFilters = [];
    if (filters.portfolioId) {
        const opt = portfolioOptions.find(o => o.value === filters.portfolioId);
        if (opt) activeFilters.push({ key: 'portfolioId', label: `Portfolio: ${opt.label}` });
    }
    if (filters.status) {
        const opt = statusOptions.find(o => o.value === filters.status);
        if (opt) activeFilters.push({ key: 'status', label: `Status: ${opt.label}` });
    }
    if (filters.expiringWithin && filters.expiringWithin !== 30) {
        const opt = expiringOptions.find(o => o.value === String(filters.expiringWithin));
        if (opt) activeFilters.push({ key: 'expiringWithin', label: `Expiring: ${opt.label}` });
    }

    return (
        <div className="bg-white border-b border-gray-100 flex flex-col">
            {/* Main Row */}
            <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                {/* Search */}
                <div className="relative flex items-center w-full sm:w-auto sm:min-w-[280px] group">
                    <Search size={14} className="absolute left-2.5 text-neutral-muted group-focus-within:text-brand transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by unit, tenant, or address..."
                        value={filters.search}
                        onChange={handleSearchChange}
                        className="w-full rounded-[var(--radius-100)] border border-gray-200 bg-white pl-8 pr-8 py-1.5 text-sm text-neutral outline-none focus:ring-2 focus:ring-brand focus:ring-opacity-20 focus:border-brand transition-all"
                    />
                    {filters.search && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-2.5 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={12} className="text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                </div>

                {/* Portfolio Dropdown */}
                <FilterDropdown
                    label="Portfolio"
                    options={portfolioOptions}
                    value={filters.portfolioId}
                    onChange={(val) => onChange({ ...filters, portfolioId: val as string })}
                    clearable
                />

                {/* Expiring Dropdown */}
                <FilterDropdown
                    label="Expiring"
                    icon="calendar-clock"
                    options={expiringOptions}
                    value={String(filters.expiringWithin)}
                    onChange={(val) => {
                        if (val === 'custom') {
                            onChange({ ...filters, expiringWithin: 'custom' });
                        } else if (val) {
                            onChange({ ...filters, expiringWithin: Number(val) as 30 | 60 | 90 });
                        } else {
                            onChange({ ...filters, expiringWithin: 30 });
                        }
                    }}
                />

                {/* Status Dropdown */}
                <FilterDropdown
                    label="Status"
                    options={statusOptions}
                    value={filters.status}
                    onChange={(val) => onChange({ ...filters, status: val as any })}
                    clearable
                />

                {/* Add Filter Placeholder */}
                <button
                    onClick={() => console.log('Add filter clicked')}
                    className="flex items-center gap-1.5 rounded-[var(--radius-100)] border border-dashed border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
                >
                    <Plus size={14} />
                    <span>Add Filter</span>
                </button>

                {/* Right Controls */}
                <div className="ml-auto flex items-center gap-3">
                    {isDirty && (
                        <button
                            onClick={onReset}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-150 outline-none focus-visible:underline"
                        >
                            <RotateCcw size={14} />
                            <span>Reset Filters</span>
                        </button>
                    )}
                    <button
                        onClick={onSaveView}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-150 outline-none focus-visible:underline"
                    >
                        <Save size={14} />
                        <span>Save View</span>
                    </button>
                </div>
            </div>

            {/* Active Filter Pills Row */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pb-3">
                    {activeFilters.map(filter => (
                        <div
                            key={filter.key}
                            className="flex items-center gap-1 bg-gray-100 rounded-[var(--radius-full)] px-2.5 py-1 text-xs font-medium text-gray-700"
                        >
                            <span>{filter.label}</span>
                            <button
                                onClick={() => {
                                    const newFilters = { ...filters };
                                    if (filter.key === 'portfolioId') delete newFilters.portfolioId;
                                    if (filter.key === 'status') delete newFilters.status;
                                    if (filter.key === 'expiringWithin') newFilters.expiringWithin = 30;
                                    onChange(newFilters);
                                }}
                                className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={10} className="text-gray-400 hover:text-gray-600" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Custom Range Panel (Simulated placeholder for now as per prompt) */}
            {String(filters.expiringWithin) === 'custom' && (
                <div className="px-4 pb-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-400 uppercase font-semibold">From</label>
                        <input
                            type="date"
                            className="text-xs border border-gray-200 rounded p-1 outline-none focus:border-[var(--color-brand)]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-400 uppercase font-semibold">To</label>
                        <input
                            type="date"
                            className="text-xs border border-gray-200 rounded p-1 outline-none focus:border-[var(--color-brand)]"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
