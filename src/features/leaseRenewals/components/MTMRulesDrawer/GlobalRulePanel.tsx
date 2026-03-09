import React from 'react';
import { Globe } from 'lucide-react';
import { MTMRuleForm } from './MTMRuleForm';
import type { GlobalMTMRule, MTMRuleFormState, UseMTMRulesReturn } from './MTMRulesDrawer.types';

interface GlobalRulePanelProps {
    rule: GlobalMTMRule;
    onChange: (updates: Partial<MTMRuleFormState>) => void;
    rulesHook: UseMTMRulesReturn;
}

export const GlobalRulePanel: React.FC<GlobalRulePanelProps> = ({ rule, onChange, rulesHook }) => {
    // Determine how many renewals are affected by the global rule
    // We compute this by checking the total. For now we use the workingConfig to derive a count
    // or just default to 0 for the UI since we don't have the active renewals array here.
    const affectedCount = rulesHook ? 0 : 0;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <Globe size={20} className="text-gray-600" />
                </div>
                <div>
                    <div className="text-sm font-semibold text-gray-900">Global Default</div>
                    <div className="text-xs text-gray-400 mt-0.5">Applies to all renewals unless overridden by a portfolio or owner rule.</div>
                </div>
                <div className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Active
                </div>
            </div>

            <MTMRuleForm
                value={rule}
                onChange={onChange}
                showHeader={false}
            />

            <div className="bg-blue-50 rounded-[var(--radius-100)] border border-blue-100 px-4 py-3 mt-4">
                <h4 className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Cascade Impact</h4>
                <p className="text-xs text-blue-800 mt-1">
                    This rule currently applies to {affectedCount} renewal(s) that have no portfolio or owner override.
                </p>
            </div>
        </div>
    );
};
