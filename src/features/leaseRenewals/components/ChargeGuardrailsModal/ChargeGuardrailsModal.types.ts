import type {
    RecurringCharge,
    LeaseRenewal,
} from '../../types';

export type GuardrailTrigger =
    | 'inline_edit'
    | 'bulk_apply';

export type ChargeLineStatus =
    | 'stopping'
    | 'continuing'
    | 'new'
    | 'overlap_risk'
    | 'updating';

export interface ChargeAnalysisLine {
    charge: RecurringCharge;
    status: ChargeLineStatus;
    proposedEndDate?: string;
    proposedAmount?: number;
    overlapDays?: number;
    isRentLine: boolean;
}

export interface ChargeGuardrailPayload {
    renewal: LeaseRenewal;
    trigger: GuardrailTrigger;
    previousProposedRent: number;
    newProposedRent: number;
    proposedChargeStartDate: string;
    chargeAnalysis: ChargeAnalysisLine[];
    hasOverlapRisk: boolean;
    overlapCount: number;
    netMonthlyChange: number;
    currentPrimaryRent: number;
}

export interface BulkChargeGuardrailPayload {
    trigger: 'bulk_apply';
    items: ChargeGuardrailPayload[];
    totalOverlapRisks: number;
    totalNetChange: number;
}

export interface ChargeGuardrailsModalProps {
    payload: ChargeGuardrailPayload | BulkChargeGuardrailPayload;
    onConfirm: (confirmedIds: string[]) => void;
    onCancel: () => void;
}

export interface UseChargeGuardrailsReturn {
    pendingPayload: ChargeGuardrailPayload | BulkChargeGuardrailPayload | null;
    triggerGuardrail: (payload: ChargeGuardrailPayload) => void;
    triggerBulkGuardrail: (items: ChargeGuardrailPayload[]) => void;
    confirmGuardrail: (confirmedIds: string[]) => void;
    cancelGuardrail: () => void;
}
