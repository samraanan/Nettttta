import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, MapPin, Save, Plus, Trash2, Tag, AlertOctagon, X, Upload } from 'lucide-react';
import { storageService } from '../../services/storage';
import { DEFAULT_CATEGORIES } from '../../lib/constants';
import { parseCSVRow } from '../../lib/csvImportHelper';
import Papa from 'papaparse';

export function SchoolSetup() {
    const { schoolId } = useParams();
    const navigate = useNavigate();
    const [school, setSchool] = useState(null);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [locations, setLocations] = useState({ floors: [] });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeSection, setActiveSection] = useState('locations');

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Sheet Import State
    const [isImportingSheet, setIsImportingSheet] = useState(false);
    const [importResult, setImportResult] = useState(null);

    useEffect(() => {
        if (!saved) return;
        const t = setTimeout(() => setSaved(false), 2000);
        return () => clearTimeout(t);
    }, [saved]);

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
            if (activeSection === 'info') {
                await storageService.updateSchoolInfo(schoolId, {
                    name: school.name,
                    webhookUrl: school.webhookUrl || ''
                });
            } else {
                await storageService.updateLocations(schoolId, locations);
                await storageService.updateCategories(schoolId, categories);
            }
            setSaved(true);
        } catch (err) {
            console.error('Error saving:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (deleteInput !== school.name) return;
        setIsDeleting(true);
        try {
            await storageService.deleteSchool(schoolId);
            navigate('/manager/schools'); // redirect to list
        } catch (err) {
            console.error('Error deleting school:', err);
            alert("שגיאה במחיקת מוסד: " + err.message);
            setIsDeleting(false);
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
                    onClick={() => setActiveSection('info')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${activeSection === 'info' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                    <Building2 className="w-4 h-4" />
                    פרטים כלליים
                </button>
                <button
                    onClick={() => setActiveSection('locations')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${activeSection === 'locations' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                >
                    <MapPin className="w-4 h-4" />
                    מיקומים
                </button>
                <button
                    onClick={() => setActiveSection('categories')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${activeSection === 'categories' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}
                >
                    <Tag className="w-4 h-4" />
                    קטגוריות שירות
                </button>
            </div>

            {/* Info Editor */}
            {activeSection === 'info' && (
                <div className="space-y-4 bg-card rounded-2xl border p-6">
                    <div className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-sm font-medium mb-1">שם המוסד</label>
                            <input
                                value={school?.name || ''}
                                onChange={(e) => setSchool({ ...school, name: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="pt-4 border-t">
                            <label className="block text-sm font-bold text-primary mb-1">קישור Webhook (Google Sheets)</label>
                            <input
                                value={school?.webhookUrl || ''}
                                onChange={(e) => setSchool({ ...school, webhookUrl: e.target.value })}
                                placeholder="https://script.google.com/macros/s/..."
                                className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary text-left"
                                dir="ltr"
                            />
                            <p className="text-xs text-muted-foreground mt-1">אופציונלי. הדבק כאן את כתובת ה-Web App של גוגל כדי להסתנכרן אוטומטית.</p>
                        </div>

                        {/* Import from CSV */}
                        <div className="pt-4 border-t">
                            <label className="block text-sm font-bold text-primary mb-2">ייבוא פניות מ-CSV</label>
                            <p className="text-xs text-muted-foreground mb-3">ייבא פניות היסטוריות מקובץ CSV. עמודות נתמכות: תיאור, קטגוריה, לקוח, מיקום, סטטוס, דחיפות, טלפון, תאריך פתיחה, תאריך עדכון, מה בוצע, ציוד שסופק, טופל ע"י.</p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setIsImportingSheet(true);
                                    setImportResult(null);
                                    Papa.parse(file, {
                                        header: true,
                                        skipEmptyLines: true,
                                        complete: async (results) => {
                                            try {
                                                let imported = 0;
                                                for (const row of results.data) {
                                                    const callData = parseCSVRow(row, schoolId, school.name, null);
                                                    if (!callData) continue;
                                                    await storageService.createServiceCall(callData);
                                                    imported++;
                                                }
                                                setImportResult({ ok: true, msg: `יובאו ${imported} פניות בהצלחה!` });
                                            } catch (err) {
                                                setImportResult({ ok: false, msg: 'שגיאה: ' + err.message });
                                            } finally {
                                                setIsImportingSheet(false);
                                            }
                                        },
                                        error: (err) => {
                                            setImportResult({ ok: false, msg: 'שגיאה בקריאת הקובץ: ' + err.message });
                                            setIsImportingSheet(false);
                                        }
                                    });
                                    e.target.value = '';
                                }}
                                disabled={isImportingSheet}
                                className="hidden"
                                id="csv-import-input"
                            />
                            <label
                                htmlFor="csv-import-input"
                                className={`inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition cursor-pointer ${isImportingSheet ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {isImportingSheet ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                {isImportingSheet ? 'מייבא...' : 'העלה קובץ CSV'}
                            </label>
                            {importResult && (
                                <div className={`mt-3 text-sm px-3 py-2 rounded-lg ${importResult.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                    {importResult.msg}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition shadow-lg ${saved
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

            {/* Danger Zone */}
            <div className="mt-12 pt-8 border-t border-destructive/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-destructive/5 rounded-2xl p-6 border border-destructive/10">
                    <div>
                        <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
                            <AlertOctagon className="w-5 h-5" />
                            אזור מסוכן (שחיקת נתונים)
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-lg">
                            מחיקת בית הספר תסיר לחלוטין את כל הגדרות המוסד, פניות השירות הקשורות אליו, ופריטי המלאי. גישת משתמשים/מורים למוסד זה תיחסם.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
                    >
                        מחק מוסד לחלוטין
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3 text-destructive">
                                <AlertOctagon className="w-6 h-6" />
                                <h2 className="text-xl font-bold">מחיקת מוסד לצמיתות</h2>
                            </div>
                            <button onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }} className="text-muted-foreground hover:bg-muted p-2 rounded-full transition">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-sm text-foreground">
                            פעולה זו היא סופית ולא ניתנת לביטול.
                            היא תמחק את כל היסטוריית הפניות, הציוד, שיוכי המשתמשים ומבנה בית הספר.
                        </p>

                        <div className="space-y-2 bg-muted/50 p-4 rounded-xl border">
                            <p className="text-sm font-medium">כדי לאשר, אנא הקלד את שם בית הספר המדויק:</p>
                            <p className="text-sm font-bold select-none bg-white px-2 py-1 rounded inline-block border">{school.name}</p>
                            <input
                                autoFocus
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                placeholder="שם המוסד..."
                                className="w-full mt-2 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-destructive/50"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting || deleteInput !== school.name}
                                className="flex-1 bg-destructive text-white py-2.5 rounded-xl font-medium hover:bg-destructive/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-[44px]"
                            >
                                {isDeleting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "אני מבין, מחק עכשיו"}
                            </button>
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }}
                                disabled={isDeleting}
                                className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-2.5 rounded-xl font-medium transition"
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
