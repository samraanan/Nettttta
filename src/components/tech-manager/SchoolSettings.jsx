import { useState, useEffect } from 'react';
import { Building2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storage';

export function SchoolSettings({ user }) {
    const [schools, setSchools] = useState([]);

    useEffect(() => {
        const unsub = storageService.subscribeToAllSchools(setSchools);
        return () => unsub();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">בתי ספר</h1>
                <p className="text-sm text-muted-foreground mt-1">{schools.length} בתי ספר במערכת</p>
            </div>

            {schools.length === 0 ? (
                <div className="text-center py-12">
                    <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">אין בתי ספר עדיין</p>
                    <p className="text-xs text-muted-foreground mt-1">הוסף בית ספר ראשון דרך Firebase Console</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {schools.map(school => (
                        <Link key={school.id} to={`/manager/schools/${school.id}`} className="block bg-card rounded-2xl border p-4 hover:shadow-md transition">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm">{school.name}</h3>
                                    {school.address && <p className="text-xs text-muted-foreground">{school.address}</p>}
                                    {school.contactName && <p className="text-xs text-muted-foreground">איש קשר: {school.contactName}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${school.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {school.active !== false ? 'פעיל' : 'לא פעיל'}
                                    </span>
                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
