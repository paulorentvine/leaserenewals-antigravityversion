import React, { useEffect, useState } from 'react';
import { Settings, AlertCircle, X, ShieldCheck, Save, Globe, Folders, Users, History } from 'lucide-react';
import type { MTMRulesDrawerProps } from './MTMRulesDrawer.types';
import { GlobalRulePanel } from './GlobalRulePanel';
import { PortfolioRuleList } from './PortfolioRuleList';
import { OwnerRuleList } from './OwnerRuleList';
import { MTMAuditLog } from './MTMAuditLog';

export const MTMRulesDrawer: React.FC<MTMRulesDrawerProps> = ({
    isOpen,
    onClose,
    rulesHook,
    portfolioOptions,
    ownerOptions,
}) => {
    const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

    // Reset confirm state when drawer opens/closes or dirty state changes
    useEffect(() => {
        if (!isOpen) setShowConfirmDiscard(false);
    }, [isOpen]);
    useEffect(() => {
        if (!rulesHook.isDirty) setShowConfirmDiscard(false);
    }, [rulesHook.isDirty]);

    const handleCloseClick = () => {
        if (rulesHook.isDirty) {
            setShowConfirmDiscard(true);
        } else {
            onClose();
        }
    };

    const handleConfirmDiscard = () => {
        rulesHook.discardChanges();
        setShowConfirmDiscard(false);
        onClose();
    };

    const handleCancelDiscard = () => {
        setShowConfirmDiscard(false);
    };

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                if (rulesHook.isDirty && !showConfirmDiscard) {
                    setShowConfirmDiscard(true);
                } else if (!showConfirmDiscard) {
                    onClose();
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, rulesHook.isDirty, showConfirmDiscard, onClose]);

    const tabs = [
        { id: 'global', label: 'Global Default', icon: Globe },
        { id: 'portfolios', label: 'Portfolios', icon: Folders },
        { id: 'owners', label: 'Owner Overrides', icon: Users },
        { id: 'audit', label: 'Audit Log', icon: History },
    ] as const;

    if (!isOpen && !rulesHook.isDirty) return null; // Wait for exit animation naturally if possible, or just unmount.

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => {
                    if (!showConfirmDiscard) handleCloseClick();
                }}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-label="MTM Rules Configuration"
                className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-[520px] bg-white shadow-[var(--shadow-xl)] flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* DRAWER HEADER */}
                <div className="h-[60px] px-6 border-b border-gray-100 flex items-center gap-3 shrink-0">
                    <div className="w-8 h-8 rounded-[var(--radius-075)] bg-gray-100 flex items-center justify-center">
                        <Settings size={16} className="text-gray-600" />
                    </div>
                    <div>
                        <div className="text-base font-semibold text-gray-900 leading-tight">MTM Rules</div>
                        <div className="text-xs text-gray-400 mt-0.5">Configure month-to-month policies</div>
                    </div>

                    {!showConfirmDiscard && rulesHook.isDirty && (
                        <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-[var(--radius-full)] px-2.5 py-1">
                            <AlertCircle size={12} /> Unsaved changes
                        </div>
                    )}

                    {!showConfirmDiscard ? (
                        <button
                            onClick={handleCloseClick}
                            aria-label="Close MTM Rules drawer"
                            className={`w-8 h-8 rounded-[var(--radius-075)] hover:bg-gray-100 flex items-center justify-center transition-colors ${rulesHook.isDirty ? 'ml-2' : 'ml-auto'}`}
                        >
                            <X size={16} className="text-gray-400" />
                        </button>
                    ) : (
                        <div className="ml-auto flex items-center gap-2 bg-white pl-2">
                            <span className="text-sm font-medium text-gray-900">Discard changes?</span>
                            <button
                                onClick={handleConfirmDiscard}
                                className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 rounded-[var(--radius-075)] transition-colors"
                            >
                                Discard
                            </button>
                            <button
                                onClick={handleCancelDiscard}
                                className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-[var(--radius-075)] transition-colors"
                            >
                                Keep editing
                            </button>
                        </div>
                    )}
                </div>

                {/* SECTION NAV */}
                <div className="px-6 pt-4 pb-0 shrink-0">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-2">
                        {tabs.map(tab => {
                            const isActive = rulesHook.activeSection === tab.id;
                            const isOwners = tab.id === 'owners';
                            const overrideCount = rulesHook.config.owners.length;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => rulesHook.setActiveSection(tab.id as any)}
                                    className={`
                                        px-3 py-1.5 rounded-[var(--radius-full)] text-sm whitespace-nowrap transition-colors duration-150 flex items-center shrink-0
                                        ${isActive ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                                    `}
                                >
                                    <tab.icon size={13} className="mr-1.5" />
                                    {tab.label}
                                    {isOwners && overrideCount > 0 && (
                                        <span className={`ml-1 px-1.5 py-px rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                            {overrideCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className="border-b border-gray-100 mt-1" />
                </div>

                {/* SECTION CONTENT */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="transition-opacity duration-150 relative">
                        {rulesHook.activeSection === 'global' && (
                            <GlobalRulePanel
                                rule={rulesHook.config.global}
                                onChange={rulesHook.updateGlobalRule}
                                rulesHook={rulesHook}
                            />
                        )}
                        {rulesHook.activeSection === 'portfolios' && (
                            <PortfolioRuleList
                                rules={rulesHook.config.portfolios}
                                onChange={rulesHook.updatePortfolioRule}
                                renewals={[]} // Pass active renewals if needed
                            />
                        )}
                        {rulesHook.activeSection === 'owners' && (
                            <OwnerRuleList
                                rules={rulesHook.config.owners}
                                onAdd={rulesHook.addOwnerOverride}
                                onChange={rulesHook.updateOwnerRule}
                                onRemove={rulesHook.removeOwnerOverride}
                                ownerOptions={ownerOptions}
                                portfolioOptions={portfolioOptions}
                                renewals={[]} // Pass active renewals if needed
                            />
                        )}
                        {rulesHook.activeSection === 'audit' && (
                            <MTMAuditLog entries={rulesHook.fullAuditLog} />
                        )}
                    </div>
                </div>

                {/* DRAWER FOOTER */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3 shrink-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center text-xs text-gray-500 truncate">
                            <ShieldCheck size={12} className="text-gray-400 mr-1.5 shrink-0" />
                            Rules cascade: Owner → Portfolio → Global
                        </div>
                        {rulesHook.isDirty && (
                            <div className="text-xs text-amber-700 mt-1 truncate">
                                Saving will update MTM policy on affected renewals
                            </div>
                        )}
                    </div>

                    {rulesHook.isDirty && (
                        <button
                            onClick={rulesHook.discardChanges}
                            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-[var(--radius-100)] px-3 py-2 transition-colors duration-150"
                        >
                            Discard
                        </button>
                    )}

                    <button
                        disabled={!rulesHook.isDirty}
                        onClick={rulesHook.saveConfig}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-[var(--radius-100)] transition-colors duration-150 flex items-center gap-1.5
                            ${rulesHook.isDirty ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                        `}
                    >
                        {rulesHook.isDirty && <Save size={14} />}
                        {rulesHook.isDirty ? 'Save Rules' : 'No Changes'}
                    </button>
                </div>
            </div>
        </>
    );
};
