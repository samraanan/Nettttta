import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { X, Plus, Trash2, Copy } from 'lucide-react';
import { storageService } from '../services/storage';

export function SubjectManager({ subjects, onClose }) {
    const [newSubject, setNewSubject] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [newTeacherName, setNewTeacherName] = useState('');
    const [newTeacherLink, setNewTeacherLink] = useState('');
    const [teachers, setTeachers] = useState([]);

    // Inline new-teacher form for existing subjects
    const [inlineNewTeacherIdx, setInlineNewTeacherIdx] = useState(null);
    const [inlineName, setInlineName] = useState('');
    const [inlineLink, setInlineLink] = useState('');

    useEffect(() => {
        const unsubTeachers = storageService.subscribeToTeachers((list) => {
            setTeachers(list);
        });
        return () => unsubTeachers();
    }, []);

    const handleAdd = async () => {
        if (!newSubject.trim()) return;

        let finalTeacherId = selectedTeacherId;

        // If 'new' is selected and a name is provided
        if (selectedTeacherId === 'new' && newTeacherName.trim() && newTeacherLink.trim()) {
            finalTeacherId = newTeacherLink.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
            if (!finalTeacherId) {
                alert('אנא הזן כינוי חוקי לתצוגה בקישור (באנגלית / מספרים / מקפים)');
                return;
            }
            if (teachers.some(t => t.id === finalTeacherId)) {
                alert('הכינוי באנגלית כבר בשימוש עבור מורה אחר. אנא בחר כינוי אחר.');
                return;
            }
            const updatedTeachers = [...teachers, { id: finalTeacherId, name: newTeacherName }];
            await storageService.updateTeachers(updatedTeachers);
        } else if (!finalTeacherId || finalTeacherId === 'new') {
            alert('אנא בחר מורה קיים, או השלם את פרטי המורה החדש');
            return;
        }

        const id = `s${Date.now()}`; // Subject ID
        const newItem = { value: newSubject, label: newSubject, id, teacherId: finalTeacherId };

        const updated = [...subjects, newItem];
        await storageService.updateSubjects(updated);
        setNewSubject('');
        setSelectedTeacherId('');
        setNewTeacherName('');
        setNewTeacherLink('');
    };

    const handleRemove = (index) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק מקצוע זה?')) {
            const updated = subjects.filter((_, i) => i !== index);
            storageService.updateSubjects(updated);
        }
    };

    const handleCopyLink = (tId) => {
        if (!tId) return;
        const url = `${window.location.origin}/teacher/${tId}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('הקישור הועתק בהצלחה:\n' + url);
        }).catch(err => {
            alert('שגיאה בהעתקת הקישור. הקישור הוא:\n' + url);
        });
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center p-4 text-slate-800" dir="rtl">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="font-bold">ניהול רשימת מקצועות</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {subjects.map((sub, idx) => (
                        <div key={idx} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                            <div className="flex items-center justify-between">
                                <div className="font-medium text-lg">{sub.label}</div>
                                <button
                                    onClick={() => handleRemove(idx)}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    title="מחק מקצוע"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-slate-500">מורה משויך:</span>
                                <select
                                    value={inlineNewTeacherIdx === idx ? '__new__' : (sub.teacherId || '')}
                                    onChange={(e) => {
                                        if (e.target.value === '__new__') {
                                            setInlineNewTeacherIdx(idx);
                                            setInlineName('');
                                            setInlineLink('');
                                        } else {
                                            setInlineNewTeacherIdx(null);
                                            const updated = [...subjects];
                                            updated[idx] = { ...updated[idx], teacherId: e.target.value };
                                            storageService.updateSubjects(updated);
                                        }
                                    }}
                                    className="bg-white/50 border rounded p-1 flex-1 text-sm outline-none focus:border-primary"
                                >
                                    <option value="">-- ללא מורה --</option>
                                    {teachers.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                    <option value="__new__">+ מורה חדש</option>
                                </select>
                                {sub.teacherId && inlineNewTeacherIdx !== idx && (
                                    <button
                                        onClick={() => handleCopyLink(sub.teacherId)}
                                        className="p-1 px-2 text-primary hover:bg-primary/10 rounded font-medium flex items-center gap-1 transition shrink-0"
                                        title="העתק קישור למורה זה"
                                    >
                                        <Copy className="w-4 h-4" />
                                        <span className="text-xs">העתק קישור</span>
                                    </button>
                                )}
                            </div>
                            {inlineNewTeacherIdx === idx && (
                                <div className="flex flex-col gap-1.5 mt-1 p-2 bg-white border border-slate-200 rounded-lg">
                                    <input
                                        type="text"
                                        value={inlineName}
                                        onChange={(e) => setInlineName(e.target.value)}
                                        placeholder="שם המורה"
                                        autoFocus
                                        className="w-full p-1.5 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <input
                                        type="text"
                                        value={inlineLink}
                                        onChange={(e) => setInlineLink(e.target.value)}
                                        placeholder="כינוי באנגלית לקישור (למשל: dalit)"
                                        className="w-full p-1.5 text-sm border rounded focus:ring-1 focus:ring-primary outline-none"
                                        dir="ltr"
                                    />
                                    {inlineLink && (
                                        <div className="text-xs text-slate-400" dir="ltr">
                                            /teacher/<b>{inlineLink.toLowerCase().replace(/[^a-z0-9_-]/g, '')}</b>
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-0.5">
                                        <button
                                            onClick={async () => {
                                                if (!inlineName.trim() || !inlineLink.trim()) return;
                                                const newId = inlineLink.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
                                                if (!newId) return;
                                                if (teachers.some(t => t.id === newId)) {
                                                    alert('הכינוי כבר בשימוש');
                                                    return;
                                                }
                                                const updatedTeachers = [...teachers, { id: newId, name: inlineName.trim() }];
                                                await storageService.updateTeachers(updatedTeachers);
                                                const updatedSubjects = [...subjects];
                                                updatedSubjects[idx] = { ...updatedSubjects[idx], teacherId: newId };
                                                await storageService.updateSubjects(updatedSubjects);
                                                setInlineNewTeacherIdx(null);
                                            }}
                                            disabled={!inlineName.trim() || !inlineLink.trim()}
                                            className="flex-1 bg-primary text-white text-sm py-1 rounded disabled:opacity-40 transition"
                                        >
                                            שמור
                                        </button>
                                        <button
                                            onClick={() => setInlineNewTeacherIdx(null)}
                                            className="px-3 text-sm text-slate-500 hover:text-slate-700 border rounded transition"
                                        >
                                            ביטול
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {subjects.length === 0 && (
                        <div className="text-center text-slate-400 py-4">אין מקצועות ברשימה</div>
                    )}
                </div>

                <div className="p-4 border-t bg-slate-50 flex flex-col gap-2">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="שם מקצוע חדש..."
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />

                    <select
                        value={selectedTeacherId}
                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                    >
                        <option value="">-- בחר מורה --</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                        <option value="new">+ הוסף מורה חדש</option>
                    </select>

                    {selectedTeacherId === 'new' && (
                        <div className="flex flex-col gap-2">
                            <input
                                type="text"
                                value={newTeacherName}
                                onChange={(e) => setNewTeacherName(e.target.value)}
                                placeholder="שם המורה (למשל: דלית, יוסי)"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                            <input
                                type="text"
                                value={newTeacherLink}
                                onChange={(e) => setNewTeacherLink(e.target.value)}
                                placeholder="כינוי באנגלית לקישור (למשל: dalit)"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                dir="ltr"
                            />
                            <div className="text-xs text-slate-500 text-left px-1" dir="ltr">
                                Link: /teacher/<b>{newTeacherLink ? newTeacherLink.toLowerCase().replace(/[^a-z0-9_-]/g, '') : 'name'}</b>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAdd}
                        disabled={!newSubject.trim() || !selectedTeacherId || (selectedTeacherId === 'new' && (!newTeacherName.trim() || !newTeacherLink.trim()))}
                        className="w-full bg-primary text-white p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2"
                    >
                        <Plus className="w-5 h-5" />
                        הוסף מקצוע
                    </button>
                </div>
            </div>
        </div>
    );
}
