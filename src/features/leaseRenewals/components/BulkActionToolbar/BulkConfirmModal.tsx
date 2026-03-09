import React, { useEffect } from 'react';
import {
    Send,
    CheckCircle,
    LogOut,
    TrendingUp,
    Calendar,
    AlertTriangle,
    Info,
    X
} from 'lucide-react';
import type { BulkConfirmModalProps } from './BulkActionToolbar.types';
import { formatCurrency } from '../../utils';
import { TERM_OPTIONS } from '../../constants';

export const BulkConfirmModal: React.FC<BulkConfirmModalProps> = ({
    variant,
    selectedCount,
    payload,
    onConfirm,
    onCancel
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    const config = {
        send_offers: {
            Icon: Send,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            title: 'Send Renewal Offers',
            summary: `You're about to send renewal offers to ${selectedCount} tenant(s). Each tenant will receive an email with a one-click accept/decline option.`,
            confirmLabel: 'Send Offers',
            confirmColor: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
        },
        approve_owner: {
            Icon: CheckCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            title: "Approve on Owner's Behalf",
            summary: `You're approving these ${selectedCount} renewal(s) on behalf of the property owner. This action will be logged in the audit trail.`,
            confirmLabel: 'Approve Renewals',
            confirmColor: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
        },
        mark_to_vacate: {
            Icon: LogOut,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            title: 'Mark as Vacating',
            summary: `This will mark ${selectedCount} lease(s) as vacating. The tenant will not receive a renewal offer. This can be undone.`,
            confirmLabel: 'Mark as Vacating',
            confirmColor: 'bg-red-600 hover:bg-red-700'
        },
        apply_increase: {
            Icon: TrendingUp,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            title: 'Apply Rent Increase',
            summary: `The following rent changes will be applied to ${selectedCount} renewal(s):`,
            confirmLabel: 'Apply Increase',
            confirmColor: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
        },
        set_term: {
            Icon: Calendar,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            title: 'Set Lease Term',
            summary: `The lease term will be set to '${TERM_OPTIONS.find(o => o.value === payload?.term)?.label || payload?.term}' for ${selectedCount} renewal(s):`,
            confirmLabel: 'Set Term',
            confirmColor: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
        }
    }[variant];

    const { Icon, iconBg, iconColor, title, summary, confirmLabel, confirmColor } = config;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-[var(--radius-200)] shadow-[var(--shadow-xl)] w-full max-w-[480px] max-h-[80vh] overflow-hidden flex flex-col animate-in scale-in-95 fade-in duration-150 ease-out">
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className={`${iconBg} ${iconColor} w-10 h-10 rounded-full flex items-center justify-center`}>
                            <Icon size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 ml-3">{title}</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-5 flex-1 overflow-y-auto">
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{summary}</p>

                    {/* Affected renewals list for increase and term */}
                    {(variant === 'apply_increase' || variant === 'set_term') && payload?.affectedRenewals && (
                        <div className="bg-gray-50 rounded-[var(--radius-100)] border border-gray-100 divide-y divide-gray-100 overflow-hidden mt-4">
                            <div className="max-h-[200px] overflow-y-auto">
                                {payload.affectedRenewals.map((r, idx) => (
                                    <div key={idx} className="px-3 py-3 flex items-center justify-between">
                                        <div className="min-w-0 flex-1">
                                            <div className="text-sm font-semibold text-gray-900 truncate">{r.tenantName}</div>
                                            <div className="text-[11px] text-gray-400 mt-0.5 truncate">{r.address}</div>
                                        </div>
                                        {variant === 'apply_increase' && (
                                            <div className="ml-4 text-right shrink-0">
                                                <div className="text-sm font-mono text-gray-900">
                                                    {formatCurrency(r.currentRent)} → {formatCurrency(r.newRent)}
                                                </div>
                                                <div className="text-[11px] font-bold text-green-700">
                                                    (+{((r.newRent / r.currentRent - 1) * 100).toFixed(1)}%)
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {variant === 'mark_to_vacate' && (
                        <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[var(--radius-100)] px-4 py-3">
                            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-800 leading-normal">
                                <span className="font-bold block mb-0.5">Note on Move-out Processing</span>
                                Marking as vacating does not cancel the lease automatically. You will need to process the move-out separately.
                            </div>
                        </div>
                    )}

                    {variant === 'approve_owner' && (
                        <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-[var(--radius-100)] px-4 py-3">
                            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-800 leading-normal">
                                <span className="font-bold block mb-0.5">Bypassing Owner Approval</span>
                                Owners will still be notified via email. This bypasses the owner portal approval step.
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 pb-6 pt-4 flex gap-3 justify-end bg-gray-50/50">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-[var(--radius-100)] hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        autoFocus
                        className={`px-5 py-2.5 text-sm font-semibold text-white rounded-[var(--radius-100)] transition-all active:scale-95 shadow-sm ${confirmColor}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
