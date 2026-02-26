import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { storageService } from '../../services/storage';
import { ServiceCallCard } from './ServiceCallCard';
import { STATUS, STATUS_LABELS, PRIORITY, PRIORITY_LABELS, DEFAULT_CATEGORIES } from '../../lib/constants';

export function AllCallsList({ user, linkPrefix = '/technician/call' }) {
    const [calls, setCalls] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [schoolFilter, setSchoolFilter] = useState('');
    const [schools, setSchools] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const unsub1 = storageService.subscribeToAllCalls(setCalls);
        const unsub2 = storageService.subscribeToAllSchools(setSchools);
        return () => { unsub1(); unsub2(); };
    }, []);

    const filtered = calls.filter(call => {
        if (statusFilter && call.status !== statusFilter) return false;
        if (priorityFilter && call.priority !== priorityFilter) return false;
        if (categoryFilter && call.category !== categoryFilter) return false;
        if (schoolFilter && call.schoolId !== schoolFilter) return false;
        if (search) {
            const s = search.toLowerCase();
            return (
                call.description?.toLowerCase().includes(s) ||
                call.clientName?.toLowerCase().includes(s) ||
                call.schoolName?.toLowerCase().includes(s) ||
                call.locationDisplay?.toLowerCase().includes(s) ||
                call.location?.roomNumber?.includes(s)
            );
        }
        return true;
    });

    const hasFilters = statusFilter || priorityFilter || categoryFilter || schoolFilter;

    const clearFilters = () => {
        setStatusFilter('');
        setPriorityFilter('');
        setCategoryFilter('');
        setSchoolFilter('');
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">פניות</h1>
                    <p className="text-sm text-muted-foreground">{filtered.length} מתוך {calls.length}</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="חיפוש בפניות... (תיאור, לקוח, מיקום, מספר חדר)"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-input bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* Filter toggle */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        showFilters || hasFilters
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                    <Filter className="w-3 h-3" />
                    סינון
                    {hasFilters && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">!</span>}
                </button>
                {hasFilters && (
                    <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80">
                        <X className="w-3 h-3" />
                        נקה סינון
                    </button>
                )}
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-card rounded-2xl border p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">סטטוס</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">הכל</option>
                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">דחיפות</label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">הכל</option>
                            {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">קטגוריה</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">הכל</option>
                            {DEFAULT_CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground mb-1 block">בית ספר</label>
                        <select
                            value={schoolFilter}
                            onChange={(e) => setSchoolFilter(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">הכל</option>
                            {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Calls List */}
            {filtered.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">אין פניות{hasFilters ? ' לפי הסינון הנבחר' : ''}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(call => (
                        <ServiceCallCard key={call.id} call={call} linkPrefix={linkPrefix} />
                    ))}
                </div>
            )}
        </div>
    );
}
