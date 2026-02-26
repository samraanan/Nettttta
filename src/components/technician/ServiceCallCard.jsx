import { Link } from 'react-router-dom';
import { StatusBadge } from '../shared/StatusBadge';
import { PriorityBadge } from '../shared/PriorityBadge';
import { CategoryIcon, getCategoryLabel } from '../shared/CategoryIcon';
import { MapPin, Clock, Building2, User, ChevronLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '../../lib/utils';

const PRIORITY_BORDER = {
    urgent: 'border-r-red-500',
    high: 'border-r-orange-500',
    medium: 'border-r-yellow-500',
    low: 'border-r-green-500',
};

export function ServiceCallCard({ call, linkPrefix = '/technician/call' }) {
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true, locale: he });
    };

    const borderColor = call.priority ? PRIORITY_BORDER[call.priority] : '';

    return (
        <Link
            to={`${linkPrefix}/${call.id}`}
            className={cn(
                "block bg-card rounded-2xl border shadow-sm hover:shadow-md transition p-4 space-y-3",
                borderColor && `border-r-4 ${borderColor}`
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={call.status} />
                    {call.priority && <PriorityBadge priority={call.priority} />}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        <CategoryIcon category={call.category} className="w-3 h-3" />
                        {getCategoryLabel(call.category)}
                    </span>
                </div>
                <ChevronLeft className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>

            <p className="text-sm text-foreground line-clamp-2">{call.description}</p>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {call.schoolName && (
                    <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {call.schoolName}
                    </span>
                )}
                {call.locationDisplay && (
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {call.locationDisplay}
                    </span>
                )}
                {call.clientName && (
                    <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {call.clientName}
                    </span>
                )}
                {call.createdAt && (
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(call.createdAt)}
                    </span>
                )}
            </div>

            {call.lastHandledByName && (
                <div className="text-xs text-muted-foreground">
                    אחרון שטיפל: <span className="font-medium text-foreground">{call.lastHandledByName}</span>
                </div>
            )}
        </Link>
    );
}
