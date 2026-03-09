import type { LeaseRenewal, RenewalFilters, RenewalSortState } from './types';
import { RenewalStatus, OwnerApprovalStatus } from './types';
import { MOCK_RENEWALS, MOCK_RENEWALS_B, MOCK_RENEWALS_C, MOCK_RENEWALS_D, MOCK_RENEWALS_E, MOCK_RENEWALS_F, MOCK_TODAY } from './mockData';

export interface MockScenario {
    id: string;
    label: string;
    description: string;
    icon: string;
    color: string;
    getRenewals: () => LeaseRenewal[];
    initialFilters?: Partial<RenewalFilters>;
    initialSort?: RenewalSortState;
}

export const MOCK_SCENARIOS: MockScenario[] = [
    {
        id: 'full',
        label: 'All 52 Renewals',
        description: 'Full dataset — realistic PM portfolio load',
        icon: 'layout-grid',
        color: 'bg-gray-100 text-gray-700',
        getRenewals: () => MOCK_RENEWALS,
    },
    {
        id: 'urgent',
        label: 'Urgent — This Week',
        description: '8 renewals expiring within 10 days. Tests deadline pressure.',
        icon: 'alarm-clock',
        color: 'bg-red-100 text-red-700',
        getRenewals: () => MOCK_RENEWALS.filter(r => {
            const end = new Date(r.leaseEndDate);
            const today = new Date(MOCK_TODAY);
            const diff = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            return diff <= 10 && diff >= -1;
        }),
        initialSort: { column: 'leaseEndDate', direction: 'asc' },
    },
    {
        id: 'overlap_risks',
        label: 'Overlap Risks',
        description: 'All overlap-risk records. Tests ChargeGuardrailsModal.',
        icon: 'alert-triangle',
        color: 'bg-orange-100 text-orange-700',
        getRenewals: () => MOCK_RENEWALS.filter(r => r.chargeTransition?.hasOverlap),
        initialSort: { column: 'leaseEndDate', direction: 'asc' },
    },
    {
        id: 'campus_wave',
        label: 'Campus Wave',
        description: '8 campus renewals all expiring July 31. Tests batch workflow.',
        icon: 'graduation-cap',
        color: 'bg-blue-100 text-blue-700',
        getRenewals: () => MOCK_RENEWALS_C,
        initialFilters: { portfolioId: 'p3', expiringWithin: 90 as const },
    },
    {
        id: 'mtm_conflicts',
        label: 'MTM Conflicts',
        description: 'Records with MTM policy issues. Tests MTM badge warnings.',
        icon: 'git-branch',
        color: 'bg-amber-100 text-amber-700',
        getRenewals: () => MOCK_RENEWALS_D,
    },
    {
        id: 'owner_action',
        label: 'Owner Action Required',
        description: 'Records needing owner attention. Tests owner workflow.',
        icon: 'user-check',
        color: 'bg-purple-100 text-purple-700',
        getRenewals: () => MOCK_RENEWALS.filter(
            r => r.ownerApprovalStatus === OwnerApprovalStatus.REQUIRES_ACTION
                || (r.owner.requiresApproval && r.ownerApprovalStatus === OwnerApprovalStatus.PENDING)
        ),
    },
    {
        id: 'bulk_send',
        label: 'Ready to Send',
        description: 'All pending renewals ready for bulk offer send.',
        icon: 'send',
        color: 'bg-green-100 text-green-700',
        getRenewals: () => MOCK_RENEWALS.filter(r => r.status === RenewalStatus.PENDING),
    },
    {
        id: 'edge_cases',
        label: 'Edge Cases',
        description: 'Long names, expired leases, rent decreases. Tests UI limits.',
        icon: 'flask-conical',
        color: 'bg-pink-100 text-pink-700',
        getRenewals: () => MOCK_RENEWALS_E,
    },
    {
        id: 'vacating',
        label: 'Vacating',
        description: 'All vacating records. Tests red border and status filtering.',
        icon: 'log-out',
        color: 'bg-red-100 text-red-700',
        getRenewals: () => MOCK_RENEWALS_F,
    },
];
