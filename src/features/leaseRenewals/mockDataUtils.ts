import type { LeaseRenewal } from './types';
import { RenewalStatus } from './types';
import { MOCK_RENEWALS } from './mockData';
import { MOCK_SCENARIOS } from './mockScenarios';
import type { MockScenario } from './mockScenarios';
import { isLeaseEndingSoon } from './utils';

export function getScenarioById(id: string): MockScenario | undefined {
    return MOCK_SCENARIOS.find(s => s.id === id);
}

export function getScenarioRenewals(id: string): LeaseRenewal[] {
    return getScenarioById(id)?.getRenewals() ?? MOCK_RENEWALS;
}

export function getRenewalById(id: string): LeaseRenewal | undefined {
    return MOCK_RENEWALS.find(r => r.id === id);
}

export function getRenewalsByPortfolio(portfolioId: string): LeaseRenewal[] {
    return MOCK_RENEWALS.filter(r => r.property.portfolioId === portfolioId);
}

export function getRenewalsByStatus(status: RenewalStatus): LeaseRenewal[] {
    return MOCK_RENEWALS.filter(r => r.status === status);
}

export function getOverlapRiskRenewals(): LeaseRenewal[] {
    return MOCK_RENEWALS.filter(r => r.chargeTransition?.hasOverlap);
}

export function getScenarioStats(renewals: LeaseRenewal[]) {
    return {
        total: renewals.length,
        byStatus: Object.values(RenewalStatus).reduce((acc, s) => ({
            ...acc,
            [s]: renewals.filter(r => r.status === s).length,
        }), {} as Record<RenewalStatus, number>),
        byPortfolio: renewals.reduce((acc, r) => ({
            ...acc,
            [r.property.portfolioName]: (acc[r.property.portfolioName] ?? 0) + 1,
        }), {} as Record<string, number>),
        overlapRisks: renewals.filter(r => r.chargeTransition?.hasOverlap).length,
        urgentCount: renewals.filter(r => isLeaseEndingSoon(r.leaseEndDate, 10)).length,
        totalMonthlyRent: renewals.reduce((sum, r) => sum + r.currentRent, 0),
    };
}
