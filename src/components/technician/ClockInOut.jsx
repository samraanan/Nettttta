import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Building2, Timer } from 'lucide-react';
import { storageService } from '../../services/storage';

export function ClockInOut({ user }) {
    const [activeSession, setActiveSession] = useState(null);
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [loading, setLoading] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const unsub1 = storageService.subscribeToActiveSession(user.uid, setActiveSession);
        const unsub2 = storageService.subscribeToAllSchools(setSchools);
        return () => { unsub1(); unsub2(); };
    }, [user.uid]);

    // Timer
    useEffect(() => {
        if (!activeSession?.clockIn) return;
        const clockIn = activeSession.clockIn?.toDate?.() || new Date(activeSession.clockIn);
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - clockIn.getTime()) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [activeSession]);

    const formatElapsed = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleClockIn = async () => {
        if (!selectedSchool) return;
        const school = schools.find(s => s.id === selectedSchool);
        if (!school) return;
        setLoading(true);
        try {
            await storageService.clockIn(user.uid, user.displayName, school.id, school.name);
            setSelectedSchool('');
        } catch (err) {
            console.error('Error clocking in:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        if (!activeSession) return;
        setLoading(true);
        try {
            await storageService.clockOut(activeSession.id);
        } catch (err) {
            console.error('Error clocking out:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">כניסה / יציאה</h1>
                <p className="text-sm text-muted-foreground mt-1">מעקב שעות בבתי הספר</p>
            </div>

            {activeSession ? (
                // Active session - show clock out
                <div className="bg-card rounded-2xl border p-6 space-y-4 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <Building2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">נמצא כרגע ב:</p>
                        <h2 className="text-xl font-bold mt-1">{activeSession.schoolName}</h2>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-3xl font-mono font-bold text-primary">
                        <Timer className="w-6 h-6" />
                        {formatElapsed(elapsed)}
                    </div>
                    <button
                        onClick={handleClockOut}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-destructive-foreground rounded-xl text-sm font-medium hover:bg-destructive/90 transition disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <LogOut className="w-4 h-4" />
                        )}
                        יציאה
                    </button>
                </div>
            ) : (
                // No active session - show clock in
                <div className="bg-card rounded-2xl border p-6 space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">בחר בית ספר לכניסה</p>
                    </div>
                    <select
                        value={selectedSchool}
                        onChange={(e) => setSelectedSchool(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">בחר בית ספר...</option>
                        {schools.map(school => (
                            <option key={school.id} value={school.id}>{school.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleClockIn}
                        disabled={loading || !selectedSchool}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <LogIn className="w-4 h-4" />
                        )}
                        כניסה
                    </button>
                </div>
            )}
        </div>
    );
}
