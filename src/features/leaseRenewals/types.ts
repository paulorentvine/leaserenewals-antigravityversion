/**
 * Official TypeScript types for the Rentvine Lease Renewals feature.
 */

/**
 * Valid states for a lease renewal record.
 */
export enum RenewalStatus {
    PENDING = 'pending',
    OFFER_SENT = 'offer_sent',
    TENANT_RESPONDED = 'tenant_responded',
    OWNER_APPROVED = 'owner_approved',
    SIGNED = 'signed',
    COMPLETED = 'completed',
    VACATING = 'vacating'
}

/**
 * Month-to-month policy rules.
 */
export enum MTMPolicy {
    ALLOWED = 'allowed',
    FORBIDDEN = 'forbidden',
    PREMIUM = 'premium',          // allowed but with a fee premium
    CONDITIONAL = 'conditional'  // allowed only if no response by deadline
}

/**
 * Status of owner approval for a renewal offer.
 */
export enum OwnerApprovalStatus {
    APPROVED = 'approved',
    PENDING = 'pending',
    REQUIRES_ACTION = 'requires_action',
    NOT_REQUIRED = 'not_required'
}

/**
 * Duration options for a new lease term.
 */
export enum NewTermOption {
    MONTH_TO_MONTH = 'month_to_month',
    SIX_MONTHS = '6_months',
    TWELVE_MONTHS = '12_months',
    TWENTY_FOUR_MONTHS = '24_months',
    CUSTOM = 'custom'
}

/**
 * Information about a tenant on a lease.
 */
export interface Tenant {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    portalAccessEnabled: boolean;
}

/**
 * Information about a property owner.
 */
export interface Owner {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    /** Does this owner need to approve before offer is sent? */
    requiresApproval: boolean;
}

/**
 * Information about the physical property or unit.
 */
export interface Property {
    id: string;
    unitNumber?: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    portfolioId: string;
    portfolioName: string;
    propertyType: 'single_family' | 'duplex' | 'condo' | 'apartment';
}

/**
 * A line item charge that recurs on a frequency.
 */
export interface RecurringCharge {
    id: string;
    label: string;
    amount: number;
    frequency: 'monthly' | 'weekly' | 'annually';
    startDate: string; // ISO date
    endDate?: string; // ISO date, undefined = ongoing
    /** True if this is the primary rent line item */
    isRentCharge: boolean;
}

/**
 * Rules governing transition to a Month-to-Month status.
 */
export interface MTMRule {
    id: string;
    scope: 'global' | 'portfolio' | 'owner';
    scopeId?: string; // portfolioId or ownerId when scope !== global
    policy: MTMPolicy;
    premiumPercent?: number; // used when policy = PREMIUM
    nonResponseFallback: 'mtm' | 'non_renew'; // what happens if tenant doesn't respond
    deadlineDays: number; // days before expiry tenant must respond
    auditLog: MTMAuditEntry[];
}

/**
 * Historical log of changes to an MTM rule.
 */
export interface MTMAuditEntry {
    id: string;
    timestamp: string; // ISO datetime
    actor: string; // "System" | user name
    action: string; // human-readable description
    previousValue?: string;
    newValue?: string;
}

/**
 * Details of a specific renewal offer sent to a tenant.
 */
export interface RenewalOffer {
    id: string;
    offeredRent: number;
    offeredTerm: NewTermOption;
    customTermMonths?: number; // only when offeredTerm = CUSTOM
    offerSentAt?: string; // ISO datetime
    offerExpiresAt?: string; // ISO datetime
    tenantResponse?: 'accepted' | 'declined' | 'counter';
    tenantRespondedAt?: string;
    notes?: string;
}

/**
 * Analysis of moving from current charges to proposed renewal charges.
 */
export interface ChargeTransition {
    existingCharges: RecurringCharge[];
    proposedRentAmount: number;
    proposedStartDate: string; // ISO date
    /** True if existing rent charge not yet ended */
    hasOverlap: boolean;
    netMonthlyChange: number; // proposed - current primary rent
    /** PM has reviewed and confirmed the transition */
    confirmed: boolean;
}

/**
 * The main record representing a lease renewal opportunity.
 */
export interface LeaseRenewal {
    id: string;
    leaseId: string;
    property: Property;
    tenant: Tenant;
    owner: Owner;

    // Current lease
    currentRent: number;
    leaseEndDate: string; // ISO date
    currentTerm: NewTermOption;

    // Renewal state (what PM is editing)
    /** Starts as currentRent, PM edits this */
    proposedRent: number;
    proposedTerm: NewTermOption;
    customTermMonths?: number;

    // Status
    status: RenewalStatus;
    ownerApprovalStatus: OwnerApprovalStatus;
    mtmPolicy: MTMPolicy;
    mtmPremiumPercent?: number;

    // Sub-records
    currentCharges: RecurringCharge[];
    chargeTransition?: ChargeTransition;
    offers: RenewalOffer[];
    mtmRule?: MTMRule;

    // Metadata
    createdAt: string;
    updatedAt: string;

    // UI-only state (not persisted)
    /** True if user has unsaved edits */
    isDirty: boolean;
    /** True if checkbox checked in grid */
    isSelected: boolean;
    validationErrors?: Partial<Record<keyof LeaseRenewal, string>>;
}

/**
 * State for grid filters.
 */
export interface RenewalFilters {
    search: string;
    portfolioId?: string;
    expiringWithin: 30 | 60 | 90 | 'custom';
    customDateRange?: { from: string; to: string };
    status?: RenewalStatus;
}

/**
 * State for grid sorting.
 */
export interface RenewalSortState {
    column: keyof LeaseRenewal | 'rentChangePercent' | 'property.address' | 'tenant.lastName';
    direction: 'asc' | 'desc';
}

/**
 * Global page state for the lease renewals feature.
 */
export interface RenewalPageState {
    activeTab: 'active' | 'pending_offers' | 'completed' | 'settings';
    filters: RenewalFilters;
    sort: RenewalSortState;
    selectedIds: Set<string>;
    /** format: `${renewalId}:${columnKey}` */
    editingCellId: string | null;
    undoStack: RenewalUndoEntry[];
}

/**
 * Entry for the undos system.
 */
export interface RenewalUndoEntry {
    renewalId: string;
    field: 'proposedRent' | 'proposedTerm' | 'customTermMonths';
    previousValue: number | string;
    timestamp: number;
}

/**
 * Valid bulk operations.
 */
export type BulkActionType =
    | 'apply_percent_increase'
    | 'apply_flat_increase'
    | 'set_term'
    | 'send_offers'
    | 'approve_owner'
    | 'mark_to_vacate';

/**
 * Representation of a bulk action to be performed.
 */
export interface BulkAction {
    type: BulkActionType;
    targetIds: string[];
    payload?: {
        percentIncrease?: number;
        flatIncrease?: number;
        term?: NewTermOption;
    };
}
