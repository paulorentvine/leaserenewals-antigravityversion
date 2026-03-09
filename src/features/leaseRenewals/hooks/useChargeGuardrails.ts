import { useState, useCallback } from 'react';
import type { LeaseRenewal } from '../types';
import type {
    ChargeGuardrailPayload,
    BulkChargeGuardrailPayload,
    UseChargeGuardrailsReturn,
    ChargeAnalysisLine
} from '../components/ChargeGuardrailsModal/ChargeGuardrailsModal.types';

interface UseChargeGuardrailsOptions {
    renewals: LeaseRenewal[];
    onRenewalsConfirmed: (
        updates: Array<{ id: string; proposedRent: number; isDirty: boolean }>
    ) => void;
    onRenewalsReverted: (
        reverts: Array<{ id: string; proposedRent: number }>
    ) => void;
}

export function hasOverlappingCharge(charges: any[], proposedStartDate: string): boolean {
    return charges.some(c => !c.endDate || c.endDate >= proposedStartDate);
}

export function analyzeCharges(
    renewal: LeaseRenewal,
    newProposedRent: number,
    previousProposedRent: number,
    trigger: 'inline_edit' | 'bulk_apply' = 'inline_edit'
): ChargeGuardrailPayload {
    const leaseEndDate = new Date(renewal.leaseEndDate);
    const proposedDate = new Date(leaseEndDate);
    proposedDate.setDate(leaseEndDate.getDate() + 1);
    const proposedChargeStartDate = proposedDate.toISOString().split('T')[0];

    const chargeAnalysis: ChargeAnalysisLine[] = renewal.currentCharges.map(charge => {
        if (charge.isRentCharge) {
            if (hasOverlappingCharge([charge], proposedChargeStartDate)) {
                let days = 30;
                if (charge.endDate) {
                    const diffTime = Math.abs(new Date(charge.endDate).getTime() - proposedDate.getTime());
                    days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                const fixDate = new Date(proposedDate);
                fixDate.setDate(fixDate.getDate() - 1);

                return {
                    charge,
                    status: 'overlap_risk',
                    overlapDays: days,
                    proposedEndDate: fixDate.toISOString().split('T')[0],
                    proposedAmount: newProposedRent,
                    isRentLine: true
                };
            } else {
                return {
                    charge,
                    status: 'updating',
                    proposedAmount: newProposedRent,
                    proposedEndDate: renewal.leaseEndDate,
                    isRentLine: true
                };
            }
        } else {
            if (charge.endDate && charge.endDate <= renewal.leaseEndDate) {
                return {
                    charge,
                    status: 'stopping',
                    proposedEndDate: charge.endDate,
                    isRentLine: false
                };
            } else {
                return {
                    charge,
                    status: 'continuing',
                    isRentLine: false
                };
            }
        }
    });

    chargeAnalysis.push({
        charge: {
            id: 'proposed-new-rent',
            label: 'Monthly Rent (New)',
            amount: newProposedRent,
            frequency: 'monthly',
            startDate: proposedChargeStartDate,
            endDate: undefined,
            isRentCharge: true,
        },
        status: 'new',
        isRentLine: true,
        proposedAmount: newProposedRent,
    });

    const currentPrimaryRent = renewal.currentCharges.find((c: any) => c.isRentCharge)?.amount ?? 0;
    const hasOverlapRisk = chargeAnalysis.some(l => l.status === 'overlap_risk');
    const overlapCount = chargeAnalysis.filter(l => l.status === 'overlap_risk').length;
    const netMonthlyChange = newProposedRent - currentPrimaryRent;

    return {
        renewal,
        trigger,
        previousProposedRent,
        newProposedRent,
        proposedChargeStartDate,
        chargeAnalysis,
        hasOverlapRisk,
        overlapCount,
        netMonthlyChange,
        currentPrimaryRent
    };
}

export function useChargeGuardrails({
    renewals: _renewals,
    onRenewalsConfirmed,
    onRenewalsReverted
}: UseChargeGuardrailsOptions): UseChargeGuardrailsReturn {
    const [pendingPayload, setPendingPayload] = useState<ChargeGuardrailPayload | BulkChargeGuardrailPayload | null>(null);

    const triggerGuardrail = useCallback((payload: ChargeGuardrailPayload) => {
        setPendingPayload(payload);
    }, []);

    const triggerBulkGuardrail = useCallback((items: ChargeGuardrailPayload[]) => {
        const totalOverlapRisks = items.filter(i => i.hasOverlapRisk).length;
        const totalNetChange = items.reduce((sum, item) => sum + item.netMonthlyChange, 0);

        setPendingPayload({
            trigger: 'bulk_apply',
            items,
            totalOverlapRisks,
            totalNetChange
        });
    }, []);

    const confirmGuardrail = useCallback((confirmedIds: string[]) => {
        if (!pendingPayload) return;

        if (pendingPayload.trigger === 'bulk_apply') {
            const bulkPayload = pendingPayload as BulkChargeGuardrailPayload;

            const confirms: Array<{ id: string; proposedRent: number; isDirty: boolean }> = [];
            const reverts: Array<{ id: string; proposedRent: number }> = [];

            bulkPayload.items.forEach(item => {
                if (confirmedIds.includes(item.renewal.id)) {
                    confirms.push({
                        id: item.renewal.id,
                        proposedRent: item.newProposedRent,
                        isDirty: true
                    });
                } else {
                    reverts.push({
                        id: item.renewal.id,
                        proposedRent: item.previousProposedRent
                    });
                }
            });

            if (confirms.length > 0) onRenewalsConfirmed(confirms);
            if (reverts.length > 0) onRenewalsReverted(reverts);
        } else {
            const singlePayload = pendingPayload as ChargeGuardrailPayload;
            if (confirmedIds.includes(singlePayload.renewal.id)) {
                onRenewalsConfirmed([{
                    id: singlePayload.renewal.id,
                    proposedRent: singlePayload.newProposedRent,
                    isDirty: true
                }]);
            }
        }

        setPendingPayload(null);
    }, [pendingPayload, onRenewalsConfirmed, onRenewalsReverted]);

    const cancelGuardrail = useCallback(() => {
        if (!pendingPayload) return;

        if (pendingPayload.trigger === 'bulk_apply') {
            const bulkPayload = pendingPayload as BulkChargeGuardrailPayload;
            const reverts = bulkPayload.items.map(item => ({
                id: item.renewal.id,
                proposedRent: item.previousProposedRent
            }));
            onRenewalsReverted(reverts);
        } else {
            const singlePayload = pendingPayload as ChargeGuardrailPayload;
            onRenewalsReverted([{
                id: singlePayload.renewal.id,
                proposedRent: singlePayload.previousProposedRent
            }]);
        }

        setPendingPayload(null);
    }, [pendingPayload, onRenewalsReverted]);

    return {
        pendingPayload,
        triggerGuardrail,
        triggerBulkGuardrail,
        confirmGuardrail,
        cancelGuardrail
    };
}
