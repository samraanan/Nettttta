import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Save, Plus, Trash2, Tag } from 'lucide-react';
import { storageService } from '../../services/storage';
import { DEFAULT_CATEGORIES } from '../../lib/constants';

export function SchoolSetup() {
    const { schoolId } = useParams();
    const navigate = useNavigate();
    const [school, setSchool] = useState(null);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [locations, setLocations] = useState({ floors: [] });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeSection, setActiveSection] = useState('locations');

    useEffect(() => {
        if (!schoolId) return;
        const unsub1 = storageService.subscribeToSchool(schoolId, setSchool);
        const unsub2 = storageService.subscribeToCategories(schoolId, (cats) => {
            if (cats && cats.length > 0) setCategories(cats);
        });
        const unsub3 = storageService.subscribeToLocations(schoolId, (locs) => {
            if (locs) setLocations(locs);
        });
        return () => { unsub1(); unsub2(); unsub3(); };
    }, [schoolId]);

    // === Locations helpers ===
    const addFloor = () => {
        setLocations(prev => ({
            ...prev,
            floors: [...prev.floors, { id: `floor_${Date.now()}`, label: '', categories: [] }]
        }));
    };

    const updateFloor = (floorIdx, label) => {
        setLocations(prev => {
            const floors = [...prev.floors];
            floors[floorIdx] = { ...floors[floorIdx], label };
            return { ...prev, floors };
        });
    };

    const removeFloor = (floorIdx) => {
        setLocations(prev => ({
            ...prev,
            floors: prev.floors.filter((_, i) => i !== floorIdx)
        }));
    };

    const addCategory = (floorIdx) => {
        setLocations(prev => {
            const floors = [...prev.floors];
            floors[floorIdx] = {
                ...floors[floorIdx],
                categories: [...floors[floorIdx].categories, { id: `cat_${Date.now()}`, label: '', rooms: [] }]
            };
            return { ...prev, floors };
        });
    };

    const updateCategory = (floorIdx, catIdx, label) => {
        setLocations(prev => {
            const floors = [...prev.floors];
            const cats = [...floors[floorIdx].categories];
            cats[catIdx] = { ...cats[catIdx], label };
            floors[floorIdx] = { ...floors[floorIdx], categories: cats };
            return { ...prev, floors };
        });
    };

    const removeCategory = (floorIdx, catIdx) => {
        setLocations(prev => {
            const floors = [...prev.floors];
            floors[floorIdx] = {
                ...floors[floorIdx],
                categories: floors[floorIdx].categories.filter((_, i) => i !== catIdx)
            };
            return { ...prev, floors };
        });
    };

    const addRoom = (floorIdx, catIdx) => {
        setLocations(prev => {
            const floors = [...prev.floors];
            const cats = [...floors[floorIdx].categories];
            cats[catIdx] = {
                ...cats[catIdx],
                rooms: [...cats[catIdx].rooms, { id: `room_${Date.now()}`, label: '', roomNumber: '' }]
            };
            floors[floorIdx] = { ...floors[floorIdx], categories: cats };
            return { ...prev, floors };
        });
    };

    const updateRoom = (floorIdx, catIdx, roomIdx, field, value) => {
        setLocations(prev => {
            const floors = [...prev.floors];
            const cats = [...floors[floorIdx].categories];
            const rooms = [...cats[catIdx].rooms];
            rooms[roomIdx] = { ...rooms[roomIdx], [field]: value };
            cats[catIdx] = { ...cats[catIdx], rooms };
            floors[floorIdx] = { ...floors[floorIdx], categories: cats };
            return { ...prev, floors };
        });
    };

    const removeRoom = (floorIdx, catIdx, roomIdx) => {
        setLocations(prev => {
            const floors = [...prev.floors];
            const cats = [...floors[floorIdx].categories];
            cats[catIdx] = {
                ...cats[catIdx],
                rooms: cats[catIdx].rooms.filter((_, i) => i !== roomIdx)
            };
            floors[floorIdx] = { ...floors[floorIdx], categories: cats };
            return { ...prev, floors };
        });
    };

    // === Categories helpers ===
    const addServiceCategory = () => {
        setCategories(prev => [...prev, { value: `custom_${Date.now()}`, label: '' }]);
    };

    const updateServiceCategory = (idx, label) => {
        setCategories(prev => {
            const newCats = [...prev];
            newCats[idx] = { ...newCats[idx], label };
            return newCats;
        });
    };

    const removeServiceCategory = (idx) => {
        setCategories(prev => prev.filter((_, i) => i !== idx));
    };

    // === Save ===
    const handleSave = async () => {
        setSaving(true);
        try {
            await storageService.updateLocations(schoolId, locations);
            await storageService.updateCategories(schoolId, categories);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Error saving:', err);
        } finally {
            setSaving(false);
        }
    };

    if (!school) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition">
                <ArrowRight className="w-4 h-4" />
                חזרה
            </button>

            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-primary" />
                    {school.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">הגדרות מיקומים וקטגוריות</p>
            </div>

            {/* Section tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveSection('locations')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeSection === 'locations' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                >
                    <MapPin className="w-4 h-4" />
                    מיקומים
                </button>
                <button
                    onClick={() => setActiveSection('categories')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
                        activeSection === 'categories' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                >
                    <Tag className="w-4 h-4" />
                    קטגוריות שירות
                </button>
            </div>

            {/* Locations Editor */}
            {activeSection === 'locations' && (
                <div className="space-y-4">
                    {locations.floors.map((floor, fi) => (
                        <div key={floor.id} className="bg-card rounded-2xl border overflow-hidden">
                            {/* Floor header */}
                            <div className="flex items-center gap-2 p-3 bg-muted/50 border-b">
                                <input
                                    value={floor.label}
                                    onChange={(e) => updateFloor(fi, e.target.value)}
                                    placeholder="שם הקומה (למשל: קומת קרקע)"
                                    className="flex-1 px-3 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <button onClick={() => removeFloor(fi)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-3 space-y-3">
                                {floor.categories.map((cat, ci) => (
                                    <div key={cat.id} className="bg-muted/30 rounded-xl p-3 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={cat.label}
                                                onChange={(e) => updateCategory(fi, ci, e.target.value)}
                                                placeholder="סוג חדר (למשל: כיתות, מעבדות)"
                                                className="flex-1 px-2 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                            <button onClick={() => removeCategory(fi, ci)} className="p-1 text-destructive hover:bg-destructive/10 rounded transition">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Rooms */}
                                        <div className="space-y-1.5 mr-4">
                                            {cat.rooms.map((room, ri) => (
                                                <div key={room.id} className="flex items-center gap-2">
                                                    <input
                                                        value={room.roomNumber}
                                                        onChange={(e) => updateRoom(fi, ci, ri, 'roomNumber', e.target.value)}
                                                        placeholder="מס׳"
                                                        className="w-16 px-2 py-1 rounded-lg border text-xs text-center focus:outline-none focus:ring-2 focus:ring-ring"
                                                    />
                                                    <input
                                                        value={room.label}
                                                        onChange={(e) => updateRoom(fi, ci, ri, 'label', e.target.value)}
                                                        placeholder="שם החדר"
                                                        className="flex-1 px-2 py-1 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                                                    />
                                                    <button onClick={() => removeRoom(fi, ci, ri)} className="p-1 text-destructive/60 hover:text-destructive transition">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addRoom(fi, ci)}
                                                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition py-1"
                                            >
                                                <Plus className="w-3 h-3" />
                                                הוסף חדר
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => addCategory(fi)}
                                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition py-1"
                                >
                                    <Plus className="w-3 h-3" />
                                    הוסף סוג חדר
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addFloor}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-2xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition"
                    >
                        <Plus className="w-4 h-4" />
                        הוסף קומה
                    </button>
                </div>
            )}

            {/* Categories Editor */}
            {activeSection === 'categories' && (
                <div className="bg-card rounded-2xl border p-4 space-y-3">
                    {categories.map((cat, idx) => (
                        <div key={cat.value} className="flex items-center gap-2">
                            <span className="w-8 text-center text-xs text-muted-foreground">{idx + 1}</span>
                            <input
                                value={cat.label}
                                onChange={(e) => updateServiceCategory(idx, e.target.value)}
                                placeholder="שם הקטגוריה"
                                className="flex-1 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                                onClick={() => removeServiceCategory(idx)}
                                disabled={categories.length <= 1}
                                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-30"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={addServiceCategory}
                        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition py-1"
                    >
                        <Plus className="w-4 h-4" />
                        הוסף קטגוריה
                    </button>
                </div>
            )}

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition shadow-lg ${
                    saved
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90'
                } disabled:opacity-50`}
            >
                {saving ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Save className="w-4 h-4" />
                )}
                {saved ? 'נשמר!' : saving ? 'שומר...' : 'שמור שינויים'}
            </button>
        </div>
    );
}
