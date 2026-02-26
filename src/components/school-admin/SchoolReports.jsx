import { useState, useEffect } from 'react';
import { BarChart3, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { storageService } from '../../services/storage';
import { STATUS_LABELS, DEFAULT_CATEGORIES } from '../../lib/constants';
import { getCategoryLabel } from '../shared/CategoryIcon';

export function SchoolReports({ user }) {
    const [calls, setCalls] = useState([]);

    useEffect(() => {
        if (!user.schoolId) return;
        const unsub = storageService.subscribeToCallsBySchool(user.schoolId, setCalls);
        return () => unsub();
    }, [user.schoolId]);

    // Stats by status
    const statusCounts = {};
    calls.forEach(c => {
        statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    });

    // Stats by category
    const categoryCounts = {};
    calls.forEach(c => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    // Average resolution time (for resolved/closed calls)
    const resolvedCalls = calls.filter(c => c.resolvedAt && c.createdAt);
    let avgResolutionHours = 0;
    if (resolvedCalls.length > 0) {
        const totalMs = resolvedCalls.reduce((sum, c) => {
            const created = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
            const resolved = c.resolvedAt?.toDate ? c.resolvedAt.toDate() : new Date(c.resolvedAt);
            return sum + (resolved - created);
        }, 0);
        avgResolutionHours = Math.round(totalMs / resolvedCalls.length / 3600000);
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">דוחות</h1>
                <p className="text-sm text-muted-foreground mt-1">{user.schoolName}</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-card rounded-2xl border p-4 text-center">
                    <p className="text-3xl font-bold">{calls.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">סה"כ פניות</p>
                </div>
                <div className="bg-card rounded-2xl border p-4 text-center">
                    <p className="text-3xl font-bold">{calls.filter(c => c.status !== 'closed' && c.status !== 'resolved').length}</p>
                    <p className="text-xs text-muted-foreground mt-1">פתוחות</p>
                </div>
                <div className="bg-card rounded-2xl border p-4 text-center">
                    <p className="text-3xl font-bold">{avgResolutionHours > 0 ? `${avgResolutionHours}h` : '-'}</p>
                    <p className="text-xs text-muted-foreground mt-1">זמן טיפול ממוצע</p>
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
        </div>
    );
}
