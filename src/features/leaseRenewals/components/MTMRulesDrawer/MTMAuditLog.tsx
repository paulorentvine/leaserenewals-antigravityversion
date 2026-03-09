import React from 'react';
import { Download, ClipboardList, Settings, User, ArrowRight } from 'lucide-react';
import type { MTMAuditEntry } from '../../types';

interface MTMAuditLogProps {
    entries: MTMAuditEntry[];
}

export const MTMAuditLog: React.FC<MTMAuditLogProps> = ({ entries }) => {
    const handleExport = () => {
        if (entries.length === 0) return;
        const headers = 'Timestamp,Actor,Action,Previous Value,New Value\n';
        const rows = entries.map(e => {
            const row = [
                e.timestamp,
                `"${e.actor.replace(/"/g, '""')}"`,
                `"${e.action.replace(/"/g, '""')}"`,
                `"${(e.previousValue || '').replace(/"/g, '""')}"`,
                `"${(e.newValue || '').replace(/"/g, '""')}"`,
            ];
            return row.join(',');
        }).join('\n');
        const csv = headers + rows;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `mtm_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <h3 className="text-sm font-semibold text-gray-900">Audit Log</h3>
                    <span className="text-xs text-gray-400 ml-2">
                        {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
                    </span>
                </div>
                <button
                    onClick={handleExport}
                    disabled={entries.length === 0}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Download size={13} /> Export CSV
                </button>
            </div>

            {entries.length === 0 ? (
                <div className="text-center py-12">
                    <ClipboardList size={32} className="text-gray-200 mx-auto mb-2" />
                    <div className="text-sm text-gray-400">No changes recorded yet</div>
                    <div className="text-xs text-gray-400">Rule changes will appear here after saving.</div>
                </div>
            ) : (
                <div className="relative">
                    {entries.map((entry, idx) => {
                        const isSystem = entry.actor === 'System';
                        const isLast = idx === entries.length - 1;
                        const dateObj = new Date(entry.timestamp);
                        const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        const displayTime = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

                        return (
                            <div key={entry.id} className="relative pl-6 pb-4">
                                {!isLast && (
                                    <div className="absolute left-[9px] top-5 w-px h-full bg-gray-100" />
                                )}

                                <div className={`absolute left-0 top-1.5 w-[18px] h-[18px] rounded-full border-2 border-white flex items-center justify-center ${isSystem ? 'bg-gray-100' : 'bg-[var(--color-brand)]/10'}`}>
                                    {isSystem ? (
                                        <Settings size={10} className="text-gray-500" />
                                    ) : (
                                        <User size={10} className="text-[var(--color-brand)]" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-gray-700">{entry.actor}</span>
                                        <span className="text-[10px] text-gray-400">{displayDate} at {displayTime}</span>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-0.5">{entry.action}</div>

                                    {(entry.previousValue || entry.newValue) && (
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                            {entry.previousValue && (
                                                <div className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded-[var(--radius-025)] font-mono line-through opacity-70 break-all">
                                                    {entry.previousValue}
                                                </div>
                                            )}
                                            {entry.previousValue && entry.newValue && (
                                                <ArrowRight size={10} className="text-gray-400 shrink-0" />
                                            )}
                                            {entry.newValue && (
                                                <div className="bg-green-50 text-green-700 text-[10px] px-2 py-0.5 rounded-[var(--radius-025)] font-mono break-all">
                                                    {entry.newValue}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
