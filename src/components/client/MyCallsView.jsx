import { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { StatusBadge } from '../shared/StatusBadge';
import { PriorityBadge } from '../shared/PriorityBadge';
import { CategoryIcon, getCategoryLabel } from '../shared/CategoryIcon';
import { MapPin, Clock, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

export function MyCallsView({ user }) {
    const [calls, setCalls] = useState([]);
    const [expandedCall, setExpandedCall] = useState(null);

    useEffect(() => {
        if (!user.schoolId || !user.uid) return;
        const unsub = storageService.subscribeToCallsByClient(user.schoolId, user.uid, setCalls);
        return () => unsub();
    }, [user.schoolId, user.uid]);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true, locale: he });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">הפניות שלי</h1>
                <p className="text-sm text-muted-foreground mt-1">{calls.length} פניות</p>
            </div>

            {calls.length === 0 ? (
                <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">אין פניות עדיין</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {calls.map(call => (
                        <div key={call.id} className="bg-card rounded-2xl border shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedCall(expandedCall === call.id ? null : call.id)}
                                className="w-full text-right p-4 hover:bg-muted/30 transition"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <CategoryIcon category={call.category} showLabel className="w-4 h-4" />
                                            <StatusBadge status={call.status} />
                                            {call.priority && <PriorityBadge priority={call.priority} />}
                                        </div>
                                        <p className="text-sm text-foreground line-clamp-2">{call.description}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            {call.locationDisplay && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {call.locationDisplay}
                                                </span>
                                            )}
                                            {call.createdAt && (
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(call.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {expandedCall === call.id ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                                    )}
                                </div>
                            </button>

                            {expandedCall === call.id && (
                                <div className="border-t px-4 py-3 space-y-3 bg-muted/20">
                                    {call.lastHandledByName && (
                                        <div className="text-xs">
                                            <span className="text-muted-foreground">אחרון שטיפל: </span>
                                            <span className="font-medium">{call.lastHandledByName}</span>
                                        </div>
                                    )}
                                    {call.notes && call.notes.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-muted-foreground">הערות טיפול:</h4>
                                            {call.notes.map(note => (
                                                <div key={note.id} className="bg-white rounded-lg p-2.5 text-xs space-y-1">
                                                    <div className="flex justify-between">
                                                        <span className="font-medium">{note.techName}</span>
                                                        <span className="text-muted-foreground">{formatTime(note.timestamp)}</span>
                                                    </div>
                                                    <p>{note.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {call.history && call.history.length > 0 && (
                                        <div className="space-y-1.5">
                                            <h4 className="text-xs font-medium text-muted-foreground">היסטוריה:</h4>
                                            {call.history.slice().reverse().map(h => (
                                                <div key={h.id} className="text-xs text-muted-foreground flex justify-between">
                                                    <span>{h.description} ({h.performedByName})</span>
                                                    <span>{formatTime(h.timestamp)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
