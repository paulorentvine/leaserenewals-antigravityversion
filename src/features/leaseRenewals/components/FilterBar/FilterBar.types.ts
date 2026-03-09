import type { RenewalFilters } from '../../types';

export interface FilterDropdownOption<T = string> {
    value: T;
    label: string;
}

export interface FilterDropdownProps<T = string> {
    label: string;              // button label when nothing selected
    value?: T;
    options: FilterDropdownOption<T>[];
    onChange: (value: T | undefined) => void;
    icon?: string;              // lucide icon shown in button, default: 'chevron-down'
    placeholder?: string;
    clearable?: boolean;        // show X to clear selection
}

export interface FilterBarProps {
    filters: RenewalFilters;
    onChange: (filters: RenewalFilters) => void;
    onReset: () => void;
    onSaveView: () => void;
    portfolioOptions: FilterDropdownOption[];
}
