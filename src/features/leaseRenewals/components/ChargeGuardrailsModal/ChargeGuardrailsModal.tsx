import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, AlertTriangle, X, CalendarClock, Shield, Zap } from 'lucide-react';
import type { ChargeGuardrailsModalProps, BulkChargeGuardrailPayload, ChargeGuardrailPayload } from './ChargeGuardrailsModal.types';
import { OverlapWarningBanner } from './OverlapWarningBanner';
import { ChargeComparisonTable } from './ChargeComparisonTable';
import { NetChangeSummary } from './NetChangeSummary';
import { formatLeaseEndDate } from '../../utils';

export const ChargeGuardrailsModal: React.FC<ChargeGuardrailsModalProps> = ({
    payload,
    onConfirm,
    onCancel,
}) => {
    const isBulk = payload.trigger === 'bulk_apply';
    const singlePayload = !isBulk ? payload as ChargeGuardrailPayload : null;
    const bulkPayload = isBulk ? payload as BulkChargeGuardrailPayload : null;

    const [confirmedIds, setConfirmedIds] = useState<string[]>(
        isBulk ? bulkPayload!.items.map(i => i.renewal.id) : [singlePayload!.renewal.id]
    );

    const cancelRef = useRef<HTMLButtonElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (cancelRef.current) {
            cancelRef.current.focus();
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };

        const handleTab = (e: KeyboardEvent) => {
            if (e.key === 'Tab' && modalRef.current) {
                const focusableNodes = modalRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableNodes[0] as HTMLElement;
                const lastElement = focusableNodes[focusableNodes.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.addEventListener('keydown', handleTab);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('keydown', handleTab);
        };
    }, [onCancel]);


    const hasOverlapRisk = isBulk
        ? bulkPayload!.totalOverlapRisks > 0
        : singlePayload!.hasOverlapRisk;

    const totalOverlapRisks = isBulk
        ? bulkPayload!.totalOverlapRisks
        : singlePayload!.overlapCount;

    const itemCount = isBulk ? bulkPayload!.items.length : 1;

    let title = "Review Charge Transition";
    if (isBulk) {
        title = `Review ${itemCount} Charge Transitions`;
    }

    let subtitle = "";
    if (isBulk) {
        if (hasOverlapRisk) {
            subtitle = `${totalOverlapRisks} overlap risk${totalOverlapRisks !== 1 ? 's' : ''} require your attention.`;
        } else {
            subtitle = `All ${itemCount} transitions look clean.`;
        }
    } else {
        if (hasOverlapRisk) {
            subtitle = "Overlap risk detected — review before confirming.";
        } else {
            subtitle = "Confirm the billing changes for this renewal.";
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-start justify-center pt-[5vh] px-4 pb-4 overflow-y-auto animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guardrail-modal-title"
        >
            <div
                ref={modalRef}
                className={`bg-white rounded-[var(--radius-200)] shadow-[var(--shadow-xl)] w-full overflow-hidden flex flex-col transform transition-all animate-in zoom-in-95 duration-200 ${isBulk ? 'max-w-[800px]' : 'max-w-[640px]'}`}
            >
                {/* HEADER */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between">
                    <div className="flex items-start">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${hasOverlapRisk ? 'bg-red-100' : 'bg-blue-100'}`}>
                            {hasOverlapRisk ? <AlertTriangle size={20} className="text-red-600" /> : <ShieldCheck size={20} className="text-blue-600" />}
                        </div>
                        <div className="ml-3">
                            <h2 id="guardrail-modal-title" className="text-base font-semibold text-gray-900">{title}</h2>
                            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 rounded-[var(--radius-075)] flex items-center justify-center hover:bg-gray-100 ml-auto shrink-0 transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} className="text-gray-400 hover:text-gray-600" />
                    </button>
                </div>

                {/* BODY */}
                <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* SINGLE RENEWAL VIEW */}
                    {!isBulk && singlePayload && (
                        <>
                            <OverlapWarningBanner
                                overlapCount={singlePayload.overlapCount}
                                affectedChargeLabels={singlePayload.chargeAnalysis.filter(l => l.status === 'overlap_risk').map(l => l.charge.label)}
                                proposedFixDate={(() => {
                                    const fixDate = new Date(singlePayload.proposedChargeStartDate);
                                    fixDate.setDate(fixDate.getDate() - 1);
                                    return fixDate.toISOString().split('T')[0];
                                })()}
                            />

                            <div className="bg-gray-50 rounded-[var(--radius-100)] px-4 py-3 flex items-center justify-between border border-gray-100">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{singlePayload.renewal.property.address}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {singlePayload.renewal.tenant.firstName} {singlePayload.renewal.tenant.lastName}
                                    </div>
                                    <div className="mt-1 flex items-center text-xs text-gray-500">
                                        <CalendarClock size={11} className="inline mr-1 text-gray-400" />
                                        Lease ends {formatLeaseEndDate(singlePayload.renewal.leaseEndDate)}
                                    </div>
                                </div>
                                <div className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full whitespace-nowrap border border-gray-200 shadow-sm">
                                    {singlePayload.renewal.property.portfolioName}
                                </div>
                            </div>

                            <NetChangeSummary
                                currentPrimaryRent={singlePayload.currentPrimaryRent}
                                newProposedRent={singlePayload.newProposedRent}
                                netMonthlyChange={singlePayload.netMonthlyChange}
                                proposedChargeStartDate={singlePayload.proposedChargeStartDate}
                            />

                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">Recurring Charges</h3>
                                <p className="text-xs text-gray-400 mb-3">{singlePayload.chargeAnalysis.length} charge{singlePayload.chargeAnalysis.length !== 1 ? 's' : ''} affected by this transition</p>

                                <ChargeComparisonTable
                                    lines={singlePayload.chargeAnalysis}
                                    leaseEndDate={singlePayload.renewal.leaseEndDate}
                                    proposedChargeStartDate={singlePayload.proposedChargeStartDate}
                                />
                            </div>

                            {hasOverlapRisk && (
                                <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-[var(--radius-100)] px-3 py-2.5">
                                    <Zap size={14} className="text-amber-500 flex-shrink-0 mt-px" />
                                    <p className="text-xs text-amber-800 leading-tight">
                                        Confirming will automatically set end dates on overlapping charges to {(() => {
                                            const fixDate = new Date(singlePayload.proposedChargeStartDate);
                                            fixDate.setDate(fixDate.getDate() - 1);
                                            return formatLeaseEndDate(fixDate.toISOString().split('T')[0]);
                                        })()}. These changes will be logged in the audit trail.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* BULK RENEWALS VIEW */}
                    {isBulk && bulkPayload && (
                        <>
                            {totalOverlapRisks > 0 && (
                                <div className="rounded-[var(--radius-100)] border bg-red-50 border-red-200 px-4 py-3 flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertTriangle size={16} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-red-900">
                                            Billing Overlaps Detected
                                        </h4>
                                        <p className="text-sm text-red-800 mt-1">
                                            {totalOverlapRisks} of {itemCount} renewals have overlap risks that will be auto-resolved on confirm.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <NetChangeSummary
                                currentPrimaryRent={0} // not used in bulk summary card
                                newProposedRent={0} // not used
                                netMonthlyChange={bulkPayload.totalNetChange}
                                proposedChargeStartDate={bulkPayload.items[0]?.proposedChargeStartDate || ''}
                                isBulk={true}
                                bulkItemCount={itemCount}
                            />

                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-1">Renewals Status</h3>
                                <p className="text-xs text-gray-400 mb-3">Review and adjust the renewals to transition.</p>

                                <ChargeComparisonTable
                                    bulkPayload={bulkPayload}
                                    bulkConfirmedIds={confirmedIds}
                                    onBulkSelectionChange={setConfirmedIds}
                                />
                            </div>

                            {confirmedIds.length < itemCount && (
                                <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded border border-amber-200 text-center font-medium shadow-sm">
                                    {itemCount - confirmedIds.length} renewal{itemCount - confirmedIds.length !== 1 ? 's' : ''} will be skipped and reverted to previous rent.
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-6 pb-6 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Shield size={12} className="shrink-0" />
                        All changes are logged to the audit trail
                    </div>

                    <div className="flex gap-3 ml-auto">
                        <button
                            ref={cancelRef}
                            onClick={onCancel}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-[var(--radius-100)] hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 focus:ring-2 focus:ring-gray-200 outline-none shadow-sm"
                        >
                            Cancel — Revert Changes
                        </button>

                        <button
                            onClick={() => onConfirm(confirmedIds)}
                            disabled={confirmedIds.length === 0}
                            className={`
                                px-4 py-2.5 text-sm font-medium text-white shadow-sm
                                rounded-[var(--radius-100)] transition-colors duration-150 focus:ring-2 focus:ring-offset-1 focus:ring-[var(--color-primary)] outline-none disabled:opacity-50 disabled:cursor-not-allowed
                                ${hasOverlapRisk
                                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
                                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                                }
                            `}
                        >
                            {hasOverlapRisk && <ShieldCheck size={15} className="inline mr-1.5 shrink-0" />}
                            {isBulk && confirmedIds.length < itemCount ? `Confirm ${confirmedIds.length} of ${itemCount}` : (hasOverlapRisk ? "Confirm & Fix Overlaps" : "Confirm Transition")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
