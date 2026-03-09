import { MTMPolicy } from '../../types';
import type { MTMAuditEntry } from '../../types';

export interface MTMRuleFormState {
    policy: MTMPolicy;
    premiumPercent: number;
    nonResponseFallback: 'mtm' | 'non_renew';
    deadlineDays: number;
}

export const DEFAULT_RULE_FORM: MTMRuleFormState = {
    policy: MTMPolicy.ALLOWED,
    premiumPercent: 10,
    nonResponseFallback: 'mtm',
    deadlineDays: 60,
};

export interface GlobalMTMRule extends MTMRuleFormState {
    auditLog: MTMAuditEntry[];
}

export interface PortfolioMTMRule extends MTMRuleFormState {
    portfolioId: string;
    portfolioName: string;
    isEnabled: boolean;
    auditLog: MTMAuditEntry[];
}

export interface OwnerMTMRule extends MTMRuleFormState {
    ownerId: string;
    ownerName: string;
    ownerEmail: string;
    portfolioId: string;
    isEnabled: boolean;
    auditLog: MTMAuditEntry[];
}

export interface MTMRulesConfig {
    global: GlobalMTMRule;
    portfolios: PortfolioMTMRule[];
    owners: OwnerMTMRule[];
}

export interface ResolvedMTMRule extends MTMRuleFormState {
    source: 'global' | 'portfolio' | 'owner';
    sourceLabel: string;
}

export interface UseMTMRulesReturn {
    config: MTMRulesConfig;
    isDirty: boolean;
    activeSection: 'global' | 'portfolios' | 'owners' | 'audit';
    setActiveSection: (s: UseMTMRulesReturn['activeSection']) => void;

    updateGlobalRule: (updates: Partial<MTMRuleFormState>) => void;
    updatePortfolioRule: (portfolioId: string, updates: Partial<PortfolioMTMRule>) => void;
    updateOwnerRule: (ownerId: string, updates: Partial<OwnerMTMRule>) => void;
    addOwnerOverride: (ownerId: string, data: { name: string; email: string; portfolioId: string }) => void;
    removeOwnerOverride: (ownerId: string) => void;

    resolveRuleForRenewal: (portfolioId: string, ownerId: string) => ResolvedMTMRule;

    saveConfig: () => void;
    discardChanges: () => void;

    fullAuditLog: MTMAuditEntry[];
}

export interface MTMRulesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    rulesHook: UseMTMRulesReturn;
    portfolioOptions: Array<{ value: string; label: string }>;
    ownerOptions: Array<{
        value: string;
        label: string;
        email: string;
        portfolioId: string;
    }>;
}
