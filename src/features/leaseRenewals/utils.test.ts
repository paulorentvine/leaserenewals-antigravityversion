import { describe, it, expect } from 'vitest';
import {
    calculateRentChangePercent,
    formatCurrency,
    formatPercent,
    formatLeaseEndDate,
    isLeaseEndingSoon,
    getChargeNetChange,
    hasOverlappingCharge,
    generateCellId,
    parseCellId,
} from './utils';

describe('calculateRentChangePercent', () => {
    it('returns 0 when current rent is 0', () => {
        expect(calculateRentChangePercent(0, 1500)).toBe(0);
    });
    it('returns positive percent for increase', () => {
        expect(calculateRentChangePercent(1000, 1050)).toBe(5);
    });
    it('returns negative percent for decrease', () => {
        expect(calculateRentChangePercent(1000, 950)).toBe(-5);
    });
    it('returns 0 when rents are equal', () => {
        expect(calculateRentChangePercent(1200, 1200)).toBe(0);
    });
    it('rounds to 1 decimal', () => {
        expect(calculateRentChangePercent(1000, 1033)).toBe(3.3);
    });
});

describe('formatCurrency', () => {
    it('formats whole numbers without decimals', () => {
        expect(formatCurrency(1500)).toBe('$1,500');
    });
    it('formats fractional amounts with 2 decimals', () => {
        expect(formatCurrency(1500.5)).toBe('$1,500.50');
    });
    it('formats zero', () => {
        expect(formatCurrency(0)).toBe('$0');
    });
});

describe('formatPercent', () => {
    it('returns percentage string', () => {
        expect(formatPercent(4.2)).toBe('4.2%');
    });
    it('shows + prefix when enabled and positive', () => {
        expect(formatPercent(4.2, true)).toBe('+4.2%');
    });
    it('does not show + for negative values', () => {
        expect(formatPercent(-2.1, true)).toBe('-2.1%');
    });
    it('handles zero', () => {
        expect(formatPercent(0, true)).toBe('0%');
    });
});

describe('formatLeaseEndDate', () => {
    it('formats ISO date to readable', () => {
        const result = formatLeaseEndDate('2025-04-15T12:00:00');
        expect(result).toContain('Apr');
        expect(result).toContain('15');
        expect(result).toContain('2025');
    });
});

describe('isLeaseEndingSoon', () => {
    it('returns true for dates within range', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 10);
        expect(isLeaseEndingSoon(futureDate.toISOString(), 30)).toBe(true);
    });
    it('returns false for dates far in the future', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 90);
        expect(isLeaseEndingSoon(futureDate.toISOString(), 30)).toBe(false);
    });
    it('returns false for past dates', () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 10);
        expect(isLeaseEndingSoon(pastDate.toISOString(), 30)).toBe(false);
    });
});

describe('getChargeNetChange', () => {
    it('calculates net change from primary rent charge', () => {
        const charges = [
            { id: '1', label: 'Rent', amount: 1000, isRentCharge: true, chargeCode: 'RENT', startDate: '2024-01-01', frequency: 'monthly' as const },
            { id: '2', label: 'Pet Fee', amount: 50, isRentCharge: false, chargeCode: 'PET', startDate: '2024-01-01', frequency: 'monthly' as const },
        ];
        expect(getChargeNetChange(charges, 1100)).toBe(100);
    });
    it('returns proposedRent when no primary charge exists', () => {
        const charges = [
            { id: '1', label: 'Pet Fee', amount: 50, isRentCharge: false, chargeCode: 'PET', startDate: '2024-01-01', frequency: 'monthly' as const },
        ];
        expect(getChargeNetChange(charges, 1100)).toBe(1100);
    });
});

describe('hasOverlappingCharge', () => {
    it('returns true when charge has no end date', () => {
        const charges = [
            { id: '1', label: 'Rent', amount: 1000, isRentCharge: true, chargeCode: 'RENT', startDate: '2024-01-01', frequency: 'monthly' as const },
        ];
        expect(hasOverlappingCharge(charges, '2025-05-01')).toBe(true);
    });
    it('returns true when charge end date is after proposed start', () => {
        const charges = [
            { id: '1', label: 'Rent', amount: 1000, isRentCharge: true, chargeCode: 'RENT', startDate: '2024-01-01', endDate: '2025-06-01', frequency: 'monthly' as const },
        ];
        expect(hasOverlappingCharge(charges, '2025-05-01')).toBe(true);
    });
    it('returns false when charge ends before proposed start', () => {
        const charges = [
            { id: '1', label: 'Rent', amount: 1000, isRentCharge: true, chargeCode: 'RENT', startDate: '2024-01-01', endDate: '2025-04-01', frequency: 'monthly' as const },
        ];
        expect(hasOverlappingCharge(charges, '2025-05-01')).toBe(false);
    });
    it('returns false when no rent charge exists', () => {
        const charges = [
            { id: '1', label: 'Pet Fee', amount: 50, isRentCharge: false, chargeCode: 'PET', startDate: '2024-01-01', frequency: 'monthly' as const },
        ];
        expect(hasOverlappingCharge(charges, '2025-05-01')).toBe(false);
    });
});

describe('generateCellId / parseCellId', () => {
    it('generates a cell ID from renewal and column', () => {
        expect(generateCellId('r1', 'proposedRent')).toBe('r1:proposedRent');
    });
    it('parses a cell ID back to components', () => {
        const parsed = parseCellId('r1:proposedRent');
        expect(parsed.renewalId).toBe('r1');
        expect(parsed.columnKey).toBe('proposedRent');
    });
});
