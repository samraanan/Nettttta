import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List, BarChart3, AlertCircle, Loader2, CheckCircle, Clock } from 'lucide-react';
import { storageService } from '../../services/storage';
import { ServiceCallCard } from '../technician/ServiceCallCard';

export function SchoolDashboard({ user }) {
    const [calls, setCalls] = useState([]);

    useEffect(() => {
        if (!user.schoolId) return;
        const unsub = storageService.subscribeToCallsBySchool(user.schoolId, setCalls);
        return () => unsub();
    }, [user.schoolId]);

    const newCalls = calls.filter(c => c.status === 'new');
    const inProgressCalls = calls.filter(c => c.status === 'in_progress');
    const waitingCalls = calls.filter(c => c.status === 'waiting');
    const resolvedCalls = calls.filter(c => c.status === 'resolved' || c.status === 'closed');

    const stats = [
        { label: 'חדשות', value: newCalls.length, icon: AlertCircle, color: 'bg-slate-100 text-slate-700' },
        { label: 'בטיפול', value: inProgressCalls.length, icon: Loader2, color: 'bg-blue-100 text-blue-700' },
        { label: 'ממתינות', value: waitingCalls.length, icon: Clock, color: 'bg-amber-100 text-amber-700' },
        { label: 'טופלו', value: resolvedCalls.length, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">שלום, {user.displayName}</h1>
                <p className="text-muted-foreground text-sm mt-1">{user.schoolName || 'מנהל בית ספר'}</p>
            </div>

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
                <Link to="/school/calls" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition">
                    <List className="w-4 h-4" />
                    כל הפניות
                </Link>
                <Link to="/school/reports" className="flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-medium hover:bg-muted transition">
                    <BarChart3 className="w-4 h-4" />
                    דוחות
                </Link>
            </div>

            {/* Recent calls that need attention */}
            {newCalls.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground">פניות חדשות</h2>
                    {newCalls.slice(0, 5).map(call => (
                        <ServiceCallCard key={call.id} call={call} linkPrefix="/school/call" />
                    ))}
                </div>
            )}
        </div>
    );
}
