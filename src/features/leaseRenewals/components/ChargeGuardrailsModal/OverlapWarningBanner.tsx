import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { formatLeaseEndDate } from '../../utils';

interface OverlapWarningBannerProps {
    overlapCount: number;
    affectedChargeLabels: string[];
    proposedFixDate: string;
}

export const OverlapWarningBanner: React.FC<OverlapWarningBannerProps> = ({
    overlapCount,
    affectedChargeLabels,
    proposedFixDate,
}) => {
    if (overlapCount <= 0) return null;

    return (
        <div className="rounded-[var(--radius-100)] border bg-red-50 border-red-200 px-4 py-3 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-600" />
            </div>
            <div>
                <h4 className="text-sm font-semibold text-red-900">
                    Billing Overlap Detected
                </h4>
                <p className="text-sm text-red-800 mt-1">
                    {overlapCount} recurring charge{overlapCount !== 1 ? 's' : ''} may cause a double-billing
                    if not ended before {formatLeaseEndDate(proposedFixDate)}.
                </p>

                <ul className="mt-2 space-y-1">
                    {affectedChargeLabels.map((label, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-xs text-red-700">
                            <span className="font-bold">•</span>
                            <span>{label}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-2 pt-2 border-t border-red-200 text-xs text-red-700 flex items-start gap-1.5">
                    <Info size={12} className="text-red-400 mt-px flex-shrink-0" />
                    <span>
                        Confirming will automatically set end dates on the affected charges. Review the dates below before confirming.
                    </span>
                </div>
            </div>
        </div>
    );
};
