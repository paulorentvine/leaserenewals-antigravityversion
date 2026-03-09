import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { OwnerApprovalStatus } from '../../types';
import { OWNER_APPROVAL_CONFIG } from '../../constants';

interface OwnerApprovalCellProps {
    status: OwnerApprovalStatus;
}

export const OwnerApprovalCell: React.FC<OwnerApprovalCellProps> = React.memo(({ status }) => {
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
        green: 'text-success',
        gray: 'text-neutral-muted',
        red: 'text-error',
        silver: 'text-gray-300'
    };

    const colorClass = colorClasses[config.color] || 'text-neutral-muted';

    return (
        <div className={`inline-flex items-center gap-1.5 text-sm ${colorClass}`}>
            <Icon size={14} className="shrink-0" />
            <span className="font-medium">{config.label}</span>
        </div>
    );
});
OwnerApprovalCell.displayName = 'OwnerApprovalCell';
