import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { OwnerApprovalStatus } from '../../types';
import { OWNER_APPROVAL_CONFIG } from '../../constants';

interface OwnerApprovalCellProps {
    status: OwnerApprovalStatus;
}

export const OwnerApprovalCell: React.FC<OwnerApprovalCellProps> = ({ status }) => {
    const config = OWNER_APPROVAL_CONFIG[status] || {
        label: status,
        icon: 'minus',
        color: 'gray'
    };

    const getIcon = (name: string) => {
        // Map kebab case names to PascalCase Lucide icon names
        const iconMap: Record<string, any> = {
            'check-circle': LucideIcons.CheckCircle,
            'clock': LucideIcons.Clock,
            'alert-circle': LucideIcons.AlertCircle,
            'minus': LucideIcons.Minus
        };
        return iconMap[name] || LucideIcons.HelpCircle;
    };

    const Icon = getIcon(config.icon);

    const colorClasses: Record<string, string> = {
        green: 'text-green-600',
        gray: 'text-gray-400',
        red: 'text-red-500',
        silver: 'text-gray-300' // Using gray-300 for silver
    };

    const colorClass = colorClasses[config.color] || 'text-gray-400';

    return (
        <div className={`inline-flex items-center gap-1.5 text-sm ${colorClass}`}>
            <Icon size={14} className="shrink-0" />
            <span className="font-medium">{config.label}</span>
        </div>
    );
};
