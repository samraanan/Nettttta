import { useState, useEffect } from 'react';
import { storageService } from '../../services/storage';
import { STATUS_LABELS, DEFAULT_CATEGORIES } from '../../lib/constants';
import { getCategoryLabel } from '../shared/CategoryIcon';

export function ReportsView({ user }) {
    const [calls, setCalls] = useState([]);
    const [schools, setSchools] = useState([]);
    const [workSessions, setWorkSessions] = useState([]);

    useEffect(() => {
        const unsub1 = storageService.subscribeToAllCalls(setCalls);
        const unsub2 = storageService.subscribeToAllSchools(setSchools);
        const unsub3 = storageService.subscribeToWorkSessions({}, setWorkSessions);
        return () => { unsub1(); unsub2(); unsub3(); };
    }, []);

    // Status distribution
    const statusCounts = {};
    calls.forEach(c => { statusCounts[c.status] = (statusCounts[c.status] || 0) + 1; });

    // Category distribution
    const categoryCounts = {};
    calls.forEach(c => { categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1; });

    // Per school
    const schoolStats = schools.map(school => {
        const schoolCalls = calls.filter(c => c.schoolId === school.id);
        const open = schoolCalls.filter(c => c.status !== 'closed' && c.status !== 'resolved').length;
        const total = schoolCalls.length;
        return { ...school, open, total };
    });

    // Work hours per technician
    const techHours = {};
    workSessions.forEach(s => {
        if (s.durationMinutes) {
            techHours[s.techName] = (techHours[s.techName] || 0) + s.durationMinutes;
        }
    });

    // Avg resolution time
    const resolvedCalls = calls.filter(c => c.resolvedAt && c.createdAt);
    let avgHours = 0;
    if (resolvedCalls.length > 0) {
        const totalMs = resolvedCalls.reduce((sum, c) => {
            const created = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            const resolved = c.resolvedAt?.toDate ? c.resolvedAt.toDate() : new Date(c.resolvedAt);
            return sum + (resolved - created);
        }, 0);
        avgHours = Math.round(totalMs / resolvedCalls.length / 3600000);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">דוחות</h1>
                <p className="text-sm text-muted-foreground mt-1">סטטיסטיקות חוצי בתי ספר</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card rounded-2xl border p-4 text-center">
                    <p className="text-3xl font-bold">{calls.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">סה"כ פניות</p>
                </div>
                <div className="bg-card rounded-2xl border p-4 text-center">
                    <p className="text-3xl font-bold">{calls.filter(c => c.status !== 'closed' && c.status !== 'resolved').length}</p>
                    <p className="text-xs text-muted-foreground mt-1">פתוחות</p>
                </div>
                <div className="bg-card rounded-2xl border p-4 text-center">
                    <p className="text-3xl font-bold">{avgHours > 0 ? `${avgHours}h` : '-'}</p>
                    <p className="text-xs text-muted-foreground mt-1">זמן טיפול ממוצע</p>
                </div>
                <div className="bg-card rounded-2xl border p-4 text-center">
                    <p className="text-3xl font-bold">{schools.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">בתי ספר</p>
                </div>
            </div>

            {/* By Status */}
            <div className="bg-card rounded-2xl border p-4 space-y-3">
                <h3 className="text-sm font-semibold">לפי סטטוס</h3>
                <div className="space-y-2">
                    {Object.entries(STATUS_LABELS).map(([status, label]) => {
                        const count = statusCounts[status] || 0;
                        const pct = calls.length > 0 ? Math.round((count / calls.length) * 100) : 0;
                        return (
                            <div key={status} className="flex items-center gap-3">
                                <span className="text-xs w-16 text-muted-foreground">{label}</span>
                                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-medium w-8 text-left">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* By Category */}
            <div className="bg-card rounded-2xl border p-4 space-y-3">
                <h3 className="text-sm font-semibold">לפי קטגוריה</h3>
                <div className="space-y-2">
                    {DEFAULT_CATEGORIES.map(cat => {
                        const count = categoryCounts[cat.value] || 0;
                        const pct = calls.length > 0 ? Math.round((count / calls.length) * 100) : 0;
                        return (
                            <div key={cat.value} className="flex items-center gap-3">
                                <span className="text-xs w-16 text-muted-foreground">{cat.label}</span>
                                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs font-medium w-8 text-left">{count}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Per School */}
            <div className="bg-card rounded-2xl border p-4 space-y-3">
                <h3 className="text-sm font-semibold">לפי בית ספר</h3>
                {schoolStats.length === 0 ? (
                    <p className="text-xs text-muted-foreground">אין בתי ספר</p>
                ) : (
                    <div className="space-y-2">
                        {schoolStats.map(s => (
                            <div key={s.id} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                                <span className="font-medium">{s.name}</span>
                                <div className="flex gap-3 text-xs text-muted-foreground">
                                    <span>{s.open} פתוחות</span>
                                    <span>{s.total} סה"כ</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Work hours */}
            {Object.keys(techHours).length > 0 && (
                <div className="bg-card rounded-2xl border p-4 space-y-3">
                    <h3 className="text-sm font-semibold">שעות עבודה לפי טכנאי</h3>
                    <div className="space-y-2">
                        {Object.entries(techHours).map(([name, minutes]) => (
                            <div key={name} className="flex items-center justify-between text-sm bg-muted/50 rounded-lg px-3 py-2">
                                <span className="font-medium">{name}</span>
                                <span className="text-xs text-muted-foreground">{Math.round(minutes / 60)} שעות</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
