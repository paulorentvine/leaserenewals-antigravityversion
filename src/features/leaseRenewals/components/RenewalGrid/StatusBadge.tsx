import React from 'react';
import type { RenewalStatus } from '../../types';
import { RENEWAL_STATUS_CONFIG } from '../../constants';

interface StatusBadgeProps {
    status: RenewalStatus;
    size?: 'sm' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status, size = 'default' }) => {
    const config = RENEWAL_STATUS_CONFIG[status] || { label: status, color: 'gray' };

    const colorMap: Record<string, string> = {
        orange: 'bg-orange-surface text-orange border-orange-border',
        blue: 'bg-info-surface text-info border-info-border',
        amber: 'bg-amber-surface text-amber border-amber-border',
        green: 'bg-success-surface text-success border-success-border',
        gray: 'bg-gray-100 text-neutral-muted border-border',
        red: 'bg-error-surface text-error border-error-border',
    };

    const dotColorMap: Record<string, string> = {
        orange: 'bg-orange',
        blue: 'bg-info',
        amber: 'bg-amber',
        green: 'bg-success',
        gray: 'bg-neutral-muted',
        red: 'bg-error',
    };

    const colors = colorMap[config.color] || colorMap.gray;
    const dotColor = dotColorMap[config.color] || dotColorMap.gray;

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${size === 'default' ? 'px-2.5 py-0.5 text-xs' : 'px-1.5 py-px text-[11px]'}
        ${colors}
      `}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
            <span>{config.label}</span>
        </span>
    );
});
StatusBadge.displayName = 'StatusBadge';
