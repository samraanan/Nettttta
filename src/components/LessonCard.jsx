import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, Circle, Clock, ChevronDown, Sparkles } from 'lucide-react';
import { ScoringControl } from './ScoringControl';
import { storageService } from '../services/storage';

export function LessonCard({ lesson, role, teacherId, onUpdate }) {
    // Logic to determine view state
    const isLessonTeacher = role === 'admin' || (role.startsWith('t') && role === lesson.teacherId);
    const isStudent = role === 'student';
    const isVerified = lesson.status === 'verified';

    // Auto-expand if it's the specific teacher
    const [isOpen, setIsOpen] = useState(isLessonTeacher || isStudent);

    // Edit mode for verified lessons (teachers only)
    const [isEditMode, setIsEditMode] = useState(false);

    const handleScoreChange = (param, value) => {
        // For verified lessons, check edit mode
        if (isVerified && !isEditMode && role !== 'admin') {
            // Show feedback that lesson is locked
            alert('שיעור זה כבר אומת והוא נעול לעריכה');
            return;
        }

        if (isLessonTeacher) {
            // Teacher updating
            const newTeacherRating = { ...(lesson.teacherRating || lesson.studentRating || {}), [param]: value };
            onUpdate(lesson.id, { teacherRating: newTeacherRating });
        } else if (isStudent) {
            // Student updating
            const newStudentRating = { ...(lesson.studentRating || {}), [param]: value };
            onUpdate(lesson.id, { studentRating: newStudentRating }); // Don't set pending yet!
        }
    };

    const handleApprove = () => {
        // If teacher hasn't modified anything, assume they accept student's rating (Approve As Is)
        // Or if they modified, just lock it.

        let finalRating = lesson.teacherRating;

        // "Approve As Is" Logic: If no teacher rating yet, copy from student
        if (!finalRating && lesson.studentRating) {
            finalRating = { ...lesson.studentRating };
        }

        onUpdate(lesson.id, {
            status: 'verified',
            teacherRating: finalRating
        });

        // Exit edit mode after approval
        setIsEditMode(false);
    };

    const handleToggleEdit = () => {
        setIsEditMode(!isEditMode);
    };

    const calculateScore = (rating) => {
        if (!rating) return 0;
        return (rating.behavior || 0) + (rating.functioning || 0) + (rating.equipment || 0);
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
                onClick={() => setIsOpen(!isOpen)}
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
                        <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center",
                            lesson.status === 'pending' ? "border-yellow-400 bg-yellow-50 text-xs font-bold text-yellow-600" : "border-slate-200"
                        )}>
                            {lesson.status === 'pending' ? '!' : ''}
                        </div>
                    )}

                    <div>
                        <h3 className="font-bold text-foreground">{lesson.subject}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.time}</span>
                            <span>•</span>
                            <span>{lesson.teacherName}</span>
                        </div>
                    </div>
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
                            (isVerified && role === 'student') ||
                            (isStudent && lesson.status === 'pending' && !isEditMode)
                        }
                        onChange={handleScoreChange}
                    />

                    {/* Student Actions - Send/Edit */}
                    {isStudent && !isVerified && (
                        <div className="mt-6 pt-4 border-t flex gap-3">
                            {lesson.status !== 'pending' ? (
                                <button
                                    onClick={() => onUpdate(lesson.id, { status: 'pending' })}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>שלח</span>
                                </button>
                            ) : (
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
                                            <span>ערוך דיווח</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Teacher Actions - Not Verified */}
                    {isLessonTeacher && !isVerified && (
                        <div className="mt-6 pt-4 border-t flex gap-3">
                            <button
                                onClick={handleApprove}
                                className={cn(
                                    "w-full py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2",
                                    // Visual distinction: Green if "Approve As Is", Blue if "Approve Changes"
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
