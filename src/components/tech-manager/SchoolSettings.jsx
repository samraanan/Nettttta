import { useState, useEffect } from 'react';
import { Building2, Settings, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storage';

export function SchoolSettings() {
    const [schools, setSchools] = useState([]);

    useEffect(() => {
        const unsub = storageService.subscribeToAllSchools(setSchools);
        return () => unsub();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">מערך בתי הספר</h1>
                    <p className="text-sm text-muted-foreground mt-1">{schools.length} בתי ספר מחוברים למערכת</p>
                </div>
                <Link to="/manager/schools/new" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition shadow-sm w-fit">
                    <Plus className="w-4 h-4" />
                    צור מוסד חדש
                </Link>
            </div>

            {schools.length === 0 ? (
                <div className="text-center py-16 bg-card border border-dashed rounded-3xl">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">עדיין אין מוסדות</h3>
                    <p className="text-muted-foreground mt-1 text-sm max-w-sm mx-auto">כדי להתחיל לקלוט פניות יש להקים לפחות בית ספר אחד דרך אשף ההקמה המהיר שלנו.</p>
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
