import React from 'react';
import type { RenewalStatus } from '../../types';
import { RENEWAL_STATUS_CONFIG } from '../../constants';

interface StatusBadgeProps {
    status: RenewalStatus;
    size?: 'sm' | 'default';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'default' }) => {
    const config = RENEWAL_STATUS_CONFIG[status] || { label: status, color: 'gray' };

    const colorMap: Record<string, string> = {
        orange: 'bg-orange-100 text-orange-800 border-orange-200',
        blue: 'bg-blue-100   text-blue-800   border-blue-200',
        amber: 'bg-amber-100  text-amber-800  border-amber-200',
        green: 'bg-green-100  text-green-800  border-green-200',
        gray: 'bg-gray-100   text-gray-600   border-gray-200',
        red: 'bg-red-100    text-red-800    border-red-200',
    };

    const dotColorMap: Record<string, string> = {
        orange: 'bg-orange-500',
        blue: 'bg-blue-500',
        amber: 'bg-amber-500',
        green: 'bg-green-500',
        gray: 'bg-gray-400',
        red: 'bg-red-500',
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
};
