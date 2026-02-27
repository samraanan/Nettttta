import { useState, useEffect } from 'react';
import { BarChart3, List, Package, Settings, AlertCircle, Clock, Building2, CheckCircle2, Wrench, AlertTriangle, TrendingUp, DollarSign, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storage';
import { migrationService } from '../../services/migrationService';
import { ServiceCallCard } from '../technician/ServiceCallCard';

export function ManagerDashboard({ user }) {
    const [calls, setCalls] = useState([]);
    const [schools, setSchools] = useState([]);
    const [isMigrating, setIsMigrating] = useState(false);

    useEffect(() => {
        const unsub1 = storageService.subscribeToAllCalls(setCalls);
        const unsub2 = storageService.subscribeToAllSchools(setSchools);
        return () => { unsub1(); unsub2(); };
    }, []);

    const handleMigration = async () => {
        if (window.confirm("האם להריץ ייבוא נתונים ראשוני למערכת? פעולה זו תיצור את בית הספר הדמו ופריטי מלאי התחלתיים.")) {
            setIsMigrating(true);
            try {
                await migrationService.runMigration();
                alert("הייבוא עבר בהצלחה! רענן את העמוד כדי לראות את הנתונים החדשים.");
            } catch (err) {
                alert("שגיאה בייבוא הנתונים: " + err.message);
            } finally {
                setIsMigrating(false);
            }
        }
    };

    const openCalls = calls.filter(c => c.status !== 'closed');
    const newCalls = calls.filter(c => c.status === 'new');
    const urgentCalls = calls.filter(c => c.priority === 'urgent' && c.status !== 'closed' && c.status !== 'resolved');
    const inProgressCalls = calls.filter(c => c.status === 'in_progress');

    const stats = [
        { label: 'חדשות', value: newCalls.length, icon: AlertCircle, color: 'bg-slate-100 text-slate-700' },
        { label: 'בטיפול', value: inProgressCalls.length, icon: Wrench, color: 'bg-blue-100 text-blue-700' },
        { label: 'קריטיות', value: urgentCalls.length, icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
        { label: 'פתוחות', value: openCalls.length, icon: Clock, color: 'bg-amber-100 text-amber-700' },
    ];

    const cards = [
        { to: '/manager/calls', icon: List, label: 'כל הפניות', desc: `${calls.length} פניות`, color: 'bg-blue-100 text-blue-700' },
        { to: '/manager/reports', icon: BarChart3, label: 'דוחות', desc: 'סטטיסטיקות ודוחות', color: 'bg-emerald-100 text-emerald-700' },
        { to: '/manager/inventory', icon: Package, label: 'מלאי ציוד', desc: 'ניהול מלאי', color: 'bg-amber-100 text-amber-700' },
        { to: '/manager/schools', icon: Settings, label: 'בתי ספר', desc: `${schools.length} בתי ספר`, color: 'bg-purple-100 text-purple-700' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">שלום, {user.displayName}</h1>
                <p className="text-muted-foreground text-sm">סקירה כללית של מערכת הפניות והמלאי</p>
            </div>

            {schools.length === 0 && (
                <button
                    onClick={handleMigration}
                    disabled={isMigrating}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                    {isMigrating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Database className="w-4 h-4" />
                    )}
                    {isMigrating ? 'מייבא נתונים...' : 'הפעלת ייבוא נתונים (פעם אחת)'}
                </button>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-card rounded-2xl border p-3 space-y-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                            <stat.icon className="w-4 h-4" />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cards.map(card => (
                    <Link key={card.to} to={card.to} className="bg-card rounded-2xl border p-4 hover:shadow-md transition space-y-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                            <card.icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-sm">{card.label}</h3>
                        <p className="text-xs text-muted-foreground">{card.desc}</p>
                    </Link>
                ))}
            </div>

            {/* Schools overview */}
            {schools.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground">בתי ספר</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {schools.map(school => {
                            const schoolCalls = calls.filter(c => c.schoolId === school.id && c.status !== 'closed');
                            return (
                                <div key={school.id} className="bg-card rounded-2xl border p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{school.name}</p>
                                        <p className="text-xs text-muted-foreground">{schoolCalls.length} פניות פתוחות</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Urgent calls */}
            {urgentCalls.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-red-600">פניות קריטיות</h2>
                    {urgentCalls.slice(0, 5).map(call => (
                        <ServiceCallCard key={call.id} call={call} linkPrefix="/manager/calls" />
                    ))}
                </div>
            )}
        </div>
    );
}
