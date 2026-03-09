import { useState, useMemo, useCallback } from 'react';
import { MTMPolicy } from '../types';
import type { MTMAuditEntry } from '../types';
import type {
    UseMTMRulesReturn,
    MTMRulesConfig,
    ResolvedMTMRule,
    MTMRuleFormState,
    PortfolioMTMRule,
    OwnerMTMRule
} from '../components/MTMRulesDrawer/MTMRulesDrawer.types';
import { DEFAULT_RULE_FORM } from '../components/MTMRulesDrawer/MTMRulesDrawer.types';

const INITIAL_CONFIG: MTMRulesConfig = {
    global: {
        policy: MTMPolicy.ALLOWED,
        premiumPercent: 10,
        nonResponseFallback: 'mtm',
        deadlineDays: 60,
        auditLog: [
            {
                id: 'audit-init-global',
                timestamp: '2025-01-15T09:00:00Z',
                actor: 'System',
                action: 'Global MTM rule initialized',
                newValue: 'Policy: Allowed, Deadline: 60 days',
            }
        ],
    },
    portfolios: [
        {
            portfolioId: 'p1',
            portfolioName: 'Sunrise Properties',
            policy: MTMPolicy.PREMIUM,
            premiumPercent: 10,
            nonResponseFallback: 'mtm',
            deadlineDays: 45,
            isEnabled: true,
            auditLog: [],
        },
        {
            portfolioId: 'p2',
            portfolioName: 'Metro Rentals Group',
            policy: MTMPolicy.FORBIDDEN,
            premiumPercent: 0,
            nonResponseFallback: 'non_renew',
            deadlineDays: 30,
            isEnabled: true,
            auditLog: [],
        },
    ],
    owners: [],
};

const userActor = 'Alex Johnson';

function generateId() {
    return 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2);
}

