import type { BulkAction, LeaseRenewal, NewTermOption } from '../../types';

export interface BulkActionToolbarProps {
    selectedCount: number;
    selectedRenewals: LeaseRenewal[];     // the actual selected records
    onAction: (action: BulkAction) => void;
    onClearSelection: () => void;
}

export interface ApplyIncreasePopoverProps {
    selectedCount: number;
    onApply: (type: 'percent' | 'flat', value: number) => void;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export interface SetTermPopoverProps {
    selectedCount: number;
    selectedRenewals: LeaseRenewal[];
    onApply: (term: NewTermOption) => void;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLButtonElement | null>;
}

export type ConfirmVariant =
    | 'send_offers'
    | 'approve_owner'
    | 'mark_to_vacate'
    | 'apply_increase'
    | 'set_term';

export interface BulkConfirmModalProps {
    variant: ConfirmVariant;
    selectedCount: number;
    payload?: {                          // populated for increase/term previews
        increaseType?: 'percent' | 'flat';
        increaseValue?: number;
        term?: NewTermOption;
        affectedRenewals?: Array<{
            tenantName: string;
            currentRent: number;
            newRent: number;
            address: string;
        }>;
    };
    onConfirm: () => void;
    onCancel: () => void;
}
