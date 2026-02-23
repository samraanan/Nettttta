import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, ChevronDown, Sparkles, X } from 'lucide-react';
import { ScoringControl } from './ScoringControl';
import { storageService } from '../services/storage';

export function LessonCard({ lesson, role, teacherId, onUpdate }) {
    const isLessonTeacher = role === 'admin' || (role === 'teacher' && teacherId === lesson.teacherId);
    const isStudent = role === 'student';
    const isVerified = lesson.status === 'verified';

    const [isOpen, setIsOpen] = useState(isLessonTeacher || isStudent);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const unsubSubjects = storageService.subscribeToSubjects(setSubjects);
        const unsubTeachers = storageService.subscribeToTeachers(setTeachers);
        return () => { unsubSubjects(); unsubTeachers(); };
    }, []);

    // "אחר" picker state
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState('existing'); // 'existing' | 'new'
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [newTeacherName, setNewTeacherName] = useState('');

    const handleSubjectChange = (val) => {
        if (val === '__other__') {
            setShowPicker(true);
            setPickerMode('existing');
            setSelectedTeacherId('');
            setNewTeacherName('');
            return;
        }
        const subj = subjects.find(s => s.value === val);
        if (subj) {
            onUpdate(lesson.id, { subject: val, teacherId: subj.id, subjectEdited: true });
        } else {
            onUpdate(lesson.id, { subject: val, teacherId: '', subjectEdited: true });
        }
    };

    const handlePickerConfirm = async (e) => {
        e.stopPropagation();
        if (pickerMode === 'existing') {
            if (!selectedTeacherId) return;
            const teacher = teachers.find(t => t.id === selectedTeacherId);
            if (teacher) {
                onUpdate(lesson.id, { subject: teacher.name, teacherId: teacher.id, subjectEdited: true });
            }
        } else {
            if (!newTeacherName.trim()) return;
            const newId = 't_' + Date.now();
            const newTeacher = { id: newId, name: newTeacherName.trim() };
            await storageService.updateTeachers([...teachers, newTeacher]);
            onUpdate(lesson.id, { subject: newTeacherName.trim(), teacherId: newId, subjectEdited: true });
        }
        setShowPicker(false);
    };

    const handlePickerCancel = (e) => {
        e.stopPropagation();
        setShowPicker(false);
    };

    // Edit mode for verified lessons (teachers only)
    const [isEditMode, setIsEditMode] = useState(false);

    const handleScoreChange = (param, value) => {
        if (isVerified && !isEditMode && role !== 'admin') {
            alert('שיעור זה כבר אומת והוא נעול לעריכה');
            return;
        }
        if (isLessonTeacher) {
            const newTeacherRating = { ...(lesson.teacherRating || lesson.studentRating || {}), [param]: value };
            onUpdate(lesson.id, { teacherRating: newTeacherRating });
        } else if (isStudent) {
            const newStudentRating = { ...(lesson.studentRating || {}), [param]: value };
            onUpdate(lesson.id, { studentRating: newStudentRating });
        }
    };

    const handleApprove = () => {
        let finalRating = lesson.teacherRating;
        if (!finalRating && lesson.studentRating) {
            finalRating = { ...lesson.studentRating };
        }
        onUpdate(lesson.id, { status: 'verified', teacherRating: finalRating });
        setIsEditMode(false);
    };

    const handleToggleEdit = () => setIsEditMode(!isEditMode);

    const calculateScore = (rating) => {
        if (!rating) return 0;
        return (rating.participation || 0) + (rating.assignments || 0) + (rating.equipment || 0);
    };

    const displayScore = isVerified
        ? calculateScore(lesson.teacherRating)
        : (isLessonTeacher ? calculateScore(lesson.teacherRating || lesson.studentRating) : calculateScore(lesson.studentRating));

    return (
        <div className={cn(
            "rounded-2xl border transition-all duration-300 overflow-hidden",
            isVerified ? "bg-white/80 border-emerald-100" : "bg-white border-border shadow-sm",
            isOpen ? "shadow-md ring-1 ring-black/5" : ""
        )}>
            {/* Header */}
            <div
                onClick={() => !showPicker && setIsOpen(!isOpen)}
                className={cn(
                    "p-4 flex items-center justify-between cursor-pointer",
                    isVerified && "bg-emerald-50/50"
                )}
            >
                <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    {isVerified ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className={cn("w-6 h-6 flex items-center justify-center",
                                lesson.status === 'pending' ? "rounded-full border-2 border-yellow-400 bg-yellow-50 text-xs font-bold text-yellow-600" : "text-sm font-bold text-slate-400"
                            )}>
                                {lesson.status === 'pending' ? '!' : lesson.slot}
                            </div>
                            {isLessonTeacher && lesson.status === 'pending' && (
                                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    ממתין לאישור
                                </span>
                            )}
                        </div>
                    )}

                    {/* Subject selector or teacher picker */}
                    {showPicker ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {pickerMode === 'existing' ? (
                                <select
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    autoFocus
                                    className="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-slate-400 bg-white"
                                >
                                    <option value="">בחר מורה...</option>
                                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={newTeacherName}
                                    onChange={(e) => setNewTeacherName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePickerConfirm(e)}
                                    placeholder="שם המורה"
                                    autoFocus
                                    className="text-sm border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-slate-400 w-28"
                                />
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); setPickerMode(pickerMode === 'existing' ? 'new' : 'existing'); }}
                                className="text-xs text-primary underline whitespace-nowrap"
                            >
                                {pickerMode === 'existing' ? '+ חדש' : 'מהרשימה'}
                            </button>
                            <button
                                onClick={handlePickerConfirm}
                                className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-md font-medium"
                            >
                                אישור
                            </button>
                            <button onClick={handlePickerCancel} className="text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <label
                            className="flex items-center border border-slate-200 rounded-lg px-2 py-0.5 cursor-pointer hover:border-slate-300 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <select
                                value={lesson.subject || ''}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleSubjectChange(e.target.value)}
                                className="appearance-none bg-transparent text-base font-semibold text-slate-600 cursor-pointer outline-none"
                            >
                                <option value="">ללא מקצוע</option>
                                {subjects.map(s => <option key={s.id} value={s.value}>{s.label}</option>)}
                                <option value="__other__">אחר...</option>
                            </select>
                        </label>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Score Badge */}
                    {(lesson.studentRating || lesson.teacherRating) && (
                        <div className={cn(
                            "px-2 py-1 rounded-lg text-sm font-bold flex items-center gap-1",
                            isVerified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>
                            {isVerified && <Sparkles className="w-3 h-3" />}
                            {displayScore}/6
                        </div>
                    )}
                    <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>
            </div>

            {/* Body */}
            {isOpen && (
                <div className="p-4 pt-0 animate-in slide-in-from-top-2">
                    <div className="h-px w-full bg-slate-100 mb-4" />

                    <ScoringControl
                        studentRating={lesson.studentRating}
                        teacherRating={lesson.teacherRating}
                        isVerified={isVerified}
                        isTeacher={isLessonTeacher}
                        readOnly={
                            (isVerified && !isEditMode && role !== 'admin') ||
                            (isVerified && role === 'student')
                        }
                        onChange={handleScoreChange}
                    />

                    {/* Teacher Actions - Not Verified */}
                    {isLessonTeacher && !isVerified && (
                        <div className="mt-6 pt-4 border-t flex gap-3">
                            <button
                                onClick={handleApprove}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
                                    (!lesson.teacherRating || JSON.stringify(lesson.teacherRating) === JSON.stringify(lesson.studentRating))
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-primary text-primary-foreground shadow-primary/20"
                                )}
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                {(!lesson.teacherRating || JSON.stringify(lesson.teacherRating) === JSON.stringify(lesson.studentRating)) ? "אשר (ללא שינוי)" : "אשר עם שינויים"}
                            </button>
                        </div>
                    )}

                    {/* Teacher Actions - Verified (Edit Mode) */}
                    {isLessonTeacher && isVerified && (
                        <div className="mt-6 pt-4 border-t flex gap-3">
                            <button
                                onClick={handleToggleEdit}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
                                    isEditMode
                                        ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                        : "bg-slate-500 text-white shadow-slate-500/20"
                                )}
                            >
                                {isEditMode ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span>שמור שינויים</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>ערוך</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Verified Footer */}
                    {isVerified && role !== 'admin' && (
                        <div className="mt-4 pt-2 border-t text-center text-xs text-emerald-600 font-medium">
                            שיעור זה אומת ונסגר לשינויים
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
