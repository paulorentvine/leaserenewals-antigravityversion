import { useMemo, useState } from 'react';
import type {
    BulkAction,
    LeaseRenewal,
} from '../types';
import type { ChargeGuardrailPayload } from '../components/ChargeGuardrailsModal/ChargeGuardrailsModal.types';
import { analyzeCharges } from './useChargeGuardrails';
import {
    RenewalStatus,
    OwnerApprovalStatus
} from '../types';
import type { ConfirmVariant, BulkConfirmModalProps } from '../components/BulkActionToolbar/BulkActionToolbar.types';

interface UseBulkActionsOptions {
    renewals: LeaseRenewal[];
    selectedIds: Set<string>;
    onRenewalsChange: (updated: LeaseRenewal[]) => void;
    onSelectionChange: (ids: Set<string>) => void;
    onBeforeBulkRentChange?: (items: ChargeGuardrailPayload[]) => boolean;
}

interface UseBulkActionsReturn {
    selectedRenewals: LeaseRenewal[];
    pendingAction: BulkAction | null;
    confirmVariant: ConfirmVariant | null;
    confirmPayload: BulkConfirmModalProps['payload'];
    handleAction: (action: BulkAction) => void;
    handleConfirm: () => void;
    handleCancelConfirm: () => void;
}

export function useBulkActions({
    renewals,
    selectedIds,
    onRenewalsChange,
    onSelectionChange,
    onBeforeBulkRentChange,
}: UseBulkActionsOptions): UseBulkActionsReturn {
    const [pendingAction, setPendingAction] = useState<BulkAction | null>(null);
    const [confirmVariant, setConfirmVariant] = useState<ConfirmVariant | null>(null);
    const [confirmPayload, setConfirmPayload] = useState<BulkConfirmModalProps['payload']>(undefined);

    const selectedRenewals = useMemo(() =>
        renewals.filter(r => selectedIds.has(r.id)),
        [renewals, selectedIds]
    );

    const handleAction = (action: BulkAction) => {
        setPendingAction(action);

        if (action.type === 'apply_percent_increase') {
            const percent = action.payload?.percentIncrease || 0;
            setConfirmVariant('apply_increase');
            setConfirmPayload({
                increaseType: 'percent',
                increaseValue: percent,
                affectedRenewals: selectedRenewals.map(r => ({
                    tenantName: `${r.tenant.firstName} ${r.tenant.lastName}`,
                    address: r.property.address,
                    currentRent: r.proposedRent,
                    newRent: Math.round(r.proposedRent * (1 + percent / 100))
                }))
            });
        } else if (action.type === 'apply_flat_increase') {
            const flat = action.payload?.flatIncrease || 0;
            setConfirmVariant('apply_increase');
            setConfirmPayload({
                increaseType: 'flat',
                increaseValue: flat,
                affectedRenewals: selectedRenewals.map(r => ({
                    tenantName: `${r.tenant.firstName} ${r.tenant.lastName}`,
                    address: r.property.address,
                    currentRent: r.proposedRent,
                    newRent: r.proposedRent + flat
                }))
            });
        } else if (action.type === 'set_term') {
            const term = action.payload?.term;
            setConfirmVariant('set_term');
            setConfirmPayload({
                term,
                affectedRenewals: selectedRenewals.map(r => ({
                    tenantName: `${r.tenant.firstName} ${r.tenant.lastName}`,
                    address: r.property.address,
                    currentRent: r.proposedRent,
                    newRent: r.proposedRent
                }))
            });
        } else if (action.type === 'send_offers') {
            setConfirmVariant('send_offers');
            setConfirmPayload(undefined);
        } else if (action.type === 'approve_owner') {
            setConfirmVariant('approve_owner');
            setConfirmPayload(undefined);
        } else if (action.type === 'mark_to_vacate') {
            setConfirmVariant('mark_to_vacate');
            setConfirmPayload(undefined);
        }
    };

    const handleConfirm = () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'apply_percent_increase' || pendingAction.type === 'apply_flat_increase') {
            if (onBeforeBulkRentChange) {
                const items: ChargeGuardrailPayload[] = [];
                for (const r of renewals) {
                    if (!selectedIds.has(r.id)) continue;
                    let newRent = r.proposedRent;
                    if (pendingAction.type === 'apply_percent_increase') {
                        newRent = Math.round(r.proposedRent * (1 + (pendingAction.payload?.percentIncrease || 0) / 100));
                    } else if (pendingAction.type === 'apply_flat_increase') {
                        newRent = r.proposedRent + (pendingAction.payload?.flatIncrease || 0);
                    }
                    if (newRent !== r.proposedRent) {
                        items.push(analyzeCharges(r, newRent, r.proposedRent, 'bulk_apply'));
                    }
                }
                if (items.length > 0) {
                    const shouldContinue = onBeforeBulkRentChange(items);
                    if (!shouldContinue) {
                        setPendingAction(null);
                        setConfirmVariant(null);
                        setConfirmPayload(undefined);
                        // We do not clear selection immediately if intercepted; it's handled externally
                        return;
                    }
                }
            }
        }

        const updatedRenewals = renewals.map(r => {
            if (!selectedIds.has(r.id)) return r;

            const changes: Partial<LeaseRenewal> = { isDirty: true };

            switch (pendingAction.type) {
                case 'apply_percent_increase':
                    changes.proposedRent = Math.round(r.proposedRent * (1 + (pendingAction.payload?.percentIncrease || 0) / 100));
                    break;
                case 'apply_flat_increase':
                    changes.proposedRent = r.proposedRent + (pendingAction.payload?.flatIncrease || 0);
                    break;
                case 'set_term':
                    changes.proposedTerm = pendingAction.payload?.term;
                    break;
                case 'send_offers':
                    if (r.status === RenewalStatus.PENDING || r.status === RenewalStatus.TENANT_RESPONDED) {
                        changes.status = RenewalStatus.OFFER_SENT;
                    } else {
                        return r; // Not eligible
                    }
                    break;
                case 'approve_owner':
                    if (r.ownerApprovalStatus === OwnerApprovalStatus.PENDING || r.ownerApprovalStatus === OwnerApprovalStatus.REQUIRES_ACTION) {
                        changes.ownerApprovalStatus = OwnerApprovalStatus.APPROVED;
                    } else {
                        return r; // Not eligible
                    }
                    break;
                case 'mark_to_vacate':
                    changes.status = RenewalStatus.VACATING;
                    break;
            }

            return { ...r, ...changes };
        });

        onRenewalsChange(updatedRenewals);
        onSelectionChange(new Set());
        setPendingAction(null);
        setConfirmVariant(null);
        setConfirmPayload(undefined);
    };

    const handleCancelConfirm = () => {
        setPendingAction(null);
        setConfirmVariant(null);
        setConfirmPayload(undefined);
    };

    return {
        selectedRenewals,
        pendingAction,
        confirmVariant,
        confirmPayload,
        handleAction,
        handleConfirm,
        handleCancelConfirm,
    };
}
