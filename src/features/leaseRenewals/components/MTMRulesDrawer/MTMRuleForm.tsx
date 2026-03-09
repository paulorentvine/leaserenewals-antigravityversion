import React, { useMemo } from 'react';
import { MTMPolicySelect } from './MTMPolicySelect';
import { MTMPolicy } from '../../types';
import type { MTMRuleFormState } from './MTMRulesDrawer.types';
import { ArrowRight, LogOut } from 'lucide-react';

interface MTMRuleFormProps {
    value: MTMRuleFormState;
    onChange: (updates: Partial<MTMRuleFormState>) => void;
    disabled?: boolean;
    showHeader?: boolean;
}

export const MTMRuleForm: React.FC<MTMRuleFormProps> = ({
    value,
    onChange,
    disabled = false,
    showHeader = false,
}) => {
    // Helper to compute deadline preview
    const exampleDeadlineDate = useMemo(() => {
        const d = new Date('2025-05-30T00:00:00Z');
        d.setDate(d.getDate() - value.deadlineDays);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }, [value.deadlineDays]);

    const exampleRent = 1850;
    const premiumAmount = exampleRent * (value.premiumPercent / 100);
    const newRent = exampleRent + premiumAmount;

    return (
        <div className={`space-y-5 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {showHeader && (
                <div className="text-sm font-semibold text-gray-900 mb-2">Rule Configuration</div>
            )}

            {/* Section 1: Policy */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month-to-Month Policy</label>
                <MTMPolicySelect
                    value={value.policy}
                    onChange={(policy) => onChange({ policy })}
                    disabled={disabled}
                />
            </div>

            {/* Section 2: Premium Percent */}
            <div className={`transition-all duration-200 ease-in-out overflow-hidden ${value.policy === MTMPolicy.PREMIUM ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Premium Fee</label>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="1" max="100" step="1"
                        disabled={disabled}
                        value={value.premiumPercent}
                        onChange={(e) => onChange({ premiumPercent: Number(e.target.value) || 0 })}
                        className="w-24 rounded-[var(--radius-100)] border border-gray-200 px-3 py-2 text-sm text-gray-900 text-right focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] outline-none"
                    />
                    <span className="text-sm text-gray-500">%</span>

                    <div className="ml-3 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs text-amber-800 font-medium">
                        e.g. ${exampleRent.toLocaleString()}/mo → ${newRent.toLocaleString()}/mo (+{value.premiumPercent}%)
                    </div>
                </div>
            </div>

            {/* Section 3: Non-Response Fallback */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">If tenant doesn't respond by deadline</label>
                <div className="flex bg-gray-100 p-1 rounded-[var(--radius-100)] w-fit">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange({ nonResponseFallback: 'mtm' })}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[var(--radius-075)] transition-all
                            ${value.nonResponseFallback === 'mtm' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <ArrowRight size={14} /> Go Month-to-Month
                    </button>
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange({ nonResponseFallback: 'non_renew' })}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-[var(--radius-075)] transition-all
                            ${value.nonResponseFallback === 'non_renew' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <LogOut size={14} /> Mark as Non-Renewing
                    </button>
                </div>
            </div>

            {/* Section 4: Deadline Days */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenant response deadline</label>
                <div className="text-xs text-gray-400 mb-2">Days before lease end the tenant must respond</div>
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min="14" max="120" step="1"
                        disabled={disabled}
                        value={value.deadlineDays}
                        onChange={(e) => onChange({ deadlineDays: Number(e.target.value) || 0 })}
                        className="flex-1 accent-[var(--color-brand)]"
                    />
                    <input
                        type="number"
                        min="14" max="120"
                        disabled={disabled}
                        value={value.deadlineDays}
                        onChange={(e) => onChange({ deadlineDays: Number(e.target.value) || 0 })}
                        className="w-16 text-center rounded-[var(--radius-100)] border border-gray-200 px-2 py-1.5 text-sm focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] outline-none"
                    />
                    <span className="text-sm text-gray-500">days</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    For a lease ending May 30: tenant must respond by {exampleDeadlineDate}
                </div>
            </div>
        </div>
    );
};
