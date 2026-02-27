import { db } from './firebase';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { DEMO_SCHOOL, DEMO_CATEGORIES, DEMO_LOCATIONS } from '../lib/demoData';
import { INVENTORY_CATEGORIES } from '../lib/constants';

// Initial dummy inventory
const INITIAL_INVENTORY = [
    { name: 'כבל HDMI 2 מטר', category: 'cables', inStock: 15, active: true },
    { name: 'עכבר אלחוטי Logitech', category: 'peripherals', inStock: 8, active: true },
    { name: 'מקלדת עברית/אנגלית', category: 'peripherals', inStock: 12, active: true },
    { name: 'טונר למדפסת Brother', category: 'consumables', inStock: 3, active: true }
];

export const migrationService = {
    async runMigration() {
        try {
            console.log("Starting data migration...");
            const schoolId = DEMO_SCHOOL.id;

            // 1. Write School Document
            await setDoc(doc(db, 'schools', schoolId), DEMO_SCHOOL);
            console.log("School created.");

            // 2. Write Categories
            await setDoc(doc(db, 'schools', schoolId, 'meta', 'categories'), {
                list: DEMO_CATEGORIES
            });
            console.log("Categories created.");

            // 3. Write Locations
            await setDoc(doc(db, 'schools', schoolId, 'meta', 'locations'), DEMO_LOCATIONS);
            console.log("Locations created.");

            // 4. Write Inventory Items
            const batch = writeBatch(db);
            INITIAL_INVENTORY.forEach((item, index) => {
                const docRef = doc(collection(db, 'inventory_items'));
                batch.set(docRef, { ...item, sku: `ITM-00${index + 1}` });
            });
            await batch.commit();
            console.log("Inventory seeded.");

            return true;
        } catch (error) {
            console.error("Migration Failed: ", error);
            throw error;
        }
    }
};
