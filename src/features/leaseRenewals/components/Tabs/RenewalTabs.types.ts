export type RenewalTab =
    | 'active'
    | 'pending_offers'
    | 'completed'
    | 'settings'

export interface RenewalTabConfig {
    id: RenewalTab
    label?: string           // undefined = icon-only tab
    icon?: string            // lucide icon name, shown for settings tab
    count?: number           // optional badge count shown next to label
    ariaLabel: string
}

export interface RenewalTabsProps {
    activeTab: RenewalTab
    onChange: (tab: RenewalTab) => void
    counts: Partial<Record<RenewalTab, number>>
}
