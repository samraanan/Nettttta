import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Tag, Package, Save, ArrowRight, ArrowLeft, CheckCircle2, ChevronLeft, Trash2, Plus } from 'lucide-react';
import { storageService } from '../../services/storage';
import { DEFAULT_CATEGORIES } from '../../lib/constants';

const STEPS = [
    { id: 1, title: 'פרטי מוסד', icon: Building2 },
    { id: 2, title: 'מבנה מיקומים', icon: MapPin },
    { id: 3, title: 'קטגוריות שירות', icon: Tag },
    { id: 4, title: 'מלאי ראשוני', icon: Package }
];

const STARTER_INVENTORY = [
    { name: 'עכבר אלחוטי', minStock: 2, inStock: 0 },
    { name: 'עכבר חוטי', minStock: 5, inStock: 0 },
    { name: 'מקלדת כבל', minStock: 5, inStock: 0 },
    { name: 'מקלדת אלחוטית', minStock: 2, inStock: 0 },
    { name: 'כבל HDMI 2m', minStock: 10, inStock: 0 },
    { name: 'מטען מחשב נייד Type-C', minStock: 3, inStock: 0 },
    { name: 'כבל רשת יצוק 2m', minStock: 5, inStock: 0 },
    { name: 'מתאם Type-C ל-HDMI', minStock: 5, inStock: 0 },
    { name: 'מקרן חלופי נייד', minStock: 1, inStock: 0 }
];

