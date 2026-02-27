import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Building2, User, Phone, Mail, Send, MessageSquare, Package } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { he } from 'date-fns/locale';
import { storageService } from '../../services/storage';
import { StatusBadge } from '../shared/StatusBadge';
import { PriorityBadge } from '../shared/PriorityBadge';
import { CategoryIcon, getCategoryLabel } from '../shared/CategoryIcon';
import { StatusControl } from './StatusControl';
import { SendMessageModal } from './SendMessageModal';
import { EquipmentSupplyModal } from './EquipmentSupplyModal';
import { PRIORITY, PRIORITY_LABELS, PRIORITY_COLORS, DEFAULT_CATEGORIES } from '../../lib/constants';

export function CallDetailView({ user, canEditStatus = true, canEditPriority = true, canAddNotes = true }) {
    const { callId } = useParams();
    const navigate = useNavigate();
    const [call, setCall] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [priorityLoading, setPriorityLoading] = useState(false);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [noteLoading, setNoteLoading] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [showEquipment, setShowEquipment] = useState(false);

    useEffect(() => {
        if (!callId) return;
        const unsub = storageService.subscribeToCall(callId, setCall);
        return () => unsub();
    }, [callId]);

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        return formatDistanceToNow(date, { addSuffix: true, locale: he });
    };

    const formatFullDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'dd/MM/yyyy HH:mm', { locale: he });
    };

    const handleStatusChange = async (newStatus) => {
        setStatusLoading(true);
        try {
            await storageService.updateCallStatus(callId, newStatus, user.uid, user.displayName);
        } catch (err) {
            console.error('Error updating status:', err);
        } finally {
            setStatusLoading(false);
        }
    };

    const handlePriorityChange = async (priority) => {
        setPriorityLoading(true);
        try {
            await storageService.updateCallPriority(callId, priority, user.uid, user.displayName);
        } catch (err) {
            console.error('Error updating priority:', err);
        } finally {
            setPriorityLoading(false);
        }
    };

    const handleCategoryChange = async (newCategory) => {
        setCategoryLoading(true);
        try {
            await storageService.updateCallCategory(callId, newCategory, user.uid, user.displayName);
        } catch (err) {
            console.error('Error updating category:', err);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        setNoteLoading(true);
        try {
            await storageService.addNote(callId, noteText.trim(), user.uid, user.displayName);
            setNoteText('');
        } catch (err) {
            console.error('Error adding note:', err);
        } finally {
            setNoteLoading(false);
        }
    };

    if (!call) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Back button */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <ArrowRight className="w-4 h-4" />
                חזרה
            </button>

            {/* Header */}
            <div className="bg-card rounded-2xl border p-4 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={call.status} size="md" />
                    <PriorityBadge priority={call.priority} size="md" />
                    <span className="inline-flex items-center gap-1.5 text-sm bg-muted px-2.5 py-1 rounded-full">
                        <CategoryIcon category={call.category} className="w-4 h-4" />
                        {getCategoryLabel(call.category)}
                    </span>
                </div>

                <p className="text-foreground">{call.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {call.schoolName && (
                        <span className="flex items-center gap-2"><Building2 className="w-4 h-4" />{call.schoolName}</span>
                    )}
                    {call.locationDisplay && (
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4" />{call.locationDisplay}</span>
                    )}
                    {call.clientName && (
                        <span className="flex items-center gap-2"><User className="w-4 h-4" />{call.clientName}</span>
                    )}
                    {call.clientPhone && (
                        <span className="flex items-center gap-2"><Phone className="w-4 h-4" />{call.clientPhone}</span>
                    )}
                    {call.clientEmail && (
                        <span className="flex items-center gap-2"><Mail className="w-4 h-4" />{call.clientEmail}</span>
                    )}
                    {call.createdAt && (
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{formatFullDate(call.createdAt)}</span>
                    )}
                </div>

                {call.lastHandledByName && (
                    <div className="text-sm text-muted-foreground border-t pt-3">
                        אחרון שטיפל: <span className="font-medium text-foreground">{call.lastHandledByName}</span>
                        {call.lastHandledAt && <span className="mr-2">({formatTime(call.lastHandledAt)})</span>}
                    </div>
                )}
            </div>

            {/* Status Control */}
            {canEditStatus && (
                <div className="bg-card rounded-2xl border p-4">
                    <StatusControl currentStatus={call.status} onStatusChange={handleStatusChange} loading={statusLoading} />
                </div>
            )}

            {/* Priority */}
            {canEditPriority && (
                <div className="bg-card rounded-2xl border p-4 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">דחיפות</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(PRIORITY).map(([key, value]) => (
                            <button
                                key={value}
                                onClick={() => handlePriorityChange(value)}
                                disabled={priorityLoading || call.priority === value}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                    call.priority === value
                                        ? `${PRIORITY_COLORS[value]} ring-2 ring-offset-1 ring-current`
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                } ${priorityLoading ? 'opacity-50' : ''}`}
                            >
                                {PRIORITY_LABELS[value]}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Change (technician only) */}
            {canEditStatus && (
                <div className="bg-card rounded-2xl border p-4 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">תיקון קטגוריה</label>
                    <div className="flex flex-wrap gap-2">
                        {DEFAULT_CATEGORIES.map(cat => (
                            <button
                                key={cat.value}
                                onClick={() => handleCategoryChange(cat.value)}
                                disabled={categoryLoading || call.category === cat.value}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition inline-flex items-center gap-1 ${
                                    call.category === cat.value
                                        ? 'bg-primary/10 text-primary ring-2 ring-offset-1 ring-primary/30'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                } ${categoryLoading ? 'opacity-50' : ''}`}
                            >
                                <CategoryIcon category={cat.value} className="w-3 h-3" />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="bg-card rounded-2xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">הערות טיפול</h3>
                    {canAddNotes && (
                        <button
                            onClick={() => setShowMessage(true)}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition"
                        >
                            <MessageSquare className="w-3 h-3" />
                            שלח הודעה ללקוח
                        </button>
                    )}
                </div>

                {call.notes && call.notes.length > 0 ? (
                    <div className="space-y-2">
                        {call.notes.slice().reverse().map(note => (
                            <div key={note.id} className="bg-muted/50 rounded-xl p-3 text-sm space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium">{note.techName}</span>
                                    <span className="text-muted-foreground">{formatTime(note.timestamp)}</span>
                                </div>
                                <p className="text-foreground">{note.text}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">אין הערות עדיין</p>
                )}

                {canAddNotes && (
                    <div className="flex gap-2">
                        <input
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="הוסף הערה..."
                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                            className="flex-1 px-3 py-2 rounded-xl border border-input bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                            onClick={handleAddNote}
                            disabled={noteLoading || !noteText.trim()}
                            className="px-3 py-2 bg-primary text-primary-foreground rounded-xl text-sm hover:bg-primary/90 transition disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Supplied Equipment */}
            {canEditStatus && (
                <div className="bg-card rounded-2xl border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">ציוד שסופק</h3>
                        <button
                            onClick={() => setShowEquipment(true)}
                            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition"
                        >
                            <Package className="w-3 h-3" />
                            ספק ציוד
                        </button>
                    </div>
                    {call.suppliedEquipment && call.suppliedEquipment.length > 0 ? (
                        <div className="space-y-1.5">
                            {call.suppliedEquipment.map((eq, idx) => (
                                <div key={idx} className="flex justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                                    <span>{eq.itemName} x{eq.quantity}</span>
                                    <span className="text-xs text-muted-foreground">{eq.techName} - {formatTime(eq.timestamp)}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">לא סופק ציוד עדיין</p>
                    )}
                </div>
            )}

            {/* History */}
            <div className="bg-card rounded-2xl border p-4 space-y-3">
                <h3 className="text-sm font-semibold">היסטוריה</h3>
                {call.history && call.history.length > 0 ? (
                    <div className="space-y-2">
                        {call.history.slice().reverse().map(h => (
                            <div key={h.id} className="flex justify-between items-start text-xs border-b border-border/50 last:border-0 pb-2 last:pb-0">
                                <div>
                                    <p className="text-foreground">{h.description}</p>
                                    <p className="text-muted-foreground">{h.performedByName}</p>
                                </div>
                                <span className="text-muted-foreground flex-shrink-0 mr-4">{formatTime(h.timestamp)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">אין היסטוריה</p>
                )}
            </div>

            {/* Send Message Modal */}
            {showMessage && (
                <SendMessageModal
                    call={call}
                    user={user}
                    onClose={() => setShowMessage(false)}
                />
            )}

            {/* Equipment Supply Modal */}
            {showEquipment && (
                <EquipmentSupplyModal
                    call={call}
                    user={user}
                    onClose={() => setShowEquipment(false)}
                />
            )}
        </div>
    );
}
