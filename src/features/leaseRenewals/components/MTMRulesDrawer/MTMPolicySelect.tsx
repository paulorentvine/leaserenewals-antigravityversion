import React from 'react';
import { MTMPolicy } from '../../types';
import { CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

interface MTMPolicySelectProps {
    value: MTMPolicy;
    onChange: (policy: MTMPolicy) => void;
    disabled?: boolean;
    showLabels?: boolean;
}

export const MTMPolicySelect: React.FC<MTMPolicySelectProps> = ({
    value,
    onChange,
    disabled = false,
    showLabels = true,
}) => {
    const options = [
        {
            policy: MTMPolicy.ALLOWED,
            title: 'Allowed',
            desc: 'MTM permitted, no premium',
            icon: <CheckCircle size={16} className="text-green-600" />,
            iconBg: 'bg-green-100',
            activeBorder: 'border-[var(--color-brand)]',
            activeBg: 'bg-green-50',
        },
        {
            policy: MTMPolicy.FORBIDDEN,
            title: 'Forbidden',
            desc: 'MTM not allowed, force renewal',
            icon: <XCircle size={16} className="text-red-600" />,
            iconBg: 'bg-red-100',
            activeBorder: 'border-red-500',
            activeBg: 'bg-red-50',
        },
        {
            policy: MTMPolicy.PREMIUM,
            title: 'Premium',
            desc: 'MTM permitted with fee',
            icon: <TrendingUp size={16} className="text-amber-600" />,
            iconBg: 'bg-amber-100',
            activeBorder: 'border-amber-500',
            activeBg: 'bg-amber-50',
        },
        {
            policy: MTMPolicy.CONDITIONAL,
            title: 'Conditional',
            desc: 'MTM if no response by deadline',
            icon: <Clock size={16} className="text-blue-600" />,
            iconBg: 'bg-blue-100',
            activeBorder: 'border-blue-500',
            activeBg: 'bg-blue-50',
        },
    ];

    const handleKeyDown = (e: React.KeyboardEvent, policy: MTMPolicy) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) onChange(policy);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Month-to-Month Policy">
            {options.map(opt => {
                const isSelected = value === opt.policy;
                return (
                    <div
                        key={opt.policy}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={disabled ? -1 : 0}
                        onClick={() => !disabled && onChange(opt.policy)}
                        onKeyDown={(e) => handleKeyDown(e, opt.policy)}
                        className={`
                            cursor-pointer rounded-[var(--radius-100)] border-2 p-3 transition-all duration-150 flex items-start gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-1
                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                            ${isSelected ? `${opt.activeBorder} ${opt.activeBg}` : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                        `}
                    >
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${opt.iconBg}`}>
                            {opt.icon}
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900">{opt.title}</div>
                            {showLabels && <div className="text-[11px] text-gray-500 mt-0.5">{opt.desc}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
