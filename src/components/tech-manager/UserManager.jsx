import React, { useState, useEffect } from 'react';
import { Users, Plus, X, Search, Building2, MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
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
                <button
                    onClick={handleOpenModal}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    משתמש חדש
                </button>
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
        </div>
    );
}