export function useMTMRules(): UseMTMRulesReturn {
    const [savedConfig, setSavedConfig] = useState<MTMRulesConfig>(INITIAL_CONFIG);
    const [workingConfig, setWorkingConfig] = useState<MTMRulesConfig>(INITIAL_CONFIG);

    const [activeSection, setActiveSection] = useState<UseMTMRulesReturn['activeSection']>('global');

    const isDirty = useMemo(() => {
        return JSON.stringify(savedConfig) !== JSON.stringify(workingConfig);
    }, [savedConfig, workingConfig]);

    const updateGlobalRule = useCallback((updates: Partial<MTMRuleFormState>) => {
        setWorkingConfig(prev => ({
            ...prev,
            global: { ...prev.global, ...updates }
        }));
    }, []);

    const updatePortfolioRule = useCallback((portfolioId: string, updates: Partial<PortfolioMTMRule>) => {
        setWorkingConfig(prev => ({
            ...prev,
            portfolios: prev.portfolios.map(p =>
                p.portfolioId === portfolioId ? { ...p, ...updates } : p
            )
        }));
    }, []);

    const updateOwnerRule = useCallback((ownerId: string, updates: Partial<OwnerMTMRule>) => {
        setWorkingConfig(prev => ({
            ...prev,
            owners: prev.owners.map(o =>
                o.ownerId === ownerId ? { ...o, ...updates } : o
            )
        }));
    }, []);

    const addOwnerOverride = useCallback((ownerId: string, data: { name: string; email: string; portfolioId: string }) => {
        setWorkingConfig(prev => ({
            ...prev,
            owners: [
                ...prev.owners,
                {
                    ...DEFAULT_RULE_FORM,
                    ownerId,
                    ownerName: data.name,
                    ownerEmail: data.email,
                    portfolioId: data.portfolioId,
                    isEnabled: true,
                    auditLog: [],
                }
            ]
        }));
    }, []);

    const removeOwnerOverride = useCallback((ownerId: string) => {
        setWorkingConfig(prev => ({
            ...prev,
            owners: prev.owners.filter(o => o.ownerId !== ownerId)
        }));
    }, []);

    const resolveRuleForRenewal = useCallback((portfolioId: string, ownerId: string): ResolvedMTMRule => {
        const ownerRule = workingConfig.owners.find(o => o.ownerId === ownerId && o.isEnabled);
        if (ownerRule) {
            return {
                policy: ownerRule.policy,
                premiumPercent: ownerRule.premiumPercent,
                nonResponseFallback: ownerRule.nonResponseFallback,
                deadlineDays: ownerRule.deadlineDays,
                source: 'owner',
                sourceLabel: ownerRule.ownerName,
            };
        }

        const portfolioRule = workingConfig.portfolios.find(p => p.portfolioId === portfolioId && p.isEnabled);
        if (portfolioRule) {
            return {
                policy: portfolioRule.policy,
                premiumPercent: portfolioRule.premiumPercent,
                nonResponseFallback: portfolioRule.nonResponseFallback,
                deadlineDays: portfolioRule.deadlineDays,
                source: 'portfolio',
                sourceLabel: portfolioRule.portfolioName,
            };
        }

        return {
            policy: workingConfig.global.policy,
            premiumPercent: workingConfig.global.premiumPercent,
            nonResponseFallback: workingConfig.global.nonResponseFallback,
            deadlineDays: workingConfig.global.deadlineDays,
            source: 'global',
            sourceLabel: 'Global Default',
        };
    }, [workingConfig]);

    const saveConfig = useCallback(() => {
        if (!isDirty) return;

        const newConfig = JSON.parse(JSON.stringify(workingConfig)) as MTMRulesConfig;
        const now = new Date().toISOString();

        // Very basic audit logging for changes
        // Detect global changes
        if (JSON.stringify(savedConfig.global) !== JSON.stringify(workingConfig.global)) {
            newConfig.global.auditLog.unshift({
                id: generateId(),
                timestamp: now,
                actor: userActor,
                action: `Global MTM rule updated`,
                previousValue: JSON.stringify(savedConfig.global),
                newValue: JSON.stringify(workingConfig.global)
            });
        }

        // Detect portfolio changes
        workingConfig.portfolios.forEach((wp, i) => {
            const sp = savedConfig.portfolios.find(p => p.portfolioId === wp.portfolioId);
            if (!sp || JSON.stringify(sp) !== JSON.stringify(wp)) {
                newConfig.portfolios[i].auditLog.unshift({
                    id: generateId(),
                    timestamp: now,
                    actor: userActor,
                    action: `Portfolio '${wp.portfolioName}' rule updated`,
                });
            }
        });

        // Detect owner changes
        workingConfig.owners.forEach((wo, i) => {
            const so = savedConfig.owners.find(o => o.ownerId === wo.ownerId);
            if (!so || JSON.stringify(so) !== JSON.stringify(wo)) {
                newConfig.owners[i].auditLog.unshift({
                    id: generateId(),
                    timestamp: now,
                    actor: userActor,
                    action: !so ? `Owner override added for ${wo.ownerName}` : `Owner override updated for ${wo.ownerName}`,
                });
            }
        });

        setSavedConfig(newConfig);
        setWorkingConfig(newConfig);
    }, [isDirty, workingConfig, savedConfig]);

    const discardChanges = useCallback(() => {
        setWorkingConfig(savedConfig);
    }, [savedConfig]);

    const fullAuditLog = useMemo(() => {
        const entries: MTMAuditEntry[] = [];
        entries.push(...workingConfig.global.auditLog);
        workingConfig.portfolios.forEach(p => entries.push(...p.auditLog));
        workingConfig.owners.forEach(o => entries.push(...o.auditLog));
        entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return entries;
    }, [workingConfig]);

    return {
        config: workingConfig,
        isDirty,
        activeSection,
        setActiveSection,
        updateGlobalRule,
        updatePortfolioRule,
        updateOwnerRule,
        addOwnerOverride,
        removeOwnerOverride,
        resolveRuleForRenewal,
        saveConfig,
        discardChanges,
        fullAuditLog,
    };
}
