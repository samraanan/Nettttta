import { STATUS, STATUS_LABELS, STATUS_COLORS } from '../../lib/constants';
import { cn } from '../../lib/utils';

const STATUS_FLOW = [
    STATUS.NEW,
    STATUS.IN_PROGRESS,
    STATUS.WAITING,
    STATUS.RESOLVED,
    STATUS.CLOSED
];

export function StatusControl({ currentStatus, onStatusChange, loading }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">שינוי סטטוס</label>
            <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map(status => (
                    <button
                        key={status}
                        onClick={() => onStatusChange(status)}
                        disabled={loading || status === currentStatus}
                        className={cn(
                            'px-3 py-1.5 rounded-lg text-xs font-medium transition',
                            status === currentStatus
                                ? `${STATUS_COLORS[status]} ring-2 ring-offset-1 ring-current`
                                : 'bg-muted text-muted-foreground hover:bg-muted/80',
                            loading && 'opacity-50 cursor-not-allowed'
                        )}
                    >
                        {STATUS_LABELS[status]}
                    </button>
                ))}
            </div>
        </div>
    );
}
