import { useState, useEffect } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { storageService } from '../../services/storage';
import { DEFAULT_CATEGORIES, ROLES } from '../../lib/constants';
import { LocationPicker } from '../shared/LocationPicker';
import { CategoryIcon } from '../shared/CategoryIcon';

export function NewCallForm({ user }) {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [locations, setLocations] = useState(null);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // For non-client users: school selection + caller info
    const isNonClient = user.role !== ROLES.CLIENT;
    const [schools, setSchools] = useState([]);
    const [selectedSchoolId, setSelectedSchoolId] = useState(user.schoolId || '');
    const [selectedSchoolName, setSelectedSchoolName] = useState(user.schoolName || '');
    const [callerName, setCallerName] = useState('');
    const [callerPhone, setCallerPhone] = useState('');

    const activeSchoolId = user.schoolId || selectedSchoolId;
    const activeSchoolName = user.schoolName || selectedSchoolName;

    useEffect(() => {
        if (isNonClient && !user.schoolId) {
            const unsub = storageService.subscribeToAllSchools(setSchools);
            return () => unsub();
        }
    }, [isNonClient, user.schoolId]);

    useEffect(() => {
        if (!activeSchoolId) return;
        const unsub1 = storageService.subscribeToCategories(activeSchoolId, setCategories);
        const unsub2 = storageService.subscribeToLocations(activeSchoolId, setLocations);
        return () => { unsub1(); unsub2(); };
    }, [activeSchoolId]);

    // Reset location when school changes
    useEffect(() => {
        setLocation(null);
        setLocations(null);
    }, [selectedSchoolId]);

    useEffect(() => {
        if (!success) return;
        const t = setTimeout(() => setSuccess(false), 3000);
        return () => clearTimeout(t);
    }, [success]);

    const handleSchoolChange = (e) => {
        const id = e.target.value;
        const school = schools.find(s => s.id === id);
        setSelectedSchoolId(id);
        setSelectedSchoolName(school?.name || '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !description.trim() || !location || !activeSchoolId) return;

        setLoading(true);
        try {
            await storageService.createServiceCall({
                schoolId: activeSchoolId,
                schoolName: activeSchoolName,
                description: description.trim(),
                category,
                clientId: user.uid,
                clientName: isNonClient && callerName.trim() ? callerName.trim() : user.displayName,
                clientPhone: isNonClient && callerPhone.trim() ? callerPhone.trim() : (user.phone || null),
                clientEmail: user.email,
                location,
                locationDisplay: location.isMobileDevice
                    ? `מכשיר נייד: ${location.deviceId || ''}`
                    : `${location.floorLabel} > ${location.categoryLabel} > ${location.roomLabel} (חדר ${location.roomNumber})`
            });
            setSuccess(true);
            setCategory('');
            setDescription('');
            setLocation(null);
            if (isNonClient) { setCallerName(''); setCallerPhone(''); }
        } catch (err) {
            console.error('Error creating call:', err);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="text-center">
                    <h2 className="text-xl font-bold">הפנייה נשלחה בהצלחה!</h2>
                    <p className="text-sm text-muted-foreground mt-1">הצוות הטכני יטפל בבקשתך בהקדם</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">פנייה חדשה</h1>
                <p className="text-sm text-muted-foreground mt-1">{activeSchoolName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* בחירת בית ספר — רק למנהל/טכנאי ללא schoolId קבוע */}
                {isNonClient && !user.schoolId && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">בית ספר</label>
                        <select
                            value={selectedSchoolId}
                            onChange={handleSchoolChange}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-input bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">בחר בית ספר...</option>
                            {schools.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* פרטי פונה — רק למנהל/טכנאי */}
                {isNonClient && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">שם פונה <span className="text-muted-foreground font-normal">(אופציונלי)</span></label>
                            <input
                                value={callerName}
                                onChange={e => setCallerName(e.target.value)}
                                placeholder={user.displayName}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">טלפון <span className="text-muted-foreground font-normal">(אופציונלי)</span></label>
                            <input
                                value={callerPhone}
                                onChange={e => setCallerPhone(e.target.value)}
                                placeholder={user.phone || ''}
                                className="w-full px-4 py-2.5 rounded-xl border border-input bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                )}

                {/* קטגוריה */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">סוג הבעיה</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setCategory(cat.value)}
                                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition ${
                                    category === cat.value
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                                }`}
                            >
                                <CategoryIcon category={cat.value} className="w-4 h-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* מיקום */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">מיקום</label>
                    {!activeSchoolId ? (
                        <div className="text-sm text-muted-foreground">יש לבחור בית ספר תחילה</div>
                    ) : locations ? (
                        <LocationPicker
                            locations={locations}
                            value={location}
                            onChange={setLocation}
                        />
                    ) : (
                        <div className="text-sm text-muted-foreground">טוען מיקומים...</div>
                    )}
                </div>

                {/* תיאור */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">תיאור הבעיה</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="תאר את הבעיה בפירוט..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-input bg-white text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                </div>

                {/* שלח */}
                <button
                    type="submit"
                    disabled={loading || !category || !description.trim() || !location || !activeSchoolId}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    {loading ? 'שולח...' : 'שלח פנייה'}
                </button>
            </form>
        </div>
    );
}
