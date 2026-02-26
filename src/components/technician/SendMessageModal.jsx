import { useState } from 'react';
import { X, Send, MessageSquare, Mail, Phone } from 'lucide-react';
import { storageService } from '../../services/storage';

export function SendMessageModal({ call, user, onClose }) {
    const [message, setMessage] = useState('');
    const [channel, setChannel] = useState('whatsapp');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);

        try {
            // שמור כהערה בפנייה
            await storageService.addNote(
                call.id,
                `[הודעה ללקוח via ${channel}]: ${message.trim()}`,
                user.uid,
                user.displayName
            );

            // פתח ערוץ שליחה
            if (channel === 'whatsapp' && call.clientPhone) {
                const text = encodeURIComponent(message.trim());
                const phone = call.clientPhone.replace(/[-\s]/g, '').replace(/^0/, '972');
                window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
            } else if (channel === 'email' && call.clientEmail) {
                const subject = encodeURIComponent(`עדכון לפנייה - ${call.schoolName || ''}`);
                const body = encodeURIComponent(message.trim());
                window.open(`mailto:${call.clientEmail}?subject=${subject}&body=${body}`, '_blank');
            }

            setSent(true);
            setTimeout(() => onClose(), 1500);
        } catch (err) {
            console.error('Error sending message:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        שליחת הודעה ללקוח
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {sent ? (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Send className="w-5 h-5 text-emerald-600" />
                            </div>
                            <p className="font-medium">ההודעה נשלחה!</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-xs text-muted-foreground">
                                <p>לקוח: <span className="font-medium text-foreground">{call.clientName}</span></p>
                                {call.clientPhone && <p>טלפון: {call.clientPhone}</p>}
                                {call.clientEmail && <p>אימייל: {call.clientEmail}</p>}
                            </div>

                            {/* Channel selection */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setChannel('whatsapp')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                                        channel === 'whatsapp'
                                            ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <Phone className="w-3 h-3" />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => setChannel('email')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition ${
                                        channel === 'email'
                                            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <Mail className="w-3 h-3" />
                                    אימייל
                                </button>
                            </div>

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="הקלד הודעה ללקוח..."
                                rows={4}
                                className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                            />

                            <button
                                onClick={handleSend}
                                disabled={loading || !message.trim()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                שלח
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
