import React from 'react';
import { cn } from '../lib/utils';
import { Handshake, Brain, Briefcase } from 'lucide-react';

const PARAMETERS = [
    { id: 'equipment', label: 'הוצאת ציוד', icon: Briefcase },
    { id: 'participation', label: 'השתתפות', icon: Handshake },
    { id: 'assignments', label: 'ביצוע מטלות', icon: Brain },
];

const SCORES = [
    { value: 2, label: 'מצויין 2', color: 'bg-emerald-500', ring: 'ring-emerald-500' },
    { value: 1, label: 'סביר 1', color: 'bg-yellow-500', ring: 'ring-yellow-500' },
    { value: 0, label: 'לשפר 0', color: 'bg-red-500', ring: 'ring-red-500' },
];

export function ScoringControl({
    studentRating,
    teacherRating,
    onChange,
    isTeacher,
    isVerified,
    readOnly
}) {
    return (
        <div className="flex flex-col gap-4">
            {PARAMETERS.map((param) => {
                const Icon = param.icon;
                // Logic:
                // If Verified: Show verified rating (Teacher's final).
                // If Teacher Not Verified: Show Teacher's selection (Solid) if exists OR Student's selection (Ghost).
                // If Student: Show Student's selection.

                const studentValue = studentRating?.[param.id];
                const teacherValue = teacherRating?.[param.id];

                // Active visual value
                const activeValue = isVerified ? teacherValue : (isTeacher ? (teacherValue ?? studentValue) : studentValue);

                // Ghost value (Gap visualization)
                // Show for Teacher when not verified AND values differ
                // Show for Student when verified AND teacher rating differs from student rating
                const showGhostForTeacher = isTeacher && !isVerified && teacherValue !== undefined && studentValue !== undefined && teacherValue !== studentValue;
                const showGhostForStudent = !isTeacher && isVerified && teacherValue !== undefined && studentValue !== undefined && teacherValue !== studentValue;
                const showGhost = showGhostForTeacher || showGhostForStudent;
                const ghostValue = showGhost ? studentValue : null;

                return (
                    <div key={param.id} className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Icon className="w-4 h-4" />
                            <span>{param.label}</span>
                        </div>

                        <div className="flex bg-muted/50 p-1 rounded-lg relative isolate">
                            {SCORES.map((score) => {
                                const isSelected = activeValue === score.value;
                                const isGhost = ghostValue === score.value;

                                return (
                                    <button
                                        key={score.value}
                                        disabled={readOnly}
                                        // Note: Teacher can always edit unless locked by logic upstream, but strict verified check 
                                        // usually locks it. We'll handle 'readOnly' prop passed from parent.
                                        onClick={() => !readOnly && onChange(param.id, score.value)}
                                        className={cn(
                                            "flex-1 relative z-10 py-2 text-xs font-bold rounded-md transition-all duration-300",
                                            // Selected State (Solid)
                                            isSelected && [score.color, "text-white shadow-sm scale-100"],
                                            // Unselected State
                                            !isSelected && !isGhost && "text-muted-foreground hover:bg-white/50",
                                            // Ghost State (Student's differing opinion)
                                            isGhost && "ring-2 ring-inset bg-transparent opacity-60 scale-90",
                                            isGhost && score.ring
                                        )}
                                    >
                                        {score.label}
                                        {isGhost && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Gap Label */}
                        {showGhost && (
                            <div className="text-[10px] text-blue-500 flex justify-between px-1 animate-in fade-in slide-in-from-top-1">
                                <span>{isTeacher ? "משוב תלמיד שונה" : "משוב מורה שונה מהציפייה שלך"}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
