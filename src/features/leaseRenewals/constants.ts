import {
    RenewalStatus,
    MTMPolicy,
    OwnerApprovalStatus,
    NewTermOption
} from './types';

/**
 * UI configuration for each renewal status.
 */
export const RENEWAL_STATUS_CONFIG: Record<RenewalStatus, { label: string; color: 'orange' | 'blue' | 'amber' | 'green' | 'gray' | 'red' }> = {
    [RenewalStatus.PENDING]: { label: 'Pending', color: 'orange' },
    [RenewalStatus.OFFER_SENT]: { label: 'Offer Sent', color: 'blue' },
    [RenewalStatus.TENANT_RESPONDED]: { label: 'Tenant Responded', color: 'amber' },
    [RenewalStatus.OWNER_APPROVED]: { label: 'Owner Approved', color: 'green' },
    [RenewalStatus.SIGNED]: { label: 'Signed', color: 'green' },
    [RenewalStatus.COMPLETED]: { label: 'Completed', color: 'gray' },
    [RenewalStatus.VACATING]: { label: 'Vacating', color: 'red' },
};

/**
 * UI configuration for each MTM policy.
 */
export const MTM_POLICY_CONFIG: Record<MTMPolicy, { label: string; color: 'green' | 'orange' | 'red' | 'gray' }> = {
    [MTMPolicy.ALLOWED]: { label: 'Allowed', color: 'green' },
    [MTMPolicy.FORBIDDEN]: { label: 'Not Allowed', color: 'red' },
    [MTMPolicy.PREMIUM]: { label: 'Premium +%', color: 'orange' }, // Color is static, label gets dynamic % in UI
    [MTMPolicy.CONDITIONAL]: { label: 'Conditional', color: 'gray' },
};

/**
 * UI configuration for each owner approval status.
 */
export const OWNER_APPROVAL_CONFIG: Record<OwnerApprovalStatus, { label: string; icon: string; color: string }> = {
    [OwnerApprovalStatus.APPROVED]: { label: 'Approved', icon: 'check-circle', color: 'text-green-600' },
    [OwnerApprovalStatus.PENDING]: { label: 'Pending', icon: 'clock', color: 'text-gray-400' },
    [OwnerApprovalStatus.REQUIRES_ACTION]: { label: 'Requires Action', icon: 'alert-circle', color: 'text-red-500' },
    [OwnerApprovalStatus.NOT_REQUIRED]: { label: 'N/A', icon: 'minus', color: 'text-gray-300' },
};

/**
 * Available term options for selection.
 */
export const TERM_OPTIONS: Array<{ value: NewTermOption; label: string }> = [
    { value: NewTermOption.MONTH_TO_MONTH, label: 'Month-to-Month' },
    { value: NewTermOption.SIX_MONTHS, label: '6 Months' },
    { value: NewTermOption.TWELVE_MONTHS, label: '12 Months' },
    { value: NewTermOption.TWENTY_FOUR_MONTHS, label: '24 Months' },
    { value: NewTermOption.CUSTOM, label: 'Custom' },
];

/**
 * Standard options for expiration filters.
 */
export const EXPIRY_FILTER_OPTIONS: Array<{ value: 30 | 60 | 90 | 'custom'; label: string }> = [
    { value: 30, label: 'Next 30 Days' },
    { value: 60, label: 'Next 60 Days' },
    { value: 90, label: 'Next 90 Days' },
    { value: 'custom', label: 'Custom Date Range' },
];
