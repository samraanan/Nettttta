import React, { useState } from 'react';
import { clsx } from 'clsx';
import { X, Plus, Trash2 } from 'lucide-react';
import { storageService } from '../services/storage';

export function SubjectManager({ subjects, onClose }) {
    const [newSubject, setNewSubject] = useState('');

    const handleAdd = () => {
        if (!newSubject.trim()) return;

        // Simple ID generation for now
        const id = `t${Date.now()}`;
        const newItem = { value: newSubject, label: newSubject, id };

        const updated = [...subjects, newItem];
        storageService.updateSubjects(updated);
        setNewSubject('');
    };

    const handleRemove = (index) => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק מקצוע זה?')) {
            const updated = subjects.filter((_, i) => i !== index);
            storageService.updateSubjects(updated);
        }
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
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                            <div className="font-medium">{sub.label}</div>
                            <button
                                onClick={() => handleRemove(idx)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {subjects.length === 0 && (
                        <div className="text-center text-slate-400 py-4">אין מקצועות ברשימה</div>
                    )}
                </div>

                <div className="p-4 border-t bg-slate-50">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="שם מקצוע חדש..."
                            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!newSubject.trim()}
                            className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
