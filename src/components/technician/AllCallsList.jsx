import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Download, Upload, ArrowUpDown, Calendar } from 'lucide-react';
import { storageService } from '../../services/storage';
import { ServiceCallCard } from './ServiceCallCard';
import { STATUS, STATUS_LABELS, PRIORITY, PRIORITY_LABELS, DEFAULT_CATEGORIES, OPEN_STATUSES } from '../../lib/constants';
import { parseCSVRow } from '../../lib/csvImportHelper';
import Papa from 'papaparse';

const SORT_OPTIONS = [
    { value: 'date_desc', label: 'תאריך (חדש → ישן)' },
    { value: 'date_asc', label: 'תאריך (ישן → חדש)' },
    { value: 'school_asc', label: 'בית ספר (א-ת)' },
    { value: 'school_desc', label: 'בית ספר (ת-א)' },
    { value: 'status_asc', label: 'סטטוס' },
    { value: 'priority_desc', label: 'דחיפות (גבוהה קודם)' }
];

const STATUS_ORDER = { new: 0, in_progress: 1, waiting_for_part: 2, resolved: 3, closed: 4 };
const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };

export function AllCallsList({ linkPrefix = '/technician/call' }) {
    const [calls, setCalls] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [schoolFilter, setSchoolFilter] = useState('');
    const [schools, setSchools] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('date_desc');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [showClosed, setShowClosed] = useState(false);

    // Import state
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const importRef = useRef(null);

    useEffect(() => {
        const unsub1 = storageService.subscribeToAllCalls(setCalls);
        const unsub2 = storageService.subscribeToAllSchools(setSchools);
        return () => { unsub1(); unsub2(); };
    }, []);

    // Filter
    const filtered = calls.filter(call => {
        // ברירת מחדל: הסתר סגורות/הושלמו אלא אם הפעלת showClosed
        if (!showClosed && !OPEN_STATUSES.includes(call.status)) return false;
        if (statusFilter && call.status !== statusFilter) return false;
        if (priorityFilter && call.priority !== priorityFilter) return false;
        if (categoryFilter && call.category !== categoryFilter) return false;
        if (schoolFilter && call.schoolId !== schoolFilter) return false;

        // Date range filter
        if (dateFrom || dateTo) {
            const callDate = call.createdAt?.toDate?.() || new Date(call.createdAt);
            const callDateStr = callDate.toISOString().split('T')[0];
            if (dateFrom && callDateStr < dateFrom) return false;
            if (dateTo && callDateStr > dateTo) return false;
        }

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

    // Sort
    const sorted = [...filtered].sort((a, b) => {
        const getDate = (c) => c.createdAt?.toDate?.() || new Date(c.createdAt || 0);
        switch (sortBy) {
            case 'date_desc': return getDate(b) - getDate(a);
            case 'date_asc': return getDate(a) - getDate(b);
            case 'school_asc': return (a.schoolName || '').localeCompare(b.schoolName || '', 'he');
            case 'school_desc': return (b.schoolName || '').localeCompare(a.schoolName || '', 'he');
            case 'status_asc': return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
            case 'priority_desc': return (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
            default: return 0;
        }
    });

    const hasFilters = statusFilter || priorityFilter || categoryFilter || schoolFilter || dateFrom || dateTo || showClosed;

    const clearFilters = () => {
        setStatusFilter(''); setPriorityFilter(''); setCategoryFilter(''); setSchoolFilter('');
        setDateFrom(''); setDateTo(''); setShowClosed(false);
    };

    // --- Export to CSV ---
    const exportToCSV = () => {
        const rows = sorted.map(call => {
            const d = call.createdAt?.toDate?.() || new Date(call.createdAt);
            const upd = call.updatedAt?.toDate?.() || new Date(call.updatedAt || call.createdAt);
            return {
                'מזהה': call.id,
                'תאריך פתיחה': d.toLocaleDateString('he-IL'),
                'תאריך עדכון': upd.toLocaleDateString('he-IL'),
                'בית ספר': call.schoolName || '',
                'פונה': call.clientName || '',
                'טלפון': call.clientPhone || '',
                'מיקום': call.locationDisplay || '',
                'קטגוריה': call.category || '',
                'תיאור': call.description || '',
                'סטטוס': STATUS_LABELS[call.status] || call.status,
                'דחיפות': PRIORITY_LABELS[call.priority] || '',
                'טופל ע"י': call.lastHandledByName || '',
                'מה בוצע': call.notes?.map(n => n.text).join(' | ') || '',
                'ציוד שסופק': call.suppliedEquipment?.map(e => `${e.itemName} (${e.quantity})`).join(', ') || ''
            };
        });
        const csv = Papa.unparse(rows, { header: true });
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `tickets_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // --- Import CSV (re-import / bulk create) ---
    const handleImportCSV = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsImporting(true);
        setImportResult(null);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    let imported = 0;
                    for (const row of results.data) {
                        const callData = parseCSVRow(row, '', '', schools);
                        if (!callData) continue;
                        await storageService.createServiceCall(callData);
                        imported++;
                    }
                    setImportResult({ ok: true, msg: `יובאו ${imported} פניות בהצלחה!` });
                } catch (err) {
                    setImportResult({ ok: false, msg: 'שגיאה: ' + err.message });
                } finally {
                    setIsImporting(false);
                }
            },
            error: (err) => {
                setImportResult({ ok: false, msg: 'שגיאה בקובץ: ' + err.message });
                setIsImporting(false);
            }
        });
        e.target.value = '';
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">פניות</h1>
                    <p className="text-sm text-muted-foreground">{sorted.length} מתוך {calls.length}</p>
                </div>

                {/* Export / Import Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                    >
                        <Download className="w-3 h-3" />
                        ייצוא CSV
                    </button>
                    <input type="file" accept=".csv" ref={importRef} onChange={handleImportCSV} className="hidden" />
                    <button
                        onClick={() => importRef.current?.click()}
                        disabled={isImporting}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
                    >
                        {isImporting ? <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <Upload className="w-3 h-3" />}
                        {isImporting ? 'מייבא...' : 'ייבוא CSV'}
                    </button>
                </div>
            </div>

            {/* Import Result Toast */}
            {importResult && (
                <div className={`text-sm px-4 py-2 rounded-xl flex items-center justify-between ${importResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    <span>{importResult.msg}</span>
                    <button onClick={() => setImportResult(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="חיפוש בפניות... (תיאור, פונה, מיקום, מספר חדר)"
                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-input bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            {/* Filter + Sort controls */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${showFilters || hasFilters ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                    <Filter className="w-3 h-3" />
                    סינון
                    {hasFilters && <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[10px]">!</span>}
                </button>
                {hasFilters && (
                    <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80">
                        <X className="w-3 h-3" /> נקה סינון
                    </button>
                )}

                {/* Sort */}
                <div className="flex items-center gap-1.5 mr-auto">
                    <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="text-xs bg-transparent border-0 text-muted-foreground focus:outline-none cursor-pointer"
                    >
                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-card rounded-2xl border p-4 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">סטטוס</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">הכל</option>
                                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">דחיפות</label>
                            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">הכל</option>
                                {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">קטגוריה</label>
                            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">הכל</option>
                                {DEFAULT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 block">בית ספר</label>
                            <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring">
                                <option value="">הכל</option>
                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Show closed toggle */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                        <input
                            type="checkbox"
                            id="showClosed"
                            checked={showClosed}
                            onChange={e => setShowClosed(e.target.checked)}
                            className="rounded"
                        />
                        <label htmlFor="showClosed" className="text-xs text-muted-foreground cursor-pointer">הצג גם פניות סגורות/הושלמו</label>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> מתאריך</label>
                            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> עד תאריך</label>
                            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                    </div>
                </div>
            )}

            {/* Calls List */}
            {sorted.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">אין פניות{hasFilters ? ' לפי הסינון הנבחר' : ''}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sorted.map(call => (
                        <ServiceCallCard key={call.id} call={call} linkPrefix={linkPrefix} />
                    ))}
                </div>
            )}
        </div>
    );
}
