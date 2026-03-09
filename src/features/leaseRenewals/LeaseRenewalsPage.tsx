import React from 'react';
import { AppShell } from '@/components/shell/AppShell';

/**
 * Main dashboard container for the Lease Renewals feature.
 */
export const LeaseRenewalsPage: React.FC = () => {
    return (
        <AppShell
            pageTitleBarProps={{
                title: 'Lease Renewals',
                primaryAction: {
                    label: 'Start Renewal Wave',
                    icon: 'plus',
                    onClick: () => console.log('Start Renewal Wave clicked'),
                },
                secondaryAction: {
                    icon: 'ellipsis-vertical',
                    onClick: () => console.log('More options clicked'),
                    ariaLabel: 'More options',
                },
            }}
        >
            <div className="px-4 py-6 text-sm text-gray-400">
                Shell complete — grid coming in Prompt 1.3
            </div>
        </AppShell>
    );
};
