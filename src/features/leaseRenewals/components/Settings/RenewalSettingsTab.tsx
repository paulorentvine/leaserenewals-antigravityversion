import React from 'react';
import { GitBranch, Settings, Globe, Folders, Users, Clock, Mail } from 'lucide-react';
import type { UseMTMRulesReturn } from '../MTMRulesDrawer/MTMRulesDrawer.types';
import { MTMBadge } from '../RenewalGrid/MTMBadge';

interface RenewalSettingsTabProps {
    onOpenMTMDrawer: () => void;
    rulesHook: UseMTMRulesReturn;
};

export const RenewalSettingsTab: React.FC<RenewalSettingsTabProps> = ({ onOpenMTMDrawer, rulesHook }) => {
    return (
        <div className="px-4 py-6 max-w-[720px] mx-auto space-y-6">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Renewal Settings</h1>
                <p className="text-sm text-gray-400 mt-1">Configure global behavior for lease renewals</p>
            </div>

            {/* SECTION 1: MTM RULES */}
            <div className="rounded-[var(--radius-150)] border border-gray-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center">
                    <div className="w-8 h-8 rounded-[var(--radius-075)] bg-gray-100 flex items-center justify-center shrink-0">
                        <GitBranch size={16} className="text-gray-600" />
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">Month-to-Month Rules</div>
                        <div className="text-xs text-gray-400">Cascade: Owner → Portfolio → Global</div>
                    </div>
                    <button
                        onClick={onOpenMTMDrawer}
                        className="ml-auto flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-medium px-3 py-2 rounded-[var(--radius-100)] transition-colors"
                    >
                        <Settings size={14} /> Configure
                    </button>
                </div>

                <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
                        <div className="flex items-center text-sm text-gray-700">
                            <Globe size={14} className="text-gray-400 mr-2" /> Global Default
                        </div>
                        <MTMBadge policy={rulesHook.config.global.policy} premiumPercent={rulesHook.config.global.premiumPercent} />
                    </div>

                    {rulesHook.config.portfolios.map(p => (
                        <div key={p.portfolioId} className="flex items-center justify-between py-2.5 border-b border-gray-50">
                            <div className="flex items-center text-sm text-gray-700">
                                <Folders size={14} className="text-gray-400 mr-2" /> {p.portfolioName}
                            </div>
                            <div className="flex items-center gap-4">
                                {p.isEnabled ? (
                                    <div className="flex items-center gap-1.5 text-xs text-green-700 whitespace-nowrap">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Override active
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400">Using global</div>
                                )}
                                {p.isEnabled && (
                                    <MTMBadge policy={p.policy} premiumPercent={p.premiumPercent} />
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center justify-between py-2.5">
                        <div className="flex items-center text-sm text-gray-700">
                            <Users size={14} className="text-gray-400 mr-2" /> Owner Overrides
                        </div>
                        <div className="text-xs text-gray-500">
                            {rulesHook.config.owners.length > 0
                                ? `${rulesHook.config.owners.length} owner rule${rulesHook.config.owners.length !== 1 ? 's' : ''} configured`
                                : "None configured"}
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: RENEWAL TRIGGERS */}
            <div className="rounded-[var(--radius-150)] border border-gray-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center">
                    <div className="w-8 h-8 rounded-[var(--radius-075)] bg-gray-100 flex items-center justify-center shrink-0">
                        <Clock size={16} className="text-gray-600" />
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">Renewal Triggers</div>
                        <div className="text-xs text-gray-400">Configure when renewal workflows are initiated</div>
                    </div>
                </div>
                <div className="m-5 bg-gray-50 rounded-[var(--radius-100)] px-4 py-8 text-center border border-dashed border-gray-200">
                    <Clock size={24} className="text-gray-300 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-500">Coming soon</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-[300px] mx-auto">
                        Configurable renewal triggers (fixed date, X days before expiry, academic cycle) will be available in a future update.
                    </div>
                </div>
            </div>

            {/* SECTION 3: EMAIL TEMPLATES */}
            <div className="rounded-[var(--radius-150)] border border-gray-200 bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center">
                    <div className="w-8 h-8 rounded-[var(--radius-075)] bg-gray-100 flex items-center justify-center shrink-0">
                        <Mail size={16} className="text-gray-600" />
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-semibold text-gray-900">Email Templates</div>
                        <div className="text-xs text-gray-400">Customize owner and tenant communication templates</div>
                    </div>
                </div>
                <div className="m-5 bg-gray-50 rounded-[var(--radius-100)] px-4 py-8 text-center border border-dashed border-gray-200">
                    <Mail size={24} className="text-gray-300 mx-auto mb-2" />
                    <div className="text-sm font-medium text-gray-500">Coming soon</div>
                    <div className="text-xs text-gray-400 mt-1 max-w-[300px] mx-auto">
                        Email template configuration coming in a future update.
                    </div>
                </div>
            </div>
        </div>
    );
};
