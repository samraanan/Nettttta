import React, { useState, useEffect, useRef } from 'react';
import { Users, Plus, X, Search, Building2, Mail, Phone, Upload, Download, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import Papa from 'papaparse';
import { storageService } from '../../services/storage';
import { authService } from '../../services/authService';
import { ROLES, ROLE_LABELS } from '../../lib/constants';

export function UserManager() {
    const [users, setUsers] = useState([]);
    const [schools, setSchools] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Bulk Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importLogs, setImportLogs] = useState([]);
    const [isImporting, setIsImporting] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        role: ROLES.CLIENT,
        phone: '',
        schoolId: ''
    });

    useEffect(() => {
        const unsubUsers = storageService.subscribeToAllUsers((data) => {
            setUsers(data);
        });
        const unsubSchools = storageService.subscribeToAllSchools((data) => {
            setSchools(data);
        });
        return () => {
            unsubUsers();
            unsubSchools();
        };
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRoleFilter ? user.role === selectedRoleFilter : true;
        return matchesSearch && matchesRole;
    });

    const handleOpenModal = () => {
        setFormData({
            displayName: '',
            email: '',
            password: '',
            role: ROLES.CLIENT,
            phone: '',
            schoolId: ''
        });
        setError(null);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setError(null);
    };

    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setFormData(prev => ({
            ...prev,
            role: newRole,
            // Reset schoolId if the role doesn't require a school
            schoolId: (newRole === ROLES.SCHOOL_ADMIN || newRole === ROLES.CLIENT) ? prev.schoolId : ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.displayName || !formData.email || !formData.password || !formData.role) {
            setError('יש למלא את כל שדות החובה');
            return;
        }

        if ((formData.role === ROLES.SCHOOL_ADMIN || formData.role === ROLES.CLIENT) && !formData.schoolId) {
            setError('יש לבחור מוסד עבור תפקיד זה');
            return;
        }

        setIsSubmitting(true);
        try {
            const schoolName = formData.schoolId
                ? schools.find(s => s.id === formData.schoolId)?.name || ''
                : '';

            await authService.adminCreateUser({
                email: formData.email,
                password: formData.password,
                displayName: formData.displayName,
                role: formData.role,
                phone: formData.phone,
                schoolId: formData.schoolId,
                schoolName: schoolName
            });
            handleCloseModal();
        } catch (err) {
            console.error('Error creating user:', err);
            setError(err.message || 'שגיאה ביצירת משתמש');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- CSV Import Methods ---
    const downloadTemplate = () => {
        const headers = ["displayName", "email", "password", "role", "phone", "schoolId"];
        const dummyData = [
            ["משה מורה", "moshe@school.com", "Password123!", "client", "050-1234567", schools[0]?.id || "school_1"],
            ["דוד מנהל", "david@admin.com", "DavidPass777", "school_admin", "", schools[0]?.id || "school_1"],
            ["יעל טכנאית", "yael@it.com", "TechYael88", "technician", "", ""]
        ];

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" +
            [headers.join(","), ...dummyData.map(row => row.join(","))].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportLogs([]);
        setIsImporting(true);
        setImportProgress(0);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const rows = results.data;
                const logs = [];
                let successCount = 0;

                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    setImportProgress(Math.round(((i + 1) / rows.length) * 100));

                    try {
                        // Basic validation
                        if (!row.email || !row.password || !row.displayName || !row.role) {
                            throw new Error('חסרים שדות חובה (email, password, displayName, role)');
                        }
                        if (!Object.values(ROLES).includes(row.role)) {
                            throw new Error(`תפקיד לא חוקי: ${row.role}. התפקידים המותרים: ${Object.values(ROLES).join(', ')}`);
                        }
                        if ((row.role === ROLES.SCHOOL_ADMIN || row.role === ROLES.CLIENT) && !row.schoolId) {
                            throw new Error(`משתמש בתפקיד ${row.role} חייב שיוך למוסד (schoolId)`);
                        }

                        const schoolName = row.schoolId ? schools.find(s => s.id === row.schoolId)?.name || '' : '';

                        await authService.adminCreateUser({
                            email: row.email.trim(),
                            password: row.password.trim(),
                            displayName: row.displayName.trim(),
                            role: row.role.trim(),
                            phone: row.phone?.trim() || null,
                            schoolId: row.schoolId?.trim() || null,
                            schoolName: schoolName
                        });

                        successCount++;
                        logs.push({ success: true, message: `[${row.email}] נוצר בהצלחה` });
                    } catch (err) {
                        logs.push({ success: false, message: `[${row.email || `שורה ${i + 2}`}] שגיאה: ${err.message}` });
                    }
                }

                setImportLogs(logs);
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            error: (error) => {
                setImportLogs([{ success: false, message: `שגיאה בקריאת הקובץ: ${error.message}` }]);
                setIsImporting(false);
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">ניהול משתמשים</h1>
                        <p className="text-muted-foreground text-sm">ניהול הרשאות ומשתמשים במערכת</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-white border border-border text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Upload className="w-4 h-4" />
                        ייבוא מקובץ CSV
                    </button>
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        משתמש חדש
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-border p-4">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="חיפוש משתמשים..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                        />
                    </div>
                    <select
                        value={selectedRoleFilter}
                        onChange={(e) => setSelectedRoleFilter(e.target.value)}
                        className="w-full sm:w-48 px-4 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                    >
                        <option value="">כל התפקידים</option>
                        {Object.entries(ROLE_LABELS).map(([roleValue, label]) => (
                            <option key={roleValue} value={roleValue}>{label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>לא נמצאו משתמשים התואמים את החיפוש</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredUsers.map(user => (
                                <div key={user.id} className="p-4 rounded-xl border border-border flex flex-col justify-between">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold">{user.displayName}</h3>
                                            <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-md mt-1">
                                                {ROLE_LABELS[user.role] || user.role}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span>{user.email}</span>
                                        </div>
                                        {user.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span dir="ltr">{user.phone}</span>
                                            </div>
                                        )}
                                        {user.schoolName && (
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-3.5 h-3.5" />
                                                <span>{user.schoolName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50/50">
                            <h2 className="font-bold text-lg">משתמש חדש</h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-xl hover:bg-black/5 text-muted-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1.5">שם מלא *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.displayName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                    placeholder="שם מלא של המשתמש"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">אימייל *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-left"
                                    dir="ltr"
                                    placeholder="user@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">סיסמה *</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-left"
                                    dir="ltr"
                                    placeholder="לפחות 6 תווים"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">טלפון</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm text-left"
                                    dir="ltr"
                                    placeholder="05X-XXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">תפקיד במערכת *</label>
                                <select
                                    value={formData.role}
                                    onChange={handleRoleChange}
                                    className="w-full px-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                                >
                                    {Object.entries(ROLE_LABELS).map(([roleValue, label]) => (
                                        <option key={roleValue} value={roleValue}>{label}</option>
                                    ))}
                                </select>
                            </div>

                            {(formData.role === ROLES.SCHOOL_ADMIN || formData.role === ROLES.CLIENT) && (
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">שיוך למוסד *</label>
                                    <select
                                        required
                                        value={formData.schoolId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, schoolId: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
                                    >
                                        <option value="">בחר מוסד...</option>
                                        {schools.map(school => (
                                            <option key={school.id} value={school.id}>{school.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    disabled={isSubmitting}
                                >
                                    ביטול
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? 'שומר...' : 'צור משתמש'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50/50">
                            <div>
                                <h2 className="font-bold text-lg">ייבוא משתמשים המוני</h2>
                                <p className="text-sm text-muted-foreground mt-1">ייבוא רשימת משתמשים דרך קובץ אקסל חיתוך פסיק (CSV)</p>
                            </div>
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                className="p-2 rounded-xl hover:bg-black/5 text-muted-foreground transition-colors"
                                disabled={isImporting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6 overflow-y-auto">
                            {/* Actions block */}
                            {!isImporting && importLogs.length === 0 && (
                                <div className="space-y-4">
                                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm">
                                        <p className="font-semibold text-blue-900 mb-2">איך זה עובד?</p>
                                        <ol className="list-decimal list-inside space-y-1 text-blue-800">
                                            <li>הורד את קובץ התבנית (Template)</li>
                                            <li>מלא את נתוני המשתמשים (אין לשנות את כותרות העמודות באנגלית)</li>
                                            <li>מזהה המוסד (schoolId) הכרחי למורים ולקוחות. (מזהים קיימים: {schools.map(s => <code key={s.id} className="mx-1 px-1 bg-white rounded">{s.id}</code>)})</li>
                                            <li>העלה את הקובץ המוכן חזרה לכאן</li>
                                        </ol>
                                        <button
                                            onClick={downloadTemplate}
                                            className="mt-3 flex items-center gap-2 text-primary font-medium hover:underline"
                                        >
                                            <Download className="w-4 h-4" />
                                            הורד תבנית CSV
                                        </button>
                                    </div>

                                    <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                                        <h3 className="font-medium mb-1">בחר קובץ להעלאה</h3>
                                        <p className="text-sm text-muted-foreground mb-4">תומך רק ב-.csv</p>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            className="hidden"
                                            id="csv-upload"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                        />
                                        <label
                                            htmlFor="csv-upload"
                                            className="inline-flex bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:border-primary/50 transition-colors"
                                        >
                                            בחר קובץ מהמחשב
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Progress State */}
                            {isImporting && (
                                <div className="py-12 text-center space-y-4">
                                    <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
                                    <div>
                                        <p className="font-medium text-lg">מייבא משתמשים...</p>
                                        <p className="text-muted-foreground text-sm">נוצרות עכשיו רשומות במסוף - פקודה זו עשויה לקחת זמן בהתאם לכמות המשתמשים בקובץ.</p>
                                    </div>
                                    <div className="w-full max-w-xs mx-auto bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                            style={{ width: `${importProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm font-medium">{importProgress}%</p>
                                </div>
                            )}

                            {/* Results State */}
                            {!isImporting && importLogs.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-border">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-border text-2xl font-bold text-primary">
                                            {importLogs.filter(l => l.success).length}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">משתמשים יובאו בהצלחה</p>
                                            <p className="text-muted-foreground text-sm">מתוך {importLogs.length} רשומות בקובץ</p>
                                        </div>
                                    </div>

                                    <div className="border border-border rounded-xl overflow-hidden text-sm">
                                        <div className="bg-slate-50 px-4 py-2 border-b border-border font-medium flex justify-between">
                                            <span>פירוט תוצאות הייבוא</span>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto p-2">
                                            <ul className="space-y-1">
                                                {importLogs.map((log, idx) => (
                                                    <li key={idx} className={`flex items-start gap-2 p-2 rounded-lg ${log.success ? 'hover:bg-green-50/50' : 'bg-red-50 text-red-900 border border-red-100'}`}>
                                                        {log.success ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                                                        ) : (
                                                            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                                        )}
                                                        <span dir="auto">{log.message}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            onClick={() => setImportLogs([])}
                                            className="text-sm text-primary font-medium hover:underline px-2"
                                        >
                                            ייבא קובץ נוסף
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
