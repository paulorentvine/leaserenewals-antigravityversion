import type { LeaseRenewal } from './types';
import {
    RenewalStatus,
    MTMPolicy,
    OwnerApprovalStatus,
    NewTermOption
} from './types';

/**
 * FIXED REFERENCE DATE: 2025-03-15
 * Dates range roughly Apr 4 – May 29 2025 (20–75 days from reference)
 */

export const MOCK_RENEWALS: LeaseRenewal[] = [
    {
        id: 'r1',
        leaseId: 'l1',
        property: {
            id: 'prop1',
            address: '1242 E 4th St',
            unitNumber: '4B',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            portfolioId: 'p1',
            portfolioName: 'Sunrise Properties',
            propertyType: 'apartment'
        },
        tenant: {
            id: 't1',
            firstName: 'Marisol',
            lastName: 'Esparza',
            email: 'm.esparza@example.com',
            phone: '512-555-0192',
            portalAccessEnabled: true
        },
        owner: {
            id: 'o1',
            firstName: 'Robert',
            lastName: 'Chen',
            email: 'rchen@owner-group.com',
            phone: '512-555-9988',
            requiresApproval: true
        },
        currentRent: 1850,
        leaseEndDate: '2025-04-10',
        currentTerm: NewTermOption.TWELVE_MONTHS,
        proposedRent: 1942, // ~5% increase
        proposedTerm: NewTermOption.TWELVE_MONTHS,
        status: RenewalStatus.PENDING,
        ownerApprovalStatus: OwnerApprovalStatus.PENDING,
        mtmPolicy: MTMPolicy.ALLOWED,
        currentCharges: [
            { id: 'c1', label: 'Monthly Rent', amount: 1850, frequency: 'monthly', startDate: '2024-04-10', isRentCharge: true },
            { id: 'c2', label: 'Parking Space', amount: 75, frequency: 'monthly', startDate: '2024-04-10', isRentCharge: false }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c1', label: 'Monthly Rent', amount: 1850, frequency: 'monthly', startDate: '2024-04-10', isRentCharge: true },
                { id: 'c2', label: 'Parking Space', amount: 75, frequency: 'monthly', startDate: '2024-04-10', isRentCharge: false }
            ],
            proposedRentAmount: 1942,
            proposedStartDate: '2025-04-11',
            hasOverlap: false,
            netMonthlyChange: 92,
            confirmed: false
        },
        offers: [],
        createdAt: '2025-02-15T09:00:00Z',
        updatedAt: '2025-03-01T14:30:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r2',
        leaseId: 'l2',
        property: {
            id: 'prop2',
            address: '882 High Vista Ln',
            city: 'Denver',
            state: 'CO',
            zip: '80202',
            portfolioId: 'p2',
            portfolioName: 'Metro Rentals Group',
            propertyType: 'single_family'
        },
        tenant: {
            id: 't2',
            firstName: 'Liam',
            lastName: 'Hansen',
            email: 'liamh@gmail.com',
            phone: '303-555-0433',
            portalAccessEnabled: true
        },
        owner: {
            id: 'o2',
            firstName: 'Sarah',
            lastName: 'Vance',
            email: 'svance@rentvine.com',
            phone: '303-555-1122',
            requiresApproval: false
        },
        currentRent: 2450,
        leaseEndDate: '2025-05-15',
        currentTerm: NewTermOption.TWELVE_MONTHS,
        proposedRent: 2621, // ~7% increase
        proposedTerm: NewTermOption.TWELVE_MONTHS,
        status: RenewalStatus.OFFER_SENT,
        ownerApprovalStatus: OwnerApprovalStatus.APPROVED,
        mtmPolicy: MTMPolicy.PREMIUM,
        mtmPremiumPercent: 10,
        currentCharges: [
            { id: 'c3', label: 'Monthly Rent', amount: 2450, frequency: 'monthly', startDate: '2024-05-15', isRentCharge: true },
            { id: 'c4', label: 'Pet Fee (Tucker)', amount: 50, frequency: 'monthly', startDate: '2024-05-15', isRentCharge: false }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c3', label: 'Monthly Rent', amount: 2450, frequency: 'monthly', startDate: '2024-05-15', isRentCharge: true },
                { id: 'c4', label: 'Pet Fee (Tucker)', amount: 50, frequency: 'monthly', startDate: '2024-05-15', isRentCharge: false }
            ],
            proposedRentAmount: 2621,
            proposedStartDate: '2025-05-16',
            hasOverlap: false,
            netMonthlyChange: 171,
            confirmed: false
        },
        offers: [
            { id: 'off1', offeredRent: 2621, offeredTerm: NewTermOption.TWELVE_MONTHS, offerSentAt: '2025-03-10T11:00:00Z' }
        ],
        createdAt: '2025-02-10T08:00:00Z',
        updatedAt: '2025-03-10T11:00:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r3',
        leaseId: 'l3',
        property: {
            id: 'prop3',
            address: '401 Central Ave NW',
            unitNumber: 'Penthouse A',
            city: 'Albuquerque',
            state: 'NM',
            zip: '87102',
            portfolioId: 'p2',
            portfolioName: 'Metro Rentals Group',
            propertyType: 'apartment'
        },
        tenant: {
            id: 't3',
            firstName: 'Elena',
            lastName: 'Rodriguez',
            email: 'e.rodriguez@outlook.com',
            phone: '505-555-8821',
            portalAccessEnabled: true
        },
        owner: {
            id: 'o3',
            firstName: 'Mark',
            lastName: 'Wyman',
            email: 'mwyman@private-equity.com',
            phone: '505-555-3399',
            requiresApproval: true
        },
        currentRent: 1350,
        leaseEndDate: '2025-04-05',
        currentTerm: NewTermOption.SIX_MONTHS,
        proposedRent: 1404, // ~4% increase
        proposedTerm: NewTermOption.SIX_MONTHS,
        status: RenewalStatus.TENANT_RESPONDED,
        ownerApprovalStatus: OwnerApprovalStatus.APPROVED,
        mtmPolicy: MTMPolicy.FORBIDDEN,
        currentCharges: [
            { id: 'c5', label: 'Monthly Rent', amount: 1350, frequency: 'monthly', startDate: '2024-10-05', isRentCharge: true }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c5', label: 'Monthly Rent', amount: 1350, frequency: 'monthly', startDate: '2024-10-05', isRentCharge: true }
            ],
            proposedRentAmount: 1404,
            proposedStartDate: '2025-04-06',
            hasOverlap: false,
            netMonthlyChange: 54,
            confirmed: false
        },
        offers: [
            { id: 'off2', offeredRent: 1431, offeredTerm: NewTermOption.SIX_MONTHS, offerSentAt: '2025-03-01T09:00:00Z', tenantResponse: 'counter', notes: 'Tenant asked for lower increase.' }
        ],
        createdAt: '2025-02-05T10:00:00Z',
        updatedAt: '2025-03-08T16:20:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r4',
        leaseId: 'l4',
        property: {
            id: 'prop4',
            address: '1502 West Loop South',
            city: 'Houston',
            state: 'TX',
            zip: '77027',
            portfolioId: 'p1',
            portfolioName: 'Sunrise Properties',
            propertyType: 'condo'
        },
        tenant: {
            id: 't4',
            firstName: 'Marcus',
            lastName: 'Thorne',
            email: 'mthorne@energy-corp.com',
            phone: '713-555-0988',
            portalAccessEnabled: true
        },
        owner: {
            id: 'o4',
            firstName: 'Angela',
            lastName: 'Bass',
            email: 'angela.bass@realty-invest.com',
            phone: '713-555-4422',
            requiresApproval: true
        },
        currentRent: 2150,
        leaseEndDate: '2025-05-20',
        currentTerm: NewTermOption.TWELVE_MONTHS,
        proposedRent: 2322, // ~8% increase
        proposedTerm: NewTermOption.TWELVE_MONTHS,
        status: RenewalStatus.PENDING,
        ownerApprovalStatus: OwnerApprovalStatus.REQUIRES_ACTION,
        mtmPolicy: MTMPolicy.ALLOWED,
        currentCharges: [
            { id: 'c6', label: 'Monthly Rent', amount: 2150, frequency: 'monthly', startDate: '2024-05-20', isRentCharge: true },
            { id: 'c7', label: 'Storage Unit B7', amount: 45, frequency: 'monthly', startDate: '2024-05-20', isRentCharge: false }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c6', label: 'Monthly Rent', amount: 2150, frequency: 'monthly', startDate: '2024-05-20', isRentCharge: true },
                { id: 'c7', label: 'Storage Unit B7', amount: 45, frequency: 'monthly', startDate: '2024-05-20', isRentCharge: false }
            ],
            proposedRentAmount: 2322,
            proposedStartDate: '2025-05-21',
            hasOverlap: false,
            netMonthlyChange: 172,
            confirmed: false
        },
        offers: [],
        createdAt: '2025-03-01T11:00:00Z',
        updatedAt: '2025-03-12T10:15:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r5',
        leaseId: 'l5',
        property: {
            id: 'prop5',
            address: '229 Palace Ave',
            city: 'Santa Fe',
            state: 'NM',
            zip: '87501',
            portfolioId: 'p2',
            portfolioName: 'Metro Rentals Group',
            propertyType: 'duplex'
        },
        tenant: {
            id: 't5',
            firstName: 'Isabella',
            lastName: 'Quinn',
            email: 'iquinn@arts-council.org',
            phone: '505-555-1212',
            portalAccessEnabled: false
        },
        owner: {
            id: 'o5',
            firstName: 'David',
            lastName: 'Sterling',
            email: 'dsterling@family-trust.com',
            phone: '505-555-6677',
            requiresApproval: false
        },
        currentRent: 1625,
        leaseEndDate: '2025-04-25',
        currentTerm: NewTermOption.TWELVE_MONTHS,
        proposedRent: 1722, // ~6% increase
        proposedTerm: NewTermOption.TWELVE_MONTHS,
        status: RenewalStatus.SIGNED,
        ownerApprovalStatus: OwnerApprovalStatus.NOT_REQUIRED,
        mtmPolicy: MTMPolicy.ALLOWED,
        currentCharges: [
            { id: 'c8', label: 'Monthly Rent', amount: 1625, frequency: 'monthly', startDate: '2024-04-25', isRentCharge: true }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c8', label: 'Monthly Rent', amount: 1625, frequency: 'monthly', startDate: '2024-04-25', isRentCharge: true }
            ],
            proposedRentAmount: 1722,
            proposedStartDate: '2025-04-26',
            hasOverlap: false,
            netMonthlyChange: 97,
            confirmed: true
        },
        offers: [
            { id: 'off3', offeredRent: 1722, offeredTerm: NewTermOption.TWELVE_MONTHS, offerSentAt: '2025-02-20T14:00:00Z', tenantResponse: 'accepted', tenantRespondedAt: '2025-03-05T10:30:00Z' }
        ],
        createdAt: '2025-01-20T09:00:00Z',
        updatedAt: '2025-03-07T12:00:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r6',
        leaseId: 'l6',
        property: {
            id: 'prop6',
            address: '772 Garden of the Gods Rd',
            city: 'Colorado Springs',
            state: 'CO',
            zip: '80907',
            portfolioId: 'p1',
            portfolioName: 'Sunrise Properties',
            propertyType: 'single_family'
        },
        tenant: {
            id: 't6',
            firstName: 'Jackson',
            lastName: 'Miller',
            email: 'jax.miller@tech-pros.io',
            phone: '719-555-0011',
            portalAccessEnabled: true
        },
        owner: {
            id: 'o6',
            firstName: 'Nancy',
            lastName: 'Wheeler',
            email: 'nw@private-rentals.com',
            phone: '719-555-2233',
            requiresApproval: false
        },
        currentRent: 1975,
        leaseEndDate: '2025-05-10',
        currentTerm: NewTermOption.TWELVE_MONTHS,
        proposedRent: 2073, // ~5% increase
        proposedTerm: NewTermOption.TWELVE_MONTHS,
        status: RenewalStatus.PENDING,
        ownerApprovalStatus: OwnerApprovalStatus.PENDING,
        mtmPolicy: MTMPolicy.PREMIUM,
        mtmPremiumPercent: 10,
        currentCharges: [
            { id: 'c9', label: 'Monthly Rent', amount: 1975, frequency: 'monthly', startDate: '2024-05-10', isRentCharge: true },
            { id: 'c10', label: 'Landscaping Fee', amount: 40, frequency: 'monthly', startDate: '2024-05-10', isRentCharge: false }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c9', label: 'Monthly Rent', amount: 1975, frequency: 'monthly', startDate: '2024-05-10', isRentCharge: true },
                { id: 'c10', label: 'Landscaping Fee', amount: 40, frequency: 'monthly', startDate: '2024-05-10', isRentCharge: false }
            ],
            proposedRentAmount: 2073,
            proposedStartDate: '2025-05-11',
            hasOverlap: true, // TEST OVERLAP UI
            netMonthlyChange: 98,
            confirmed: false
        },
        offers: [],
        createdAt: '2025-03-05T08:00:00Z',
        updatedAt: '2025-03-14T11:00:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r7',
        leaseId: 'l7',
        property: {
            id: 'prop7',
            address: '553 High St',
            unitNumber: 'Apt 212',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
            portfolioId: 'p2',
            portfolioName: 'Metro Rentals Group',
            propertyType: 'apartment'
        },
        tenant: {
            id: 't7',
            firstName: 'Chloe',
            lastName: 'Smith',
            email: 'chloe.s@startup-labs.com',
            phone: '512-555-7733',
            portalAccessEnabled: true
        },
        owner: {
            id: 'o7',
            firstName: 'Tom',
            lastName: 'Harrison',
            email: 'tharrison@capital-mgmt.com',
            phone: '512-555-8811',
            requiresApproval: true
        },
        currentRent: 1475,
        leaseEndDate: '2025-04-15',
        currentTerm: NewTermOption.TWELVE_MONTHS,
        proposedRent: 1534, // ~4% increase
        proposedTerm: NewTermOption.TWELVE_MONTHS,
        status: RenewalStatus.OFFER_SENT,
        ownerApprovalStatus: OwnerApprovalStatus.APPROVED,
        mtmPolicy: MTMPolicy.FORBIDDEN,
        currentCharges: [
            { id: 'c11', label: 'Monthly Rent', amount: 1475, frequency: 'monthly', startDate: '2024-04-15', isRentCharge: true }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c11', label: 'Monthly Rent', amount: 1475, frequency: 'monthly', startDate: '2024-04-15', isRentCharge: true }
            ],
            proposedRentAmount: 1534,
            proposedStartDate: '2025-04-16',
            hasOverlap: false,
            netMonthlyChange: 59,
            confirmed: false
        },
        offers: [
            { id: 'off4', offeredRent: 1534, offeredTerm: NewTermOption.TWELVE_MONTHS, offerSentAt: '2025-03-12T10:00:00Z' }
        ],
        createdAt: '2025-02-15T09:00:00Z',
        updatedAt: '2025-03-12T10:00:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r8',
        leaseId: 'l8',
        property: {
            id: 'prop8',
            address: '9211 Kirby Dr',
            city: 'Houston',
            state: 'TX',
            zip: '77054',
            portfolioId: 'p1',
            portfolioName: 'Sunrise Properties',
            propertyType: 'duplex'
        },
        tenant: {
            id: 't8',
            firstName: 'Derrick',
            lastName: 'Wade',
            email: 'dwade@logistics-plus.com',
            phone: '832-555-0123',
            portalAccessEnabled: true
        },
        owner: {
            id: 'o8',
            firstName: 'Lisa',
            lastName: 'Dumont',
            email: 'ldumont@luxe-holdings.com',
            phone: '832-555-4455',
            requiresApproval: true
        },
        currentRent: 1250,
        leaseEndDate: '2025-05-29',
        currentTerm: NewTermOption.TWELVE_MONTHS,
        proposedRent: 1337, // ~7% increase
        proposedTerm: NewTermOption.TWELVE_MONTHS,
        status: RenewalStatus.TENANT_RESPONDED,
        ownerApprovalStatus: OwnerApprovalStatus.PENDING,
        mtmPolicy: MTMPolicy.CONDITIONAL,
        currentCharges: [
            { id: 'c12', label: 'Monthly Rent', amount: 1250, frequency: 'monthly', startDate: '2024-05-29', isRentCharge: true },
            { id: 'c13', label: 'Pet Fee (Simba)', amount: 25, frequency: 'monthly', startDate: '2024-05-29', isRentCharge: false }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c12', label: 'Monthly Rent', amount: 1250, frequency: 'monthly', startDate: '2024-05-29', isRentCharge: true },
                { id: 'c13', label: 'Pet Fee (Simba)', amount: 25, frequency: 'monthly', startDate: '2024-05-29', isRentCharge: false }
            ],
            proposedRentAmount: 1337,
            proposedStartDate: '2025-05-30',
            hasOverlap: false,
            netMonthlyChange: 87,
            confirmed: false
        },
        offers: [
            { id: 'off5', offeredRent: 1337, offeredTerm: NewTermOption.TWELVE_MONTHS, offerSentAt: '2025-03-05T09:00:00Z', tenantResponse: 'counter', notes: 'Tenant requested pet fee waive.' }
        ],
        createdAt: '2025-02-25T14:00:00Z',
        updatedAt: '2025-03-11T16:45:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r9',
        leaseId: 'l9',
        property: {
            id: 'prop9',
            address: '142 Canyon View Rd',
            city: 'Santa Fe',
            state: 'NM',
            zip: '87506',
            portfolioId: 'p2',
            portfolioName: 'Metro Rentals Group',
            propertyType: 'single_family'
        },
        tenant: {
            id: 't9',
            firstName: 'Rachel',
            lastName: 'Green',
            email: 'rgreen@fashion-weekly.com',
            phone: '505-555-0912',
            portalAccessEnabled: true
        },
        owner: {
            id: 'o9',
            firstName: 'Phil',
            lastName: 'Dunphy',
            email: 'phil@modern-estates.com',
            phone: '505-555-4433',
            requiresApproval: false
        },
        currentRent: 2200,
        leaseEndDate: '2025-04-18',
        currentTerm: NewTermOption.TWELVE_MONTHS,
        proposedRent: 2266, // ~3% increase
        proposedTerm: NewTermOption.TWELVE_MONTHS,
        status: RenewalStatus.OWNER_APPROVED,
        ownerApprovalStatus: OwnerApprovalStatus.APPROVED,
        mtmPolicy: MTMPolicy.FORBIDDEN,
        currentCharges: [
            { id: 'c14', label: 'Monthly Rent', amount: 2200, frequency: 'monthly', startDate: '2024-04-18', isRentCharge: true }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c14', label: 'Monthly Rent', amount: 2200, frequency: 'monthly', startDate: '2024-04-18', isRentCharge: true }
            ],
            proposedRentAmount: 2266,
            proposedStartDate: '2025-04-19',
            hasOverlap: true, // TEST OVERLAP UI
            netMonthlyChange: 66,
            confirmed: false
        },
        offers: [],
        createdAt: '2025-02-18T10:00:00Z',
        updatedAt: '2025-03-10T14:00:00Z',
        isDirty: false,
        isSelected: false
    },
    {
        id: 'r10',
        leaseId: 'l10',
        property: {
            id: 'prop10',
            address: '331 Broadway Ave',
            unitNumber: 'Suite 2',
            city: 'Albuquerque',
            state: 'NM',
            zip: '87102',
            portfolioId: 'p1',
            portfolioName: 'Sunrise Properties',
            propertyType: 'condo'
        },
        tenant: {
            id: 't10',
            firstName: 'Henry',
            lastName: 'Cavill',
            email: 'h.cavill@acting-studio.com',
            phone: '505-555-1234',
            portalAccessEnabled: false
        },
        owner: {
            id: 'o10',
            firstName: 'Bruce',
            lastName: 'Wayne',
            email: 'bwayne@wayne-corp.com',
            phone: '505-555-6622',
            requiresApproval: false
        },
        currentRent: 925,
        leaseEndDate: '2025-05-05',
        currentTerm: NewTermOption.SIX_MONTHS,
        proposedRent: 980, // ~6% increase
        proposedTerm: NewTermOption.SIX_MONTHS,
        status: RenewalStatus.VACATING,
        ownerApprovalStatus: OwnerApprovalStatus.NOT_REQUIRED,
        mtmPolicy: MTMPolicy.ALLOWED,
        currentCharges: [
            { id: 'c15', label: 'Monthly Rent', amount: 925, frequency: 'monthly', startDate: '2024-11-05', isRentCharge: true }
        ],
        chargeTransition: {
            existingCharges: [
                { id: 'c15', label: 'Monthly Rent', amount: 925, frequency: 'monthly', startDate: '2024-11-05', isRentCharge: true }
            ],
            proposedRentAmount: 980,
            proposedStartDate: '2025-05-06',
            hasOverlap: false,
            netMonthlyChange: 55,
            confirmed: false
        },
        offers: [],
        createdAt: '2025-03-01T08:00:00Z',
        updatedAt: '2025-03-13T09:00:00Z',
        isDirty: false,
        isSelected: false
    }
];
