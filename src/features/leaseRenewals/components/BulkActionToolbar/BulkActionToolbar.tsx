import React, { useState, useRef } from 'react';
import {
    TrendingUp,
    Calendar,
    Send,
    CheckCircle,
    LogOut,
    Check,
    ChevronDown
} from 'lucide-react';
import type { BulkActionToolbarProps } from './BulkActionToolbar.types';
import { ApplyIncreasePopover } from './ApplyIncreasePopover';
import { SetTermPopover } from './SetTermPopover';
import { RenewalStatus, OwnerApprovalStatus } from '../../types';

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({
    selectedCount,
    selectedRenewals,
    onAction,
    onClearSelection
}) => {
    const [increasePopoverOpen, setIncreasePopoverOpen] = useState(false);
    const [termPopoverOpen, setTermPopoverOpen] = useState(false);

    const applyIncreaseButtonRef = useRef<HTMLButtonElement>(null);
    const setTermButtonRef = useRef<HTMLButtonElement>(null);

    const canSendOffers = selectedRenewals.some(r =>
        r.status === RenewalStatus.PENDING || r.status === RenewalStatus.TENANT_RESPONDED
    );

    const canApprove = selectedRenewals.some(r =>
        [OwnerApprovalStatus.PENDING, OwnerApprovalStatus.REQUIRES_ACTION].includes(r.ownerApprovalStatus)
    );

    return (
        <>
            <div
                className={`fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3 bg-gray-900 text-white shadow-[0_-4px_24px_rgba(0,0,0,0.15)] border-t border-gray-800 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${selectedCount > 0 ? 'translate-y-0' : 'translate-y-full'
                    }`}
            >
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded bg-[var(--color-brand)] flex items-center justify-center flex-shrink-0">
                            <Check size={12} className="text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                                {selectedCount} renewal{selectedCount !== 1 ? 's' : ''} selected
                            </span>
                            <span className="text-gray-600">·</span>
                            <button
                                onClick={onClearSelection}
                                className="text-xs font-medium text-gray-400 hover:text-white transition-colors underline-offset-4 hover:underline"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2 relative">
                    {/* Apply Increase Button */}
                    <button
                        ref={applyIncreaseButtonRef}
                        onClick={() => {
                            setIncreasePopoverOpen(!increasePopoverOpen);
                            setTermPopoverOpen(false);
                        }}
                        aria-expanded={increasePopoverOpen}
                        aria-haspopup="true"
                        className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-100)] text-sm font-semibold transition-all ${increasePopoverOpen ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                    >
                        <TrendingUp size={15} />
                        <span>Apply Increase</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${increasePopoverOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Set Term Button */}
                    <button
                        ref={setTermButtonRef}
                        onClick={() => {
                            setTermPopoverOpen(!termPopoverOpen);
                            setIncreasePopoverOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-100)] text-sm font-semibold transition-all ${termPopoverOpen ? 'bg-white text-gray-900 shadow-lg' : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                    >
                        <Calendar size={15} />
                        <span>Set Term</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${termPopoverOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className="w-px h-5 bg-white/20 mx-1" />

                    {/* Send Offers Button */}
                    <button
                        onClick={() => onAction({
                            type: 'send_offers',
                            targetIds: selectedRenewals
                                .filter(r => r.status === RenewalStatus.PENDING || r.status === RenewalStatus.TENANT_RESPONDED)
                                .map(r => r.id)
                        })}
                        disabled={!canSendOffers}
                        title={!canSendOffers ? "All selected renewals have already had offers sent" : undefined}
                        className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-100)] text-sm font-semibold transition-all ${canSendOffers ? 'bg-white/10 hover:bg-white/20 text-white' : 'opacity-30 cursor-not-allowed bg-white/5 grayscale'
                            }`}
                    >
                        <Send size={15} />
                        <span>Send Offers</span>
                    </button>

                    {/* Approve Button */}
                    <button
                        onClick={() => onAction({
                            type: 'approve_owner',
                            targetIds: selectedRenewals
                                .filter(r => [OwnerApprovalStatus.PENDING, OwnerApprovalStatus.REQUIRES_ACTION].includes(r.ownerApprovalStatus))
                                .map(r => r.id)
                        })}
                        disabled={!canApprove}
                        className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-100)] text-sm font-semibold transition-all ${canApprove ? 'bg-white/10 hover:bg-white/20 text-white' : 'opacity-30 cursor-not-allowed bg-white/5 grayscale'
                            }`}
                    >
                        <CheckCircle size={15} />
                        <span>Approve</span>
                    </button>

                    <div className="w-px h-5 bg-white/20 mx-1" />

                    {/* Mark to Vacate Button */}
                    <button
                        onClick={() => onAction({
                            type: 'mark_to_vacate',
                            targetIds: selectedRenewals.map(r => r.id)
                        })}
                        className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-100)] text-sm font-semibold transition-all bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-300 border border-transparent hover:border-red-500/30 group"
                    >
                        <LogOut size={15} className="group-hover:scale-110 transition-transform" />
                        <span>Vacate</span>
                    </button>

                    {/* Popovers */}
                    {increasePopoverOpen && (
                        <ApplyIncreasePopover
                            selectedCount={selectedCount}
                            onApply={(type, value) => {
                                setIncreasePopoverOpen(false);
                                onAction({
                                    type: type === 'percent' ? 'apply_percent_increase' : 'apply_flat_increase',
                                    targetIds: selectedRenewals.map(r => r.id),
                                    payload: type === 'percent' ? { percentIncrease: value } : { flatIncrease: value }
                                });
                            }}
                            onClose={() => setIncreasePopoverOpen(false)}
                            anchorRef={applyIncreaseButtonRef}
                        />
                    )}

                    {termPopoverOpen && (
                        <SetTermPopover
                            selectedCount={selectedCount}
                            selectedRenewals={selectedRenewals}
                            onApply={(term) => {
                                setTermPopoverOpen(false);
                                onAction({
                                    type: 'set_term',
                                    targetIds: selectedRenewals.map(r => r.id),
                                    payload: { term }
                                });
                            }}
                            onClose={() => setTermPopoverOpen(false)}
                            anchorRef={setTermButtonRef}
                        />
                    )}
                </div>
            </div>
        </>
    );
};
