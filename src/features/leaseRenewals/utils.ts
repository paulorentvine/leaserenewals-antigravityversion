import {
    LeaseRenewal,
    RecurringCharge,
    RenewalFilters,
    RenewalSortState
} from './types';

/**
 * Calculates the percentage difference between current and proposed rent.
 * Returns a number rounded to 1 decimal place.
 */
export const calculateRentChangePercent = (currentRent: number, proposedRent: number): number => {
    if (currentRent === 0) return 0;
    const percent = ((proposedRent - currentRent) / currentRent) * 100;
    return Math.round(percent * 10) / 10;
};

/**
 * Formats a numeric amount as USD currency.
 * Removes decimals if the amount is a whole number.
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Formats a number as a percentage string.
 * Example: 4.2 -> "+4.2%", -2.1 -> "-2.1%"
 */
export const formatPercent = (value: number, showPlus = false): string => {
    const rounded = Math.round(value * 10) / 10;
    const prefix = showPlus && rounded > 0 ? '+' : '';
    return `${prefix}${rounded}%`;
};

/**
 * Formats an ISO date string as a human-readable date.
 * Example: "Apr 15, 2025"
 */
export const formatLeaseEndDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Checks if a lease end date falls within the next N days.
 */
export const isLeaseEndingSoon = (isoDate: string, withinDays: number): boolean => {
    const endDate = new Date(isoDate);
    const now = new Date();
    const diffInTime = endDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
    return diffInDays >= 0 && diffInDays <= withinDays;
};

/**
 * Calculates the net monthly change in rent between existing and proposed.
 */
export const getChargeNetChange = (charges: RecurringCharge[], proposedRent: number): number => {
    const primaryRentCharge = charges.find(c => c.isRentCharge);
    return primaryRentCharge ? proposedRent - primaryRentCharge.amount : proposedRent;
};

/**
 * Returns true if the proposed start date occurs before any existing ongoing rent charge ends.
 */
export const hasOverlappingCharge = (charges: RecurringCharge[], proposedStartDate: string): boolean => {
    const primaryRentCharge = charges.find(c => c.isRentCharge);
    if (!primaryRentCharge) return false;

    if (!primaryRentCharge.endDate) return true; // Ongoing charge always overlaps

    const currentEnd = new Date(primaryRentCharge.endDate);
    const proposedStart = new Date(proposedStartDate);
    return currentEnd > proposedStart;
};

/**
 * Sorts an array of renewals based on the provided sort criteria.
 * Handles nested properties and calculated fields like rentChangePercent.
 */
export const sortRenewals = (renewals: LeaseRenewal[], sort: RenewalSortState): LeaseRenewal[] => {
    return [...renewals].sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sort.column === 'rentChangePercent') {
            valA = calculateRentChangePercent(a.currentRent, a.proposedRent);
            valB = calculateRentChangePercent(b.currentRent, b.proposedRent);
        } else if (sort.column === 'property.address') {
            valA = a.property.address;
            valB = b.property.address;
        } else if (sort.column === 'tenant.lastName') {
            valA = a.tenant.lastName;
            valB = b.tenant.lastName;
        } else {
            valA = a[sort.column as keyof LeaseRenewal];
            valB = b[sort.column as keyof LeaseRenewal];
        }

        if (valA === valB) return 0;
        const modifier = sort.direction === 'asc' ? 1 : -1;
        return valA > valB ? modifier : -modifier;
    });
};

/**
 * Filters an array of renewals based on the active filters.
 */
export const filterRenewals = (renewals: LeaseRenewal[], filters: RenewalFilters): LeaseRenewal[] => {
    return renewals.filter(r => {
        // Search filter (name, address, unit)
        if (filters.search) {
            const search = filters.search.toLowerCase();
            const matchesSearch =
                r.tenant.firstName.toLowerCase().includes(search) ||
                r.tenant.lastName.toLowerCase().includes(search) ||
                r.property.address.toLowerCase().includes(search) ||
                (r.property.unitNumber || '').toLowerCase().includes(search);

            if (!matchesSearch) return false;
        }

        // Portfolio filter
        if (filters.portfolioId && r.property.portfolioId !== filters.portfolioId) {
            return false;
        }

        // Status filter
        if (filters.status && r.status !== filters.status) {
            return false;
        }

        // Expiry filter
        if (filters.expiringWithin !== 'custom') {
            if (!isLeaseEndingSoon(r.leaseEndDate, filters.expiringWithin)) {
                return false;
            }
        } else if (filters.customDateRange) {
            const start = new Date(filters.customDateRange.from);
            const end = new Date(filters.customDateRange.to);
            const current = new Date(r.leaseEndDate);
            if (current < start || current > end) {
                return false;
            }
        }

        return true;
    });
};

/**
 * Generates a unique cell identifier for UI editing.
 */
export const generateCellId = (renewalId: string, columnKey: string): string => {
    return `${renewalId}:${columnKey}`;
};

/**
 * Decodes a cell ID into its components.
 */
export const parseCellId = (cellId: string): { renewalId: string; columnKey: string } => {
    const [renewalId, columnKey] = cellId.split(':');
    return { renewalId, columnKey };
};
