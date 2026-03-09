import React, { useState, useEffect, useRef } from 'react';
import {
    FlaskConical, ChevronUp, X, RotateCcw,
    LayoutGrid, AlarmClock, AlertTriangle, GraduationCap,
    GitBranch, UserCheck, Send, LogOut
} from 'lucide-react';
import { MOCK_SCENARIOS } from '../../mockScenarios';
import { MOCK_TODAY } from '../../mockData';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
    'layout-grid': LayoutGrid,
    'alarm-clock': AlarmClock,
    'alert-triangle': AlertTriangle,
    'graduation-cap': GraduationCap,
    'git-branch': GitBranch,
    'user-check': UserCheck,
    'send': Send,
    'flask-conical': FlaskConical,
    'log-out': LogOut,
};

interface DevToolbarProps {
    activeScenarioId: string;
    onScenarioChange: (id: string) => void;
    stats: { total: number; overlapRisks: number; urgentCount: number };
}

export const DevToolbar: React.FC<DevToolbarProps> = ({
    activeScenarioId,
    onScenarioChange,
    stats,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const panelRef = useRef<HTMLDivElement>(null);

    const activeScenario = MOCK_SCENARIOS.find(s => s.id === activeScenarioId);
    const truncatedLabel = (activeScenario?.label ?? 'All').slice(0, 14);

    useEffect(() => {
        if (!expanded) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setExpanded(false);
            }
        };
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setExpanded(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [expanded]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!expanded) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(prev => (prev + 1) % MOCK_SCENARIOS.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => (prev - 1 + MOCK_SCENARIOS.length) % MOCK_SCENARIOS.length);
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
            e.preventDefault();
            onScenarioChange(MOCK_SCENARIOS[focusedIndex].id);
            setExpanded(false);
        }
    };

    return (
        <div ref={panelRef} className="fixed bottom-4 left-4 z-[100]" onKeyDown={handleKeyDown}>
            {/* Expanded Panel */}
            {expanded && (
                <div className="bg-gray-900 rounded-[var(--radius-150)] border border-gray-700 shadow-[var(--shadow-xl)] w-[320px] mb-2 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex items-center">
                            <FlaskConical size={14} className="text-amber-400 mr-2" />
                            <span className="text-xs font-semibold text-white">Scenario Switcher</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-400 font-mono">{stats.total} total</span>
                            <span className="text-[10px] text-gray-400 font-mono">{stats.overlapRisks} overlaps</span>
                            <span className="text-[10px] text-gray-400 font-mono">{stats.urgentCount} urgent</span>
                            <button
                                onClick={() => setExpanded(false)}
                                className="text-gray-500 hover:text-white ml-1 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Scenario List */}
                    <div className="max-h-[340px] overflow-y-auto py-2 space-y-0.5 px-2">
                        {MOCK_SCENARIOS.map((scenario, idx) => {
                            const isActive = scenario.id === activeScenarioId;
                            const isFocused = idx === focusedIndex;
                            const Icon = ICON_MAP[scenario.icon] || FlaskConical;
                            const count = scenario.getRenewals().length;

                            return (
                                <button
                                    key={scenario.id}
                                    onClick={() => {
                                        onScenarioChange(scenario.id);
                                        setExpanded(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-075)]
                    cursor-pointer transition-colors duration-100 text-left outline-none
                    ${isActive ? 'bg-gray-700' : isFocused ? 'bg-gray-800' : 'hover:bg-gray-800'}
                  `}
                                >
                                    <Icon size={14} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                            {scenario.label}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[200px]">
                                            {scenario.description}
                                        </div>
                                    </div>
                                    <span className="bg-gray-800 rounded-full px-2 py-0.5 text-[10px] text-gray-400 font-mono shrink-0">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 font-mono">MOCK_TODAY: {MOCK_TODAY}</span>
                        <button
                            onClick={() => {
                                onScenarioChange('full');
                                setExpanded(false);
                            }}
                            className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                        >
                            <RotateCcw size={10} />
                            Reset All
                        </button>
                    </div>
                </div>
            )}

            {/* Collapsed Pill */}
            <button
                onClick={() => {
                    setExpanded(!expanded);
                    setFocusedIndex(-1);
                }}
                className="bg-gray-900 text-white rounded-full px-3 py-1.5 flex items-center gap-2 text-xs font-medium font-mono shadow-[var(--shadow-lg)] hover:bg-gray-800 cursor-pointer transition-colors border border-gray-700"
            >
                <FlaskConical size={13} className="text-amber-400" />
                DEV
                <span className="text-gray-500">·</span>
                <span className="text-gray-300 truncate max-w-[100px]">{truncatedLabel}</span>
                <ChevronUp size={11} className={`text-gray-400 transition-transform duration-200 ${expanded ? '' : 'rotate-180'}`} />
            </button>
        </div>
    );
};
