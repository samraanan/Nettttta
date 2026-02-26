import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, FileText } from 'lucide-react';
import { storageService } from '../../services/storage';
import { ServiceCallCard } from '../technician/ServiceCallCard';

export function RoomHistoryView({ user, linkPrefix = '/technician/call' }) {
    const [roomNumber, setRoomNumber] = useState('');
    const [schoolId, setSchoolId] = useState(user.schoolId || '');
    const [calls, setCalls] = useState([]);
    const [searched, setSearched] = useState(false);
    const [schools, setSchools] = useState([]);
    const [loadingSchools, setLoadingSchools] = useState(true);
    const searchUnsubRef = useRef(null);

    useEffect(() => {
        const unsub = storageService.subscribeToAllSchools((s) => {
            setSchools(s);
            setLoadingSchools(false);
        });
        return () => unsub();
    }, []);

    // Cleanup search subscription on unmount
    useEffect(() => {
        return () => {
            if (searchUnsubRef.current) searchUnsubRef.current();
        };
    }, []);

    const handleSearch = () => {
        if (!roomNumber.trim() || !schoolId) return;
        // Unsubscribe from previous search
        if (searchUnsubRef.current) searchUnsubRef.current();
        setSearched(true);
        searchUnsubRef.current = storageService.subscribeToCallsByRoom(schoolId, roomNumber.trim(), setCalls);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">היסטוריית חדר</h1>
                <p className="text-sm text-muted-foreground mt-1">חיפוש פניות לפי מספר חדר פיזי</p>
            </div>

            <div className="bg-card rounded-2xl border p-4 space-y-4">
                {/* School selector (only for non-school-admin roles) */}
                {!user.schoolId && (
                    <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">בית ספר</label>
                        <select
                            value={schoolId}
                            onChange={(e) => setSchoolId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">בחר בית ספר...</option>
                            {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={roomNumber}
                            onChange={(e) => setRoomNumber(e.target.value)}
                            placeholder="מספר חדר..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-input bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={!roomNumber.trim() || !schoolId}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                    >
                        <Search className="w-4 h-4" />
                        חפש
                    </button>
                </div>
            </div>

            {/* Results */}
            {searched && (
                <div className="space-y-3">
                    <h2 className="text-sm font-semibold text-muted-foreground">
                        {calls.length} פניות נמצאו לחדר {roomNumber}
                    </h2>
                    {calls.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">לא נמצאו פניות לחדר זה</p>
                        </div>
                    ) : (
                        calls.map(call => (
                            <ServiceCallCard key={call.id} call={call} linkPrefix={linkPrefix} />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
