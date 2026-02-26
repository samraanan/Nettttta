import { PRIORITY_LABELS, PRIORITY_COLORS } from '../../lib/constants';
import { cn } from '../../lib/utils';

export function PriorityBadge({ priority, size = 'sm' }) {
    const label = priority ? (PRIORITY_LABELS[priority] || priority) : 'לא נקבעה';
    const color = PRIORITY_COLORS[priority] || PRIORITY_COLORS[null];

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
