import React from 'react';
import { User, ChevronDown, GitBranch, X } from 'lucide-react';
import { MTMRuleForm } from './MTMRuleForm';
import type { OwnerMTMRule } from './MTMRulesDrawer.types';
import { MTMBadge } from '../RenewalGrid/MTMBadge';
import { Tooltip } from '../../../../components/ui/Tooltip';

interface OwnerRuleCardProps {
    rule: OwnerMTMRule;
    affectedCount: number;
    portfolioName: string;
    onChange: (updates: Partial<OwnerMTMRule>) => void;
    onRemove: () => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

export const OwnerRuleCard: React.FC<OwnerRuleCardProps> = ({
    rule,
    affectedCount,
    portfolioName,
    onChange,
    onRemove,
    isExpanded,
    onToggleExpand,
}) => {
    let wrapperClass = '';
    if (rule.isEnabled && isExpanded) {
        wrapperClass = 'border-[var(--color-brand)]/30 bg-white shadow-[var(--shadow-sm)]';
    } else if (rule.isEnabled && !isExpanded) {
        wrapperClass = 'border-gray-200 bg-white hover:border-gray-300';
    } else {
        wrapperClass = 'border-gray-100 bg-gray-50/50 opacity-60';
    }

    const toggleEnabled = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange({ isEnabled: !rule.isEnabled });
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove();
    };

    return (
        <div className={`rounded-[var(--radius-150)] border transition-all duration-150 ${wrapperClass}`}>
            <div
                onClick={onToggleExpand}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer"
            >
                <div className="w-8 h-8 rounded-[var(--radius-075)] bg-gray-100 flex items-center justify-center shrink-0">
                    <User size={16} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{rule.ownerName}</div>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        <MTMBadge policy={rule.policy} premiumPercent={rule.premiumPercent} />
                        <span className="text-[10px] text-gray-400 truncate">{rule.ownerEmail} • {portfolioName}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        role="switch"
                        aria-checked={rule.isEnabled}
                        aria-label={`${rule.isEnabled ? 'Disable' : 'Enable'} owner rule for ${rule.ownerName}`}
                        onClick={toggleEnabled}
                        className={`
                            relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] focus:ring-offset-1
                            ${rule.isEnabled ? 'bg-[var(--color-brand)]' : 'bg-gray-300'}
                        `}
                    >
                        <div className={`
                            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200
                            ${rule.isEnabled ? 'translate-x-4' : 'translate-x-0.5'}
                        `} />
                    </button>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />

                    <Tooltip content="Remove owner override">
                        <button
                            onClick={handleRemove}
                            className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                        >
                            <X size={12} />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 mt-0 pt-4">
                    {rule.isEnabled ? (
                        <>
                            <div className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
                                <GitBranch size={12} className="text-gray-300 shrink-0" />
                                Overrides portfolio and global defaults for this owner's {affectedCount} renewal{affectedCount !== 1 ? 's' : ''}
                            </div>
                            <MTMRuleForm
                                value={rule}
                                onChange={(updates) => onChange(updates)}
                                showHeader={false}
                            />
                        </>
                    ) : (
                        <div className="text-sm text-gray-400 py-4 text-center">
                            Owner override is disabled — portfolio or global default applies.
                            <br />
                            <button
                                onClick={() => onChange({ isEnabled: true })}
                                className="mt-2 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-hover)] transition-colors duration-150"
                            >
                                Enable Override
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
