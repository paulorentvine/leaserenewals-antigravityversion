import React from 'react';
import { ArrowRight, CalendarCheck, TrendingUp } from 'lucide-react';
import { formatCurrency, formatLeaseEndDate } from '../../utils';

interface NetChangeSummaryProps {
    currentPrimaryRent: number;
    newProposedRent: number;
    netMonthlyChange: number;
    proposedChargeStartDate: string;
    isBulk?: boolean;
    bulkItemCount?: number;
}

export const NetChangeSummary: React.FC<NetChangeSummaryProps> = ({
    currentPrimaryRent,
    newProposedRent,
    netMonthlyChange,
    proposedChargeStartDate,
    isBulk,
    bulkItemCount,
}) => {
    if (isBulk && bulkItemCount) {
        return (
            <div className="bg-gray-50 rounded-[var(--radius-100)] border border-gray-200 px-4 py-3">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-[var(--radius-075)] border border-gray-200 px-3 py-2 text-center">
                        <div className="text-base font-semibold text-gray-900">{bulkItemCount}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">renewals affected</div>
                    </div>
                    <div className="bg-white rounded-[var(--radius-075)] border border-gray-200 px-3 py-2 text-center">
                        <div className={`text-base font-semibold ${netMonthlyChange > 0 ? 'text-green-700' : netMonthlyChange < 0 ? 'text-red-700' : 'text-gray-900'}`}>
                            {netMonthlyChange > 0 ? '+' : ''}{formatCurrency(Math.abs(netMonthlyChange))}/mo
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                            {netMonthlyChange > 0 ? 'total increase' : netMonthlyChange < 0 ? 'total decrease' : 'net change'}
                        </div>
                    </div>
                    <div className="bg-white rounded-[var(--radius-075)] border border-gray-200 px-3 py-2 text-center">
                        <div className={`text-base font-semibold ${netMonthlyChange > 0 ? 'text-green-700' : netMonthlyChange < 0 ? 'text-red-700' : 'text-gray-900'}`}>
                            {netMonthlyChange > 0 ? '+' : ''}{formatCurrency(Math.abs(netMonthlyChange * 12))}/yr
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">annual impact</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 rounded-[var(--radius-100)] border border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Current Rent</span>
                    <span className="text-lg font-mono font-semibold text-gray-900">{formatCurrency(currentPrimaryRent)}</span>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <ArrowRight size={20} className="text-gray-400" />
                    <div className={`mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${netMonthlyChange > 0 ? 'bg-green-100 text-green-700' :
                            netMonthlyChange < 0 ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-500'
                        }`}>
                        {netMonthlyChange > 0 ? '+' : ''}{formatCurrency(netMonthlyChange)}/mo
                        {netMonthlyChange === 0 && 'No change'}
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 uppercase tracking-wider">New Rent</span>
                    <span className={`text-lg font-mono font-semibold ${netMonthlyChange > 0 ? 'text-green-700' :
                            netMonthlyChange < 0 ? 'text-red-600' :
                                'text-gray-900'
                        }`}>
                        {formatCurrency(newProposedRent)}
                    </span>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 mt-3 pt-3">
                <div className="text-xs text-gray-500 flex items-center">
                    <CalendarCheck size={12} className="mr-1 text-gray-400" />
                    Effective from {formatLeaseEndDate(proposedChargeStartDate)}
                </div>

                {netMonthlyChange !== 0 && (
                    <div className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center font-medium">
                        <TrendingUp size={11} className="mr-1 inline" />
                        Annual impact: {formatCurrency(Math.abs(netMonthlyChange * 12))}/yr
                    </div>
                )}
            </div>
        </div>
    );
};
