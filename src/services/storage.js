import { db } from './firebase';
import { doc, onSnapshot, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';

const COLLECTION = 'schedules';
const META_COLLECTION = 'meta';

const getInitialSchedule = (dateStr, template) => {
    // Determine day of week (0-6)
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sunday

    // If we have a template for this day, use it
    if (template && template[dayOfWeek]) {
        return template[dayOfWeek].map((lesson, index) => ({
            id: `l_${dateStr}_${index}`,
            time: lesson.time,
            subject: lesson.subject,
            teacherId: lesson.teacherId || 't1', // Default or mapped
            teacherName: lesson.subject, // Simple map
            status: 'unreported',
            studentRating: null,
            teacherRating: null,
            timestamp: null
        }));
    }

    // Fallback Mock Data for Demo
    return [
        {
            id: `l_${dateStr}_1`,
            time: '08:00',
            subject: 'חשבון',
            teacherId: 't1',
            teacherName: 'חשבון',
            status: 'unreported',
            studentRating: null,
            teacherRating: null,
            timestamp: null
        },
        {
            id: `l_${dateStr}_2`,
            time: '09:00',
            subject: 'אנגלית',
            teacherId: 't2',
            teacherName: 'אנגלית',
            status: 'unreported',
            studentRating: null,
            teacherRating: null,
            timestamp: null
        },
        {
            id: `l_${dateStr}_3`,
            time: '10:00',
            subject: 'היסטוריה',
            teacherId: 't3',
            teacherName: 'היסטוריה',
            status: 'unreported',
            studentRating: null,
            teacherRating: null,
            timestamp: null
        },
        {
            id: `l_${dateStr}_4`,
            time: '11:00',
            subject: 'ספורט',
            teacherId: 't4',
            teacherName: 'ספורט',
            status: 'unreported',
            studentRating: null,
            teacherRating: null,
            timestamp: null
        },
        {
            id: `l_${dateStr}_5`,
            time: '12:00',
            subject: 'מדעים',
            teacherId: 't5',
            teacherName: 'מדעים',
            status: 'unreported',
            studentRating: null,
            teacherRating: null,
            timestamp: null
        }
    ];
};

export const storageService = {
    // Subscribe to updates for a specific date
    subscribeToDate(dateStr, callback) {
        if (!dateStr) return () => { };

        const docRef = doc(db, COLLECTION, dateStr);

        return onSnapshot(docRef, async (docSnap) => {
            if (!docSnap.exists()) {
                // Fetch Template First
                let template = null;
                try {
                    const templateRef = doc(db, META_COLLECTION, 'template');
                    const templateSnap = await getDoc(templateRef);
                    template = templateSnap.exists() ? templateSnap.data() : null;
                } catch (e) {
                    console.warn("Could not fetch template, using default", e);
                }

                const initialData = { lessons: getInitialSchedule(dateStr, template) };

                try {
                    await setDoc(docRef, initialData);
                } catch (e) {
                    console.error("Error creating schedule", e);
                }
            } else {
                callback(docSnap.data().lessons || []);
            }
        });
    },

    // Subscribe to Weekly Template (for Admin Editor)
    subscribeToTemplate(callback) {
        const docRef = doc(db, META_COLLECTION, 'template');
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data());
            } else {
                callback({});
            }
        });
    },

    // Update Weekly Template AND current week's schedule
    async updateTemplate(dayIndex, lessons) {
        const docRef = doc(db, META_COLLECTION, 'template');

        await runTransaction(db, async (transaction) => {
            // 0. Calculations
            const today = new Date();
            const currentDayIndex = today.getDay();

            // Calculate difference to target day (Current Week Logic)
            const diff = dayIndex - currentDayIndex;

            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + diff);

            // Format to yyyy-MM-dd
            const y = targetDate.getFullYear();
            const m = String(targetDate.getMonth() + 1).padStart(2, '0');
            const d = String(targetDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;

            console.log('Updating template for day', dayIndex, 'Target hot-update date:', dateStr);

            // 1. READ (Must come before Writes)
            const dayRef = doc(db, COLLECTION, dateStr);
            const daySnap = await transaction.get(dayRef);

            // 2. WRITE Template
            transaction.set(docRef, { [dayIndex]: lessons }, { merge: true });

            // 3. WRITE "Hot Update"
            // Create new lesson objects
            const newLessons = lessons.map((l, idx) => ({
                id: `l_${dateStr}_${idx}`,
                time: l.time,
                subject: l.subject,
                teacherId: l.teacherId || 't1',
                teacherName: l.subject,
                status: 'unreported', // Reset status as the lesson changed
                studentRating: null,
                teacherRating: null,
                timestamp: null
            }));

            if (daySnap.exists()) {
                transaction.update(dayRef, { lessons: newLessons });
            } else {
                // If it doesn't exist yet (user hasn't visited it), create it now so it reflects the new template
                transaction.set(dayRef, { lessons: newLessons });
            }
        });
    },

    // Subscribe to subjects metadata
    subscribeToSubjects(callback) {
        const docRef = doc(db, META_COLLECTION, 'subjects');
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().list) {
                callback(docSnap.data().list);
            } else {
                // Fallback default
                callback([
                    { value: 'חשבון', label: 'חשבון', id: 't1' },
                    { value: 'אנגלית', label: 'אנגלית', id: 't2' },
                    { value: 'היסטוריה', label: 'היסטוריה', id: 't3' },
                    { value: 'ספורט', label: 'ספורט', id: 't4' },
                    { value: 'מדעים', label: 'מדעים', id: 't5' },
                    { value: 'תנ"ך', label: 'תנ"ך', id: 't6' },
                    { value: 'ספרות', label: 'ספרות', id: 't7' },
                ]);
            }
        });
    },

    // Update subjects list
    async updateSubjects(list) {
        const docRef = doc(db, META_COLLECTION, 'subjects');
        await setDoc(docRef, { list }, { merge: true });
    },

    // Subscribe to total score
    subscribeToTotalScore(callback) {
        const docRef = doc(db, META_COLLECTION, 'global_stats');
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data().totalScore || 0);
            } else {
                callback(0);
            }
        });
    },

    async updateLesson(dateStr, lessonId, updates) {
        const docRef = doc(db, COLLECTION, dateStr);

        await runTransaction(db, async (transaction) => {
            // 1. Get Global Stats for Period Start Date
            const statsRef = doc(db, META_COLLECTION, 'global_stats');
            const statsDoc = await transaction.get(statsRef);
            const periodStartDate = statsDoc.exists() ? (statsDoc.data().periodStartDate || null) : null;

            // Check if we should count this score
            const shouldCount = !periodStartDate || dateStr >= periodStartDate;

            const sfDoc = await transaction.get(docRef);
            if (!sfDoc.exists()) throw "Document does not exist!";

            const lessons = sfDoc.data().lessons;
            const lessonIndex = lessons.findIndex(l => l.id === lessonId);

            if (lessonIndex > -1) {
                const oldStatus = lessons[lessonIndex].status;
                lessons[lessonIndex] = { ...lessons[lessonIndex], ...updates };

                transaction.update(docRef, { lessons });

                if (updates.status === 'verified' && oldStatus !== 'verified' && shouldCount) {
                    const updatesRating = updates.teacherRating || lessons[lessonIndex].teacherRating;

                    if (updatesRating) {
                        const p = updatesRating.participation || 0;
                        const a = updatesRating.assignments || 0;
                        const e = updatesRating.equipment || 0;
                        const score = p + a + e;

                        if (statsDoc.exists()) {
                            const newScore = (statsDoc.data().totalScore || 0) + score;
                            transaction.update(statsRef, { totalScore: newScore });
                        } else {
                            transaction.set(statsRef, { totalScore: score });
                        }
                    }
                }
            }
        });
    },

    async approveAsIs(dateStr, lessonId) {
        const docRef = doc(db, COLLECTION, dateStr);

        await runTransaction(db, async (transaction) => {
            // 1. Get Global Stats for Period Start Date
            const statsRef = doc(db, META_COLLECTION, 'global_stats');
            const statsDoc = await transaction.get(statsRef);
            const periodStartDate = statsDoc.exists() ? (statsDoc.data().periodStartDate || null) : null;

            // Check if we should count this score
            const shouldCount = !periodStartDate || dateStr >= periodStartDate;

            const sfDoc = await transaction.get(docRef);
            if (!sfDoc.exists()) throw "Document does not exist!";

            const lessons = sfDoc.data().lessons;
            const lesson = lessons.find(l => l.id === lessonId);

            if (lesson && lesson.studentRating) {
                const lessonIndex = lessons.findIndex(l => l.id === lessonId);
                lessons[lessonIndex] = {
                    ...lesson,
                    status: 'verified',
                    teacherRating: { ...lesson.studentRating }
                };

                transaction.update(docRef, { lessons });

                if (shouldCount) {
                    const p = lesson.studentRating.participation || 0;
                    const a = lesson.studentRating.assignments || 0;
                    const e = lesson.studentRating.equipment || 0;
                    const score = p + a + e;

                    if (statsDoc.exists()) {
                        transaction.update(statsRef, { totalScore: (statsDoc.data().totalScore || 0) + score });
                    } else {
                        transaction.set(statsRef, { totalScore: score });
                    }
                }
            }
        });
    },

    // New Function: Recalculate score from a specific date
    async recalculateScore(startDateStr) {
        // 1. Update Start Date
        const statsRef = doc(db, META_COLLECTION, 'global_stats');
        await setDoc(statsRef, { periodStartDate: startDateStr, totalScore: 0 }, { merge: true });

        // 2. Iterate and Sum
        // Note: For simplicity in this demo, we iterate from start date to TODAY.
        // In a real app with many days, this might need a cloud function.
        let totalScore = 0;
        const current = new Date(startDateStr);
        const end = new Date();

        // Loop day by day
        for (let d = new Date(current); d <= end; d.setDate(d.getDate() + 1)) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${day}`;

            const docRef = doc(db, COLLECTION, dateStr);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const lessons = docSnap.data().lessons || [];
                lessons.forEach(l => {
                    if (l.status === 'verified' && l.teacherRating) {
                        const p = l.teacherRating.participation || 0;
                        const a = l.teacherRating.assignments || 0;
                        const e = l.teacherRating.equipment || 0;
                        totalScore += (p + a + e);
                    }
                });
            }
        }

        // 3. Update Final Score
        await updateDoc(statsRef, { totalScore });
    }
};
