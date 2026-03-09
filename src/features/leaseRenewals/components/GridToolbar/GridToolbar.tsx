import React from 'react';
import { Columns, ChevronDown } from 'lucide-react';

interface GridToolbarProps {
    totalCount: number;
    filteredCount: number;
    selectedCount: number;
    onEditColumns: () => void;
}

export const GridToolbar: React.FC<GridToolbarProps> = ({
    totalCount,
    filteredCount,
    selectedCount,
    onEditColumns
}) => {
    const isFiltered = filteredCount < totalCount;

    return (
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 min-h-[44px]">
            {/* Left: Counts */}
            <div className="flex items-center gap-1.5 text-sm">
                {selectedCount > 0 && (
                    <>
                        <span className="font-semibold text-neutral">{selectedCount} selected</span>
                        <span className="text-gray-300">·</span>
                    </>
                )}
                <span className="text-neutral-muted">
                    {isFiltered
                        ? `Showing ${filteredCount} of ${totalCount} renewals`
                        : `Showing ${totalCount} renewals`}
                </span>
            </div>

            {/* Right: Column Controls */}
            <button
                onClick={onEditColumns}
                className="flex items-center gap-1.5 rounded-[var(--radius-050)] border border-transparent px-2 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
            >
                <Columns size={14} />
                <span>Edit Columns</span>
                <ChevronDown size={14} className="text-gray-400" />
            </button>
        </div>
    );
};
