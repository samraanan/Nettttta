import { db } from './firebase';
import {
    collection, doc, onSnapshot, setDoc, updateDoc,
    addDoc, query, where, orderBy, runTransaction,
    serverTimestamp
} from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '../lib/constants';
import { DEMO_LOCATIONS } from '../lib/demoData';

export const storageService = {

    // ========== פניות ==========

    subscribeToAllCalls(callback) {
        const q = query(
            collection(db, 'service_calls'),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const calls = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(calls);
        });
    },

    subscribeToCallsBySchool(schoolId, callback) {
        const q = query(
            collection(db, 'service_calls'),
            where('schoolId', '==', schoolId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const calls = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(calls);
        });
    },

    subscribeToCallsByClient(schoolId, clientId, callback) {
        const q = query(
            collection(db, 'service_calls'),
            where('schoolId', '==', schoolId),
            where('clientId', '==', clientId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const calls = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(calls);
        });
    },

    subscribeToCallsByRoom(schoolId, roomNumber, callback) {
        const q = query(
            collection(db, 'service_calls'),
            where('schoolId', '==', schoolId),
            where('location.roomNumber', '==', roomNumber),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const calls = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(calls);
        });
    },

    subscribeToCall(callId, callback) {
        return onSnapshot(doc(db, 'service_calls', callId), (docSnap) => {
            if (docSnap.exists()) {
                callback({ id: docSnap.id, ...docSnap.data() });
            } else {
                callback(null);
            }
        });
    },

    async createServiceCall(callData) {
        const historyEntry = {
            id: `hist_${Date.now()}`,
            action: 'created',
            description: 'פנייה נפתחה',
            performedBy: callData.clientId,
            performedByName: callData.clientName,
            timestamp: new Date().toISOString()
        };
        return await addDoc(collection(db, 'service_calls'), {
            ...callData,
            priority: null,
            status: 'new',
            lastHandledBy: null,
            lastHandledByName: null,
            lastHandledAt: null,
            notes: [],
            suppliedEquipment: [],
            history: [historyEntry],
            source: callData.source || 'app',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            resolvedAt: null,
            closedAt: null
        });
    },

    async updateCallStatus(callId, newStatus, techId, techName) {
        const callRef = doc(db, 'service_calls', callId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            if (!callDoc.exists()) throw new Error("פנייה לא נמצאה");

            const callData = callDoc.data();
            const updates = {
                status: newStatus,
                lastHandledBy: techId,
                lastHandledByName: techName,
                lastHandledAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (newStatus === 'resolved') updates.resolvedAt = serverTimestamp();
            if (newStatus === 'closed') updates.closedAt = serverTimestamp();

            const history = [...(callData.history || [])];
            history.push({
                id: `hist_${Date.now()}`,
                action: 'status_changed',
                description: `סטטוס שונה ל: ${newStatus}`,
                performedBy: techId,
                performedByName: techName,
                oldValue: callData.status,
                newValue: newStatus,
                timestamp: new Date().toISOString()
            });
            updates.history = history;

            transaction.update(callRef, updates);
        });
    },

    async updateCallPriority(callId, priority, performerId, performerName) {
        const callRef = doc(db, 'service_calls', callId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            if (!callDoc.exists()) throw new Error("פנייה לא נמצאה");

            const callData = callDoc.data();
            const history = [...(callData.history || [])];
            history.push({
                id: `hist_${Date.now()}`,
                action: 'priority_set',
                description: `דחיפות נקבעה: ${priority}`,
                performedBy: performerId,
                performedByName: performerName,
                oldValue: callData.priority,
                newValue: priority,
                timestamp: new Date().toISOString()
            });

            transaction.update(callRef, {
                priority,
                updatedAt: serverTimestamp(),
                history
            });
        });
    },

    async updateCallCategory(callId, newCategory, techId, techName) {
        const callRef = doc(db, 'service_calls', callId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            if (!callDoc.exists()) throw new Error("פנייה לא נמצאה");

            const callData = callDoc.data();
            const history = [...(callData.history || [])];
            history.push({
                id: `hist_${Date.now()}`,
                action: 'category_changed',
                description: `קטגוריה שונתה: ${callData.category} → ${newCategory}`,
                performedBy: techId,
                performedByName: techName,
                oldValue: callData.category,
                newValue: newCategory,
                timestamp: new Date().toISOString()
            });

            transaction.update(callRef, {
                category: newCategory,
                lastHandledBy: techId,
                lastHandledByName: techName,
                lastHandledAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                history
            });
        });
    },

    async addNote(callId, noteText, techId, techName) {
        const callRef = doc(db, 'service_calls', callId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            if (!callDoc.exists()) throw new Error("פנייה לא נמצאה");

            const callData = callDoc.data();
            const notes = [...(callData.notes || [])];
            const history = [...(callData.history || [])];

            notes.push({
                id: `note_${Date.now()}`,
                techId,
                techName,
                text: noteText,
                timestamp: new Date().toISOString()
            });

            history.push({
                id: `hist_${Date.now()}`,
                action: 'note_added',
                description: `הערה נוספה: "${noteText.length > 50 ? noteText.substring(0, 50) + '...' : noteText}"`,
                performedBy: techId,
                performedByName: techName,
                timestamp: new Date().toISOString()
            });

            transaction.update(callRef, {
                notes, history,
                lastHandledBy: techId,
                lastHandledByName: techName,
                lastHandledAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        });
    },

    async addSuppliedEquipment(callId, itemId, itemName, quantity, techId, techName) {
        const callRef = doc(db, 'service_calls', callId);
        const invRef = doc(db, 'inventory_items', itemId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            const invDoc = await transaction.get(invRef);
            if (!callDoc.exists()) throw new Error("פנייה לא נמצאה");
            if (!invDoc.exists()) throw new Error("פריט לא נמצא במלאי");

            const callData = callDoc.data();
            const invData = invDoc.data();

            transaction.update(invRef, {
                inStock: Math.max(0, (invData.inStock || 0) - quantity)
            });

            const suppliedEquipment = [...(callData.suppliedEquipment || [])];
            const history = [...(callData.history || [])];

            suppliedEquipment.push({
                itemId, itemName, quantity, techId, techName,
                timestamp: new Date().toISOString()
            });

            history.push({
                id: `hist_${Date.now()}`,
                action: 'equipment_supplied',
                description: `סופק: ${itemName} x${quantity}`,
                performedBy: techId,
                performedByName: techName,
                timestamp: new Date().toISOString()
            });

            transaction.update(callRef, {
                suppliedEquipment, history,
                lastHandledBy: techId,
                lastHandledByName: techName,
                lastHandledAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        });
    },

    // ========== שעות עבודה ==========

    async clockIn(techId, techName, schoolId, schoolName) {
        return await addDoc(collection(db, 'work_sessions'), {
            techId, techName, schoolId, schoolName,
            clockIn: serverTimestamp(),
            clockOut: null,
            durationMinutes: null,
            date: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp()
        });
    },

    async clockOut(sessionId) {
        const ref = doc(db, 'work_sessions', sessionId);
        await runTransaction(db, async (transaction) => {
            const sessionDoc = await transaction.get(ref);
            if (!sessionDoc.exists()) throw new Error("session לא נמצא");
            const data = sessionDoc.data();
            const clockIn = data.clockIn?.toDate?.() || new Date(data.clockIn);
            const now = new Date();
            const durationMinutes = Math.round((now - clockIn) / 60000);
            transaction.update(ref, {
                clockOut: serverTimestamp(),
                durationMinutes
            });
        });
    },

    subscribeToActiveSession(techId, callback) {
        const q = query(
            collection(db, 'work_sessions'),
            where('techId', '==', techId),
            where('clockOut', '==', null)
        );
        return onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(sessions[0] || null);
        });
    },

    subscribeToWorkSessions(filters, callback) {
        const q = query(collection(db, 'work_sessions'), orderBy('clockIn', 'desc'));
        return onSnapshot(q, (snapshot) => {
            let sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            if (filters.techId) sessions = sessions.filter(s => s.techId === filters.techId);
            if (filters.schoolId) sessions = sessions.filter(s => s.schoolId === filters.schoolId);
            callback(sessions);
        });
    },

    // ========== מלאי ציוד ==========

    subscribeToInventory(callback) {
        return onSnapshot(collection(db, 'inventory_items'), (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(items);
        });
    },

    async updateInventoryItem(itemId, data) {
        await updateDoc(doc(db, 'inventory_items', itemId), data);
    },

    async addInventoryItem(data) {
        return await addDoc(collection(db, 'inventory_items'), { ...data, active: true });
    },

    // ========== בתי ספר ==========

    subscribeToAllSchools(callback) {
        return onSnapshot(collection(db, 'schools'), (snapshot) => {
            const schools = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            callback(schools);
        });
    },

    subscribeToSchool(schoolId, callback) {
        return onSnapshot(doc(db, 'schools', schoolId), (docSnap) => {
            callback(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
        });
    },

    // ========== קטגוריות + מיקומים ==========

    subscribeToCategories(schoolId, callback) {
        const docRef = doc(db, 'schools', schoolId, 'meta', 'categories');
        return onSnapshot(docRef, (docSnap) => {
            callback(docSnap.exists() && docSnap.data().list ? docSnap.data().list : DEFAULT_CATEGORIES);
        });
    },

    async updateCategories(schoolId, list) {
        await setDoc(doc(db, 'schools', schoolId, 'meta', 'categories'), { list }, { merge: true });
    },

    subscribeToLocations(schoolId, callback) {
        const docRef = doc(db, 'schools', schoolId, 'meta', 'locations');
        return onSnapshot(docRef, (docSnap) => {
            callback(docSnap.exists() && docSnap.data().floors ? docSnap.data() : DEMO_LOCATIONS);
        });
    },

    async updateLocations(schoolId, locationsData) {
        await setDoc(doc(db, 'schools', schoolId, 'meta', 'locations'), locationsData, { merge: true });
    }
};
