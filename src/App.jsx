import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { format, addDays, subDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { storageService } from './services/storage';
import { DateNavigation } from './components/DateNavigation';
import { LessonCard } from './components/LessonCard';
import { Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { ScheduleEditor } from './components/ScheduleEditor';

// Configuration for teacher mapping
// Maps URL param (e.g. 'arithmetic') to internal ID (e.g. 't1')
const SUBJECT_MAP = {
    'arithmetic': 't1',
    'english': 't2',
    'history': 't3',
    'sports': 't4',
    'science': 't5'
};

const TEACHER_PHONE = ""; // Add phone number here for WhatsApp integration

function MainLayout({ role = 'student' }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [lessons, setLessons] = useState([]);
    const [totalScore, setTotalScore] = useState(0);
    const [showScheduleEditor, setShowScheduleEditor] = useState(false); // New State
    const { subject } = useParams();

    // Determine effective role ID based on URL or static role
    const teacherId = role === 'teacher' && subject ? SUBJECT_MAP[subject.toLowerCase()] : null;
    const effectiveRole = teacherId || role;

    const dateStr = format(currentDate, 'yyyy-MM-dd');

    useEffect(() => {
        const unsubLessons = storageService.subscribeToDate(dateStr, (data) => {
            setLessons(data);
        });

        const unsubScore = storageService.subscribeToTotalScore((score) => {
            setTotalScore(score);
        });

        return () => {
            unsubLessons();
            unsubScore();
        };
    }, [dateStr]);

    const handleLessonUpdate = async (lessonId, updates) => {
        // 1. Update Database
        await storageService.updateLesson(dateStr, lessonId, updates);

        // 2. WhatsApp Integration (Student Only)
        if (role === 'student' && updates.status === 'pending') {
            const lesson = lessons.find(l => l.id === lessonId);
            if (lesson) {
                const text = `הי, סיימתי למלא את הדיווח בשיעור ${lesson.subject}!`;

                // Use a generic logic to open WhatsApp. 
                // If no phone is defined, it opens the app where user picks contact.
                // If phone is defined, it targets that phone.
                const url = TEACHER_PHONE
                    ? `https://wa.me/${TEACHER_PHONE}?text=${encodeURIComponent(text)}`
                    : `https://wa.me/?text=${encodeURIComponent(text)}`;

                window.open(url, '_blank');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32 font-sans" dir="rtl">
            <DateNavigation
                date={currentDate}
                onPrev={() => setCurrentDate(d => subDays(d, 1))}
                onNext={() => setCurrentDate(d => addDays(d, 1))}
                onToday={() => setCurrentDate(new Date())}
                isToday={format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
            />

            <main className="max-w-md mx-auto p-4 space-y-4">
                {/* Context Header (Debug/Realism) - Optional: Show who is logged in */}
                {role !== 'student' && (
                    <div className="text-center text-xs text-slate-400 mb-2">
                        מחובר כ: {role === 'admin' ? 'מנהל/הורה' : `מורה (${subject || '?'})`}
                    </div>
                )}

                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-sm flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 font-medium">ניקוד מצטבר</div>
                            <div className="text-2xl font-black text-slate-800">{totalScore}</div>
                        </div>
                    </div>

                    {role === 'admin' && (
                        <button
                            onClick={() => setShowScheduleEditor(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition shadow-lg shadow-slate-900/10"
                        >
                            <CalendarIcon className="w-4 h-4" />
                            ערוך מערכת
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {lessons.map(lesson => (
                        <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            role={effectiveRole}
                            teacherId={teacherId || lesson.teacherId}
                            onUpdate={handleLessonUpdate}
                        />
                    ))}
                </div>
            </main>

            {showScheduleEditor && <ScheduleEditor onClose={() => setShowScheduleEditor(false)} />}
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/student" element={<MainLayout role="student" />} />
                <Route path="/admin" element={<MainLayout role="admin" />} />
                <Route path="/teacher/:subject" element={<MainLayout role="teacher" />} />
                <Route path="/" element={<Navigate to="/student" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
