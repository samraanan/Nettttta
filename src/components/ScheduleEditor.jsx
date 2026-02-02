import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Plus, X, Save, GripVertical, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { SubjectManager } from './SubjectManager';

const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי'];

export function ScheduleEditor({ onClose }) {
    const [template, setTemplate] = useState({});
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSubjectManager, setShowSubjectManager] = useState(false);

    // Saving state
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const unsubTemplate = storageService.subscribeToTemplate((data) => {
            setTemplate(data || {});
        });

        const unsubSubjects = storageService.subscribeToSubjects((list) => {
            setSubjects(list);
            setLoading(false);
        });

        return () => {
            unsubTemplate();
            unsubSubjects();
        };
    }, []);

    // Local update only - NO AUTO SAVE
    const handleLocalUpdate = (dayIndex, updatedLessons) => {
        setTemplate(prev => ({ ...prev, [dayIndex]: updatedLessons }));
        setHasChanges(true);
    };

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            // Save each day that has data
            // Note: In a real app, we might want a batch update. 
            // Here we iterate to match the existing storageService API.
            const updates = Object.keys(template).map(async (dayIndex) => {
                await storageService.updateTemplate(parseInt(dayIndex), template[dayIndex]);
            });

            await Promise.all(updates);
            setHasChanges(false);
            alert("המערכת נשמרה בהצלחה!");
        } catch (error) {
            console.error("Failed to save template", error);
            alert("שגיאה בשמירת הנתונים! נא לנסות שוב.");
        } finally {
            setSaving(false);
        }
    };

    const addLesson = (dayIndex) => {
        const currentLessons = template[dayIndex] || [];
        const lastTime = currentLessons.length > 0 ? currentLessons[currentLessons.length - 1].time : '08:00';
        const [h, m] = lastTime.split(':').map(Number);
        const nextTime = `${String(h + 1).padStart(2, '0')}:00`;

        const newLesson = {
            time: nextTime,
            subject: subjects[0]?.value || 'שיעור חדש',
            teacherId: 't1'
        };
        handleLocalUpdate(dayIndex, [...currentLessons, newLesson]);
    };

    const removeLesson = (dayIndex, lessonIndex) => {
        const currentLessons = template[dayIndex] || [];
        const updated = currentLessons.filter((_, idx) => idx !== lessonIndex);
        handleLocalUpdate(dayIndex, updated);
    };

    const updateLessonField = (dayIndex, lessonIndex, field, value) => {
        const currentLessons = [...(template[dayIndex] || [])];
        currentLessons[lessonIndex] = { ...currentLessons[lessonIndex], [field]: value };

        if (field === 'subject') {
            const subjectObj = subjects.find(s => s.value === value);
            if (subjectObj) {
                currentLessons[lessonIndex].teacherId = subjectObj.id;
            }
        }

        handleLocalUpdate(dayIndex, currentLessons);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">טוען נתונים...</div>;

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto" dir="rtl">
            <div className="min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="max-w-[1600px] mx-auto space-y-6">

                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-center sticky top-4 z-10">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold text-slate-800">עריכת מערכת שבועית</h2>
                                {hasChanges && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse border border-amber-200">יש שינויים לא שמורים</span>}
                            </div>
                            <p className="text-slate-500 text-sm mt-1">נהל את השיעורים לכל השבוע</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSubjectManager(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-primary transition shadow-sm font-medium"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">ניהול מקצועות</span>
                            </button>

                            <button
                                onClick={handleSaveAll}
                                disabled={!hasChanges || saving}
                                className={clsx(
                                    "flex items-center gap-2 px-6 py-2 rounded-xl text-white font-bold transition shadow-md",
                                    hasChanges && !saving
                                        ? "bg-green-600 hover:bg-green-700 hover:scale-105 active:scale-95"
                                        : "bg-slate-300 cursor-not-allowed"
                                )}
                            >
                                <Save className="w-5 h-5" />
                                {saving ? "שומר..." : "שמור שינויים"}
                            </button>

                            <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Grid Layout - Full Week */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
                        {DAYS.map((dayName, dayIndex) => (
                            <div key={dayIndex} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                                <div className="p-4 bg-slate-50 border-b font-bold text-lg text-slate-700 text-center">
                                    {dayName}
                                </div>
                                <div className="p-4 space-y-3 min-h-[300px]">
                                    {(template[dayIndex] || []).map((lesson, idx) => (
                                        <div key={idx} className="flex flex-col gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 group hover:border-primary/30 transition shadow-sm">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={lesson.time}
                                                    onChange={(e) => updateLessonField(dayIndex, idx, 'time', e.target.value)}
                                                    className="p-1 border rounded text-sm w-[70px] text-center font-mono bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                                <button
                                                    onClick={() => removeLesson(dayIndex, idx)}
                                                    className="ml-auto p-1 text-slate-300 hover:text-red-500 rounded hover:bg-red-50 transition"
                                                    title="מחק שיעור"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {subjects.some(opt => opt.value === lesson.subject) ? (
                                                <select
                                                    value={lesson.subject}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'OTHER') {
                                                            updateLessonField(dayIndex, idx, 'subject', '');
                                                        } else {
                                                            updateLessonField(dayIndex, idx, 'subject', val);
                                                        }
                                                    }}
                                                    className="w-full p-2 border rounded-md text-sm font-bold bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                                                >
                                                    {subjects.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                    <option value="OTHER" className="text-slate-500 font-normal">📝 הזן ידנית...</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={lesson.subject}
                                                    placeholder="שם שיעור..."
                                                    onChange={(e) => updateLessonField(dayIndex, idx, 'subject', e.target.value)}
                                                    className="w-full p-2 border rounded-md text-sm font-bold bg-white focus:ring-2 focus:ring-primary focus:outline-none"
                                                />
                                            )}
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => addLesson(dayIndex)}
                                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition flex items-center justify-center gap-2 mt-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        הוסף שיעור
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 text-center text-slate-400 text-sm pb-10">
                        אל תשכח לשמור את השינויים בסיום העריכה!
                    </div>

                </div>
            </div>

            {showSubjectManager && (
                <SubjectManager
                    subjects={subjects}
                    onClose={() => setShowSubjectManager(false)}
                />
            )}
        </div>
    );
}