export function NewSchoolWizard() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    // Form States
    const [info, setInfo] = useState({ name: '', address: '', contactName: '', webhookUrl: '' });
    const [structureLevelName, setStructureLevelName] = useState('שכבה');
    const [locations, setLocations] = useState({ floors: [] });
    const [categories, setCategories] = useState([...DEFAULT_CATEGORIES]);
    const [inventory, setInventory] = useState(STARTER_INVENTORY.map(item => ({ ...item, id: `inv_${Date.now()}_${Math.random()}` })));

    // Location Builders (adapted from SchoolSetup)
    const addFloor = () => setLocations(prev => ({ ...prev, floors: [...prev.floors, { id: `floor_${Date.now()}`, label: '', categories: [] }] }));
    const updateFloor = (fi, label) => setLocations(prev => { const f = [...prev.floors]; f[fi].label = label; return { ...prev, floors: f }; });
    const removeFloor = (fi) => setLocations(prev => ({ ...prev, floors: prev.floors.filter((_, i) => i !== fi) }));

    // Simple validation per step
    const canProceed = () => {
        if (currentStep === 1) return info.name.trim().length >= 2;
        if (currentStep === 2) return locations.floors.length > 0 && locations.floors.every(f => f.label.trim() !== '');
        if (currentStep === 3) return categories.length > 0 && categories.every(c => c.label.trim() !== '');
        return true;
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Create the school document
            const newSchoolRef = await storageService.addSchool({
                ...info,
                structureLevelName,
                active: true,
                createdAt: new Date().toISOString()
            });

            // 2. Create nested metadata collections
            await storageService.updateLocations(newSchoolRef.id, locations);
            await storageService.updateCategories(newSchoolRef.id, categories);

            // 3. Create initial inventory instances tagged for this school (Optional optimization: use Batch)
            const activeInventory = inventory.filter(inv => inv.inStock > 0);
            for (const inv of activeInventory) {
                await storageService.addInventoryItem({
                    name: inv.name,
                    sku: `auto-${Math.floor(Math.random() * 10000)}`,
                    inStock: parseInt(inv.inStock, 10),
                    minStock: inv.minStock,
                    schoolId: newSchoolRef.id
                });
            }

            navigate(`/manager/schools/${newSchoolRef.id}`);
        } catch (error) {
            console.error("Error creating school:", error);
            alert("שגיאה בהקמת המוסד: " + error.message);
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div>
                <button onClick={() => navigate('/manager/schools')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-4">
                    <ArrowRight className="w-4 h-4" /> חזרה לבתי ספר
                </button>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-primary" /> אשף הקמת מוסד חדש
                </h1>
                <p className="text-sm text-muted-foreground mt-1">תהליך מובנה להעלאת בית ספר חדש פנימה בקלות ובמהירות</p>
            </div>

            {/* Stepper Wizard Progress */}
            <div className="flex items-center justify-between relative mb-8">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -z-10" />
                {STEPS.map((step, idx) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5 border-0" />}
                            </div>
                            <span className={`text-xs font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step.title}</span>
                        </div>
                    );
                })}
            </div>

            {/* Wizard Content Cards */}
            <div className="bg-card rounded-2xl border p-6 min-h-[400px]">

                {/* STEP 1: Info */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-lg font-bold">פרטי בסיס</h2>
                            <p className="text-sm text-muted-foreground">הזן את פרטי ההתקשרות של בית הספר</p>
                        </div>
                        <div className="space-y-3 pt-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">שם המוסד *</label>
                                <input autoFocus value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} placeholder="למשל: תיכון אורט כרמים" className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">כתובת</label>
                                <input value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })} placeholder="רחוב ועיר" className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">איש קשר ראשי</label>
                                <input value={info.contactName} onChange={e => setInfo({ ...info, contactName: e.target.value })} placeholder="שם איש קשר במזכירות / הנהלה" className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="pt-2 border-t mt-4">
                                <label className="block text-sm font-bold mb-1 text-primary">קישור Webhook (Google Sheets Integration)</label>
                                <input value={info.webhookUrl} onChange={e => setInfo({ ...info, webhookUrl: e.target.value })} placeholder="https://script.google.com/macros/s/..." className="w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary text-left" dir="ltr" />
                                <p className="text-xs text-muted-foreground mt-1">אופציונלי. הדבק כאן את כתובת ה-Web App של גוגל כדי להסתנכרן אוטומטית לגליליון אקסל (ראה קובץ GAS_WEBHOOK_TEMPLATE.js).</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: Structure */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-lg font-bold">הגדרת מבנה ארגוני</h2>
                            <p className="text-sm text-muted-foreground">בחר את סוג החלוקה והקם את המבנים הראשיים</p>
                        </div>
                        <div className="pt-4 space-y-4">
                            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                                <label className="block text-sm font-semibold mb-2 text-primary">איך נקראת חלוקת העל במקום זה?</label>
                                <select value={structureLevelName} onChange={e => setStructureLevelName(e.target.value)} className="w-full p-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="שכבה">שכבות (מומלץ לבתי ספר עיוניים)</option>
                                    <option value="בניין">בניינים (למוסדות גדולים/קמפוסים)</option>
                                    <option value="קמפוס">קמפוסים</option>
                                    <option value="אגף">אגפים</option>
                                    <option value="קומה">קומות (לגנים ומבנים פשוטים)</option>
                                </select>
                                <p className="text-xs text-muted-foreground mt-2">המשתמשים יראו "בחירת {structureLevelName}" בטופס הדיווח.</p>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-semibold">רשימת ה{structureLevelName}ות *</label>
                                {locations.floors.map((floor, fi) => (
                                    <div key={floor.id} className="flex items-center gap-2">
                                        <input value={floor.label} onChange={(e) => updateFloor(fi, e.target.value)} placeholder={`למשל: ${structureLevelName} ז'`} className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                                        <button onClick={() => removeFloor(fi)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                <button onClick={addFloor} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition py-1">
                                    <Plus className="w-4 h-4" /> הוסף {structureLevelName}
                                </button>
                                <p className="text-xs text-muted-foreground">לאחר סיום האשף תוכל להיכנס להגדרות המוסד ולפרט את החדרים במדויק בתוך כל {structureLevelName}.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Categories */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-lg font-bold">קטגוריות שירות</h2>
                            <p className="text-sm text-muted-foreground">הגדר באילו נושאים מורים יוכלו לפתוח פניות (נטען מברירת המחדל מערכתית)</p>
                        </div>
                        <div className="pt-4 space-y-2">
                            {categories.map((cat, idx) => (
                                <div key={cat.value} className="flex items-center gap-2">
                                    <span className="w-8 text-center text-xs text-muted-foreground">{idx + 1}</span>
                                    <input value={cat.label} onChange={(e) => {
                                        const newCats = [...categories];
                                        newCats[idx] = { ...cat, label: e.target.value };
                                        setCategories(newCats);
                                    }} placeholder="שם הקטגוריה" className="flex-1 px-3 py-2 rounded-xl border text-sm" />
                                    <button onClick={() => setCategories(c => c.filter((_, i) => i !== idx))} disabled={categories.length <= 1} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-30">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => setCategories(c => [...c, { value: `custom_${Date.now()}`, label: '' }])} className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition py-1">
                                <Plus className="w-4 h-4" /> הוסף קטגוריה
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 4: Initial Inventory */}
                {currentStep === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2"><Package className="w-5 h-5" /> מורשת מלאי משוער (אופציונלי)</h2>
                            <p className="text-sm text-muted-foreground">הכנס ציוד מתכלה שכבר מוקצה למוסד זה. המלאי יעודכן בבסיס הנתונים תחת המוסד הנוכחי.</p>
                        </div>
                        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {inventory.map((item, idx) => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded-xl bg-muted/20">
                                    <div>
                                        <p className="text-sm font-semibold">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">מינימום נדרש: {item.minStock}</p>
                                    </div>
                                    <div className="w-20">
                                        <input type="number" min="0" value={item.inStock} onChange={(e) => {
                                            const newInv = [...inventory];
                                            newInv[idx].inStock = e.target.value;
                                            setInventory(newInv);
                                        }} className="w-full px-2 py-1 border rounded text-center focus:ring-2 focus:ring-primary" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Wizard Navigation */}
            <div className="flex justify-between items-center pt-4">
                <button
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    disabled={currentStep === 1 || isSaving}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                    <ArrowRight className="w-4 h-4" />
                    קודם
                </button>

                {currentStep < 4 ? (
                    <button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                    >
                        הבא
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl hover:bg-emerald-600 transition disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        סיים וצור מוסד
                    </button>
                )}
            </div>
        </div>
    );
}
