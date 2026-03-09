import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { PortfolioMTMRule } from './MTMRulesDrawer.types';
import type { LeaseRenewal } from '../../types';
import { PortfolioRuleCard } from './PortfolioRuleCard';

interface PortfolioRuleListProps {
    rules: PortfolioMTMRule[];
    renewals: LeaseRenewal[];
    onChange: (portfolioId: string, updates: Partial<PortfolioMTMRule>) => void;
}

export const PortfolioRuleList: React.FC<PortfolioRuleListProps> = ({ rules, renewals, onChange }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Portfolio Overrides</h3>
                    <span className="text-xs text-gray-400 ml-2">
                        {rules.filter(r => r.isEnabled).length} of {rules.length} active
                    </span>
                </div>
                <div className="group relative">
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                    <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-gray-900 text-white text-[11px] rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                        Portfolio rules override the global default for all renewals in that portfolio.
                    </div>
                </div>
            </div>

            {rules.map(rule => {
                const affectedCount = renewals.filter(r => r.property.portfolioId === rule.portfolioId).length;
                return (
                    <PortfolioRuleCard
                        key={rule.portfolioId}
                        rule={rule}
                        affectedCount={affectedCount}
                        onChange={(updates) => onChange(rule.portfolioId, updates)}
                        isExpanded={expandedId === rule.portfolioId}
                        onToggleExpand={() => setExpandedId(expandedId === rule.portfolioId ? null : rule.portfolioId)}
                    />
                );
            })}
        </div>
    );
};
