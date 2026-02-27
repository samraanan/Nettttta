import { useState, useEffect } from 'react';
import { List, Clock, AlertCircle, CheckCircle, Loader2, Building2, Timer, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storage';
import { ServiceCallCard } from './ServiceCallCard';

export function TechDashboard({ user }) {
    const [calls, setCalls] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const unsub1 = storageService.subscribeToAllCalls(setCalls);
        const unsub2 = storageService.subscribeToActiveSession(user.uid, setActiveSession);
        return () => { unsub1(); unsub2(); };
    }, [user.uid]);

    useEffect(() => {
        if (!activeSession?.clockIn) return;
        const clockIn = activeSession.clockIn?.toDate?.() || new Date(activeSession.clockIn);
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - clockIn.getTime()) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeSession]);

    const formatElapsed = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return `${h}:${m.toString().padStart(2, '0')}`;
    };

    const newCalls = calls.filter(c => c.status === 'new');
    const inProgressCalls = calls.filter(c => c.status === 'in_progress');
    const urgentCalls = calls.filter(c => c.priority === 'urgent' && c.status !== 'closed' && c.status !== 'resolved');

    const stats = [
        { label: 'חדשות', value: newCalls.length, icon: AlertCircle, color: 'bg-slate-100 text-slate-700' },
        { label: 'בטיפול', value: inProgressCalls.length, icon: Loader2, color: 'bg-blue-100 text-blue-700' },
        { label: 'קריטיות', value: urgentCalls.length, icon: AlertCircle, color: 'bg-red-100 text-red-700' },
        { label: 'סה"כ פתוחות', value: calls.filter(c => c.status !== 'closed').length, icon: List, color: 'bg-amber-100 text-amber-700' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">שלום, {user.displayName}</h1>
                <p className="text-muted-foreground text-sm mt-1">טכנאי - לוח בקרה</p>
            </div>

            {/* Active Session Banner */}
            {activeSession && (
                <Link to="/technician/clock" className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 hover:bg-emerald-100 transition">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-emerald-800">נמצא ב: {activeSession.schoolName}</p>
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {formatElapsed(elapsed)}
                        </p>
                    </div>
                    <LogOut className="w-4 h-4 text-emerald-600" />
                </Link>
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

            {/* Quick links */}
            <div className="flex gap-2">
                <Link to="/technician/calls" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                    <List className="w-4 h-4" />
                    כל הפניות
                </Link>
                <Link to="/technician/clock" className="flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted transition">
                    <Clock className="w-4 h-4" />
                    כניסה/יציאה
                </Link>
            </div>

            {/* Recent urgent / new calls */}
            {(urgentCalls.length > 0 || newCalls.length > 0) && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground">פניות דורשות טיפול</h2>
                    {[...urgentCalls, ...newCalls.filter(c => c.priority !== 'urgent')]
                        .slice(0, 5)
                        .map(call => (
                            <ServiceCallCard key={call.id} call={call} />
                        ))
                    }
                </div>
            )}
        </div>
    );
}
