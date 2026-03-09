import React from 'react';
import { AlertTriangle, Plus, X, RefreshCw, Check, ArrowRight, Equal } from 'lucide-react';
import type { ChargeAnalysisLine, BulkChargeGuardrailPayload } from './ChargeGuardrailsModal.types';
import { formatCurrency, formatLeaseEndDate } from '../../utils';

interface ChargeComparisonTableProps {
    lines?: ChargeAnalysisLine[];
    leaseEndDate?: string;
    proposedChargeStartDate?: string;

    // For bulk mode
    bulkPayload?: BulkChargeGuardrailPayload;
    bulkConfirmedIds?: string[];
    onBulkSelectionChange?: (ids: string[]) => void;
}

export const ChargeComparisonTable: React.FC<ChargeComparisonTableProps> = ({
    lines,
    leaseEndDate,
    proposedChargeStartDate,
    bulkPayload,
    bulkConfirmedIds,
    onBulkSelectionChange,
}) => {
    if (bulkPayload && bulkConfirmedIds && onBulkSelectionChange) {
        // Bulk mode table
        const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) {
                onBulkSelectionChange(bulkPayload.items.map(i => i.renewal.id));
            } else {
                onBulkSelectionChange([]);
            }
        };

        const toggleOne = (id: string, checked: boolean) => {
            const newSet = new Set(bulkConfirmedIds);
            if (checked) newSet.add(id);
            else newSet.delete(id);
            onBulkSelectionChange(Array.from(newSet));
        };

        const allChecked = bulkPayload.items.length > 0 && bulkConfirmedIds.length === bulkPayload.items.length;

        return (
            <div className="w-full overflow-hidden rounded-[var(--radius-100)] border border-gray-200">
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-3 py-2.5 w-10 text-center">
                                <input
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded border-gray-300 text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-opacity-25"
                                    aria-label="Select all transitions"
                                />
                            </th>
                            <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase">Tenant + Address</th>
                            <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Current Rent</th>
                            <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">New Rent</th>
                            <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">% Change</th>
                            <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase">Overlap Risk</th>
                            <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase">Net Change</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bulkPayload.items.map(item => {
                            const isChecked = bulkConfirmedIds.includes(item.renewal.id);
                            return (
                                <tr key={item.renewal.id} className={!isChecked ? 'opacity-50 bg-gray-50' : 'bg-white'}>
                                    <td className="px-3 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={(e) => toggleOne(item.renewal.id, e.target.checked)}
                                            className="w-4 h-4 rounded border-gray-300 text-[var(--color-brand)] focus:ring-[var(--color-brand)] focus:ring-opacity-25"
                                        />
                                    </td>
                                    <td className="px-3 py-3">
                                        <div className="text-sm font-medium text-gray-900">{item.renewal.tenant.firstName} {item.renewal.tenant.lastName}</div>
                                        <div className="text-xs text-gray-500">{item.renewal.property.address}</div>
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono text-gray-700">{formatCurrency(item.currentPrimaryRent)}</td>
                                    <td className="px-3 py-3 text-right font-mono font-medium text-green-700">{formatCurrency(item.newProposedRent)}</td>
                                    <td className="px-3 py-3 text-right">
                                        {/* Simplified pct for bulk table */}
                                        <span className={item.netMonthlyChange > 0 ? 'text-green-600' : 'text-gray-500'}>
                                            {item.netMonthlyChange !== 0 ? (item.netMonthlyChange > 0 ? '+' : '') + Math.round((item.netMonthlyChange / item.currentPrimaryRent) * 100) + '%' : '0%'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        {item.hasOverlapRisk ? (
                                            <div className="inline-flex items-center gap-1.5 text-red-600 bg-red-100 px-2 py-0.5 rounded-full text-xs font-medium">
                                                <AlertTriangle size={12} /> Yes
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
                                                <Check size={12} /> Clear
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-3 text-right font-mono text-gray-700">{item.netMonthlyChange > 0 ? '+' : ''}{formatCurrency(item.netMonthlyChange)}/mo</td>
                                </tr>
                            );
                        })}
                        <tr className="bg-gray-50 font-medium">
                            <td colSpan={5} className="px-3 py-3 text-right text-gray-700">Total</td>
                            <td className="px-3 py-3 text-center text-red-600">{bulkPayload.totalOverlapRisks} risk{bulkPayload.totalOverlapRisks !== 1 ? 's' : ''}</td>
                            <td className="px-3 py-3 text-right text-gray-900">{formatCurrency(bulkPayload.totalNetChange)}/mo</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    if (!lines) return null;

    // Single mode table
    return (
        <div className="w-full overflow-hidden rounded-[var(--radius-100)] border border-gray-200">
            <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge</th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Amount</th>
                        <th className="px-3 py-2.5 text-center w-8"></th>
                        <th className="px-3 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">New Amount</th>
                        <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Dates</th>
                        <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {lines.map((line, idx) => {
                        let bgColor = 'bg-white';
                        let Icon = Check;
                        let iconColor = 'text-gray-400';
                        let ArrowIcon = Equal;
                        let arrowColor = 'text-gray-300';
                        let badgeColor = 'bg-gray-100 text-gray-500';
                        let badgeDotColor = 'bg-gray-400';
                        let statusText = 'Continuing';

                        if (line.status === 'overlap_risk') {
                            bgColor = 'bg-red-50/60';
                            Icon = AlertTriangle;
                            iconColor = 'text-red-500';
                            ArrowIcon = AlertTriangle;
                            arrowColor = 'text-red-400';
                            badgeColor = 'bg-red-100 text-red-800';
                            badgeDotColor = 'bg-red-500';
                            statusText = 'Overlap Risk';
                        } else if (line.status === 'new') {
                            bgColor = 'bg-green-50/60';
                            Icon = Plus;
                            iconColor = 'text-green-600';
                            ArrowIcon = ArrowRight;
                            arrowColor = 'text-gray-400';
                            badgeColor = 'bg-green-100 text-green-800';
                            badgeDotColor = 'bg-green-500';
                            statusText = 'New';
                        } else if (line.status === 'stopping') {
                            bgColor = 'bg-gray-50/40';
                            Icon = X;
                            iconColor = 'text-gray-400';
                            ArrowIcon = X;
                            arrowColor = 'text-gray-300';
                            badgeColor = 'bg-gray-100 text-gray-600';
                            badgeDotColor = 'bg-gray-400';
                            statusText = 'Stopping';
                        } else if (line.status === 'updating') {
                            bgColor = 'bg-blue-50/30';
                            Icon = RefreshCw;
                            iconColor = 'text-blue-500';
                            ArrowIcon = ArrowRight;
                            arrowColor = 'text-gray-400';
                            badgeColor = 'bg-blue-100 text-blue-800';
                            badgeDotColor = 'bg-blue-500';
                            statusText = 'Updating';
                        }

                        const delta = line.proposedAmount ? line.proposedAmount - line.charge.amount : 0;

                        return (
                            <tr key={line.charge.id || idx} className={bgColor}>
                                <td className="px-3 py-3">
                                    <div className="flex items-center gap-2">
                                        <Icon size={14} className={iconColor} />
                                        <span className="text-sm font-medium text-gray-900">{line.charge.label}</span>
                                        <span className="ml-1 text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-px">{line.charge.frequency}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {line.status === 'new' ? (
                                        <span className="text-gray-300">—</span>
                                    ) : (
                                        <span className="text-sm font-mono text-gray-700">{formatCurrency(line.charge.amount)}</span>
                                    )}
                                </td>
                                <td className="px-2 py-3 text-center">
                                    <ArrowIcon size={14} className={arrowColor + " mx-auto"} />
                                </td>
                                <td className="px-3 py-3 text-right">
                                    {line.status === 'stopping' ? (
                                        <span className="text-gray-300 line-through">{formatCurrency(line.charge.amount)}</span>
                                    ) : line.status === 'continuing' ? (
                                        <span className="text-sm font-mono text-gray-700">{formatCurrency(line.charge.amount)}</span>
                                    ) : line.status === 'overlap_risk' ? (
                                        <span className="text-sm font-mono font-semibold text-red-700">{formatCurrency(line.proposedAmount!)}</span>
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-mono font-semibold text-green-700">{formatCurrency(line.proposedAmount!)}</span>
                                            {line.status === 'updating' && delta !== 0 && (
                                                <span className={`text-[10px] ${delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {delta > 0 ? '+' : ''}{formatCurrency(delta)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-3 py-3">
                                    <div className="flex flex-col">
                                        {line.status === 'stopping' && (
                                            <>
                                                <span className="text-xs text-gray-500">Ends: {formatLeaseEndDate(line.proposedEndDate!)}</span>
                                                <span className="text-[10px] text-transparent select-none">—</span>
                                            </>
                                        )}
                                        {line.status === 'overlap_risk' && (
                                            <>
                                                <span className="text-xs font-medium text-red-700">Must end: {formatLeaseEndDate(line.proposedEndDate!)}</span>
                                                {line.overlapDays ? <span className="text-[10px] text-red-500">Overlap: {line.overlapDays} day{line.overlapDays !== 1 ? 's' : ''} risk</span> : <span className="text-[10px] text-transparent select-none">—</span>}
                                            </>
                                        )}
                                        {line.status === 'new' && (
                                            <>
                                                <span className="text-xs text-green-700">Starts: {formatLeaseEndDate(proposedChargeStartDate!)}</span>
                                                <span className="text-[10px] text-gray-400">Ongoing</span>
                                            </>
                                        )}
                                        {line.status === 'updating' && (
                                            <>
                                                <span className="text-xs text-gray-500">Current ends: {formatLeaseEndDate(leaseEndDate!)}</span>
                                                <span className="text-[10px] text-blue-600">New starts: {formatLeaseEndDate(proposedChargeStartDate!)}</span>
                                            </>
                                        )}
                                        {line.status === 'continuing' && (
                                            <>
                                                <span className="text-xs text-gray-400">Continues from {formatLeaseEndDate(proposedChargeStartDate!)}</span>
                                                <span className="text-[10px] text-transparent select-none">—</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-3 text-center">
                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${badgeDotColor}`} />
                                        {statusText}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
