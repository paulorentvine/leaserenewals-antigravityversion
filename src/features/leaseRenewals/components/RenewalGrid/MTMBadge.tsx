import React from 'react';
import type { MTMPolicy } from '../../types';
import { MTM_POLICY_CONFIG } from '../../constants';
import { MTMPolicy as MTMPolicyEnum } from '../../types';

interface MTMBadgeProps {
    policy: MTMPolicy;
    premiumPercent?: number;
}

export const MTMBadge: React.FC<MTMBadgeProps> = React.memo(({ policy, premiumPercent }) => {
    const config = MTM_POLICY_CONFIG[policy as keyof typeof MTM_POLICY_CONFIG] || { label: policy, color: 'gray' };

    const colorMap: Record<string, string> = {
        green: 'bg-green-100  text-green-800  border-green-200',
        red: 'bg-red-100    text-red-800    border-red-200',
        orange: 'bg-orange-100 text-orange-800 border-orange-200',
        gray: 'bg-gray-100   text-gray-600   border-gray-200',
    };

    const dotColorMap: Record<string, string> = {
        green: 'bg-green-500',
        red: 'bg-red-500',
        orange: 'bg-orange-500',
        gray: 'bg-gray-400',
    };

    const colors = colorMap[config.color] || colorMap.gray;
    const dotColor = dotColorMap[config.color] || dotColorMap.gray;

    let label = config.label;
    if (policy === MTMPolicyEnum.PREMIUM) {
        label = `Premium +${premiumPercent ?? 10}%`;
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border px-2 py-0.5 text-xs
        ${colors}
      `}
        >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
            <span>{label}</span>
        </span>
    );
});
MTMBadge.displayName = 'MTMBadge';
