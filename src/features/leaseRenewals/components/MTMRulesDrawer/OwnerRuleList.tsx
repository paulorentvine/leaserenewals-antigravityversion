import React, { useState } from 'react';
import { UserPlus, Search, User, Plus } from 'lucide-react';
import type { MTMRulesDrawerProps, OwnerMTMRule } from './MTMRulesDrawer.types';
import type { LeaseRenewal } from '../../types';
import { OwnerRuleCard } from './OwnerRuleCard';

interface OwnerRuleListProps {
    rules: OwnerMTMRule[];
    renewals: LeaseRenewal[];
    ownerOptions: MTMRulesDrawerProps['ownerOptions'];
    portfolioOptions: MTMRulesDrawerProps['portfolioOptions'];
    onAdd: (ownerId: string, data: { name: string; email: string; portfolioId: string }) => void;
    onChange: (ownerId: string, updates: Partial<OwnerMTMRule>) => void;
    onRemove: (ownerId: string) => void;
}

export const OwnerRuleList: React.FC<OwnerRuleListProps> = ({
    rules,
    renewals,
    ownerOptions,
    portfolioOptions,
    onAdd,
    onChange,
    onRemove,
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const assignedOwnerIds = new Set(rules.map(r => r.ownerId));

    const filteredOptions = ownerOptions.filter(opt => {
        if (assignedOwnerIds.has(opt.value)) return false;
        const q = searchQuery.toLowerCase();
        return opt.label.toLowerCase().includes(q) || opt.email.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Owner Overrides</h3>
                    <span className="text-xs text-gray-400 ml-2">
                        {rules.length} override{rules.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <button
                    onClick={() => {
                        setShowAddPanel(!showAddPanel);
                        setSearchQuery('');
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
                >
                    <UserPlus size={14} /> Add Override
                </button>
            </div>

            {showAddPanel && (
                <div className="bg-gray-50 rounded-[var(--radius-100)] border border-gray-200 p-3 mb-3 animate-in slide-in-from-top-2 duration-150">
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search owners..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full rounded-[var(--radius-075)] border border-gray-200 bg-white pl-8 pr-3 py-2 text-sm focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] outline-none"
                        />
                    </div>

                    <div className="max-h-[160px] overflow-y-auto mt-2 space-y-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    onClick={() => {
                                        onAdd(opt.value, { name: opt.label, email: opt.email, portfolioId: opt.portfolioId });
                                        setShowAddPanel(false);
                                        setExpandedId(opt.value);
                                    }}
                                    className="px-3 py-2 rounded-[var(--radius-075)] cursor-pointer flex items-center justify-between hover:bg-white hover:shadow-[var(--shadow-sm)] transition-all duration-100"
                                >
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                                        <div className="text-xs text-gray-400">{opt.email}</div>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-px rounded truncate max-w-[100px]">
                                            {portfolioOptions.find(p => p.value === opt.portfolioId)?.label || 'Unknown'}
                                        </span>
                                        <Plus size={14} className="text-[var(--color-brand)] ml-2" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-gray-400 text-center py-3">
                                {ownerOptions.length === rules.length ? "All owners already have overrides." : "No owners found matching search."}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {rules.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                    <User size={32} className="text-gray-200 mx-auto" />
                    <div className="text-sm font-medium text-gray-500">No owner overrides</div>
                    <div className="text-xs text-gray-400">Owner rules take highest priority in the cascade.</div>
                </div>
            ) : (
                rules.map(rule => {
                    const affectedCount = renewals.filter(r => r.owner.id === rule.ownerId).length;
                    const portfolioName = portfolioOptions.find(p => p.value === rule.portfolioId)?.label || 'Unknown Portfolio';
                    return (
                        <OwnerRuleCard
                            key={rule.ownerId}
                            rule={rule}
                            affectedCount={affectedCount}
                            portfolioName={portfolioName}
                            onChange={(updates) => onChange(rule.ownerId, updates)}
                            onRemove={() => onRemove(rule.ownerId)}
                            isExpanded={expandedId === rule.ownerId}
                            onToggleExpand={() => setExpandedId(expandedId === rule.ownerId ? null : rule.ownerId)}
                        />
                    );
                })
            )}
        </div>
    );
};
