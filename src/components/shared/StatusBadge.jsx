import { STATUS_LABELS, STATUS_COLORS } from '../../lib/constants';
import { cn } from '../../lib/utils';

export function StatusBadge({ status, size = 'sm' }) {
    const label = STATUS_LABELS[status] || status;
    const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';

    return (
        <span className={cn(
            'inline-flex items-center rounded-full font-medium',
            color,
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
        )}>
            {label}
        </span>
    );
}
