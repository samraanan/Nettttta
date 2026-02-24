# פרומפט לבניית אפליקציית ניהול טכנאי IT

## הוראות כלליות

בנה לי אפליקציה לניהול 5 טכנאי IT מאפס.

### Stack טכנולוגי
- **React 19** + **Vite 5** + **React Router DOM 7**
- **Tailwind CSS 3** (עם CSS variables לצבעים)
- **Firebase** - Firestore (מסד נתונים real-time) + Auth (Email/Password)
- **date-fns** (עם locale עברי)
- **Lucide React** (אייקונים)
- **clsx** + **tailwind-merge** (למיזוג classes)

### package.json
```json
{
  "name": "it-technician-manager",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "firebase": "^12.8.0",
    "lucide-react": "^0.562.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.0",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@tailwindcss/vite": "^4.1.18",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.23",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "vite": "^5.4.21"
  }
}
```

### קבצי קונפיגורציה

#### `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
})
```

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
```

#### `postcss.config.js`
```javascript
export default {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
}
```

#### `index.html`
```html
<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ניהול טכנאי IT</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

#### `src/index.css` - עיצוב בסיסי RTL עם CSS variables
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
        --background: 210 40% 98%;
        --foreground: 222 47% 11%;
        --card: 0 0% 100%;
        --card-foreground: 222 47% 11%;
        --primary: 221 83% 53%;
        --primary-foreground: 210 40% 98%;
        --secondary: 210 40% 96%;
        --secondary-foreground: 222 47% 11%;
        --muted: 210 40% 96%;
        --muted-foreground: 215 16% 47%;
        --accent: 210 40% 96%;
        --accent-foreground: 222 47% 11%;
        --destructive: 0 84% 60%;
        --destructive-foreground: 210 40% 98%;
        --border: 214 32% 91%;
        --input: 214 32% 91%;
        --ring: 221 83% 53%;
        --radius: 0.75rem;
    }
}

@layer base {
    * {
        @apply border-border;
    }
    body {
        @apply bg-background text-foreground;
        font-family: 'Inter', system-ui, sans-serif;
        direction: rtl;
    }
}

.glass {
    @apply bg-white/70 backdrop-blur-lg border border-white/20 shadow-lg;
}
```

#### `src/lib/utils.js` - utility למיזוג Tailwind classes
```javascript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
```

#### `src/services/firebase.js` - אתחול Firebase עם Email/Password Auth
צור פרויקט Firebase חדש ב-console.firebase.google.com, הפעל Firestore ו-Authentication (Email/Password), והחלף את הקונפיג:
```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
```

---

## מבנה תיקיות

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx          # Layout ראשי - sidebar + header + content
│   │   └── ProtectedRoute.jsx     # Guard לפי role + auth
│   ├── shared/
│   │   ├── DateNavigation.jsx     # ניווט בין תאריכים (prev/next/today) בעברית
│   │   ├── PriorityBadge.jsx      # תגית עדיפות צבעונית
│   │   ├── StatusBadge.jsx        # תגית סטטוס צבעונית
│   │   └── CategoryIcon.jsx       # אייקון קטגוריה מ-Lucide
│   ├── admin/
│   │   ├── AdminDashboard.jsx     # מסך ראשי מנהל
│   │   ├── TechnicianList.jsx     # רשימת 5 טכנאים + סטטוס
│   │   ├── AllCallsView.jsx       # טבלת קריאות עם סינון
│   │   ├── AssignCallModal.jsx    # חלון שיבוץ קריאה לטכנאי
│   │   └── ReportsView.jsx        # סטטיסטיקות ודוחות
│   ├── technician/
│   │   ├── TechDashboard.jsx      # מסך ראשי טכנאי
│   │   ├── ServiceCallCard.jsx    # כרטיס קריאת שירות
│   │   ├── CallDetailView.jsx     # פרטי קריאה + הערות + שינוי סטטוס
│   │   └── StatusControl.jsx      # כפתורי שינוי סטטוס
│   └── client/
│       ├── NewCallForm.jsx        # טופס פתיחת קריאה חדשה
│       ├── LocationPicker.jsx     # משפך חכם לבחירת מיקום (קומה → סוג → חדר)
│       └── MyCallsView.jsx        # רשימת קריאות הלקוח
├── pages/
│   └── LoginPage.jsx              # דף התחברות
├── services/
│   ├── firebase.js                # אתחול Firebase
│   ├── storage.js                 # Firestore CRUD + real-time subscriptions
│   └── authService.js             # פונקציות login/logout/register
├── lib/
│   └── utils.js                   # cn() utility
├── App.jsx                        # Router ראשי
├── main.jsx                       # Entry point
└── index.css                      # Tailwind base + CSS variables
```

---

## מבנה האפליקציה

### תפקידים (Roles)
1. **מנהל (admin)** - רואה הכל, מנהל טכנאים, משבץ קריאות, צופה בדוחות
2. **טכנאי (technician)** - רואה קריאות שמשובצות אליו, מעדכן סטטוס, מתעד טיפול
3. **לקוח (client)** - פותח קריאת שירות חדשה, עוקב אחרי הסטטוס שלה

### Routes
```
/login                        → דף התחברות (email + password)
/admin                        → Dashboard מנהל
/admin/technicians            → ניהול 5 טכנאים
/admin/calls                  → כל הקריאות
/admin/reports                → דוחות וסטטיסטיקות
/technician/:id               → Dashboard טכנאי ספציפי
/technician/:id/call/:callId  → פרטי קריאה מלאים
/client                       → דף פתיחת קריאה + מעקב
```

### אימות (Authentication)
- Firebase Auth עם Email/Password
- בעת הרשמה - שמור את ה-role ב-Firestore (collection: `users`)
- Guard על כל route - אם לא מחובר → redirect ל-`/login`
- אם מחובר אבל ניגש ל-route לא שלו → redirect ל-dashboard שלו

---

## מודל נתונים (Firestore Collections)

### `users`
```javascript
{
  uid: "firebase-auth-uid",
  email: "user@example.com",
  displayName: "ישראל ישראלי",
  role: "admin" | "technician" | "client",
  technicianId: "tech_1",  // רק לטכנאים
  phone: "050-1234567",
  active: true,
  createdAt: timestamp
}
```

### `technicians`
```javascript
{
  id: "tech_1",
  name: "יוסי כהן",
  phone: "050-1234567",
  email: "yossi@company.com",
  specialties: ["network", "hardware", "software"],
  active: true,
  currentLoad: 3  // מספר קריאות פתוחות כרגע
}
```

### `service_calls`
```javascript
{
  id: "call_20260224_001",
  title: "מחשב לא נדלק",
  description: "המחשב בעמדה 5 לא מגיב ללחיצה על כפתור ההפעלה",
  category: "hardware" | "software" | "network" | "security" | "printer" | "other",
  priority: "low" | "medium" | "high" | "urgent",
  status: "new" | "assigned" | "in_progress" | "resolved" | "closed",

  // שיוך לקוח
  clientId: "user-uid",
  clientName: "שרה לוי",
  clientPhone: "052-9876543",

  // מיקום - נבחר דרך משפך חכם (קומה → סוג → חדר)
  location: {
    floorId: "ground",           // מזהה קומה
    floorLabel: "קומת קרקע",     // תווית קומה
    categoryId: "classrooms",    // מזהה סוג חדר
    categoryLabel: "כיתות",      // תווית סוג
    roomId: "room_a1",           // מזהה חדר
    roomLabel: "כיתה א'1"       // תווית חדר
  },
  locationDisplay: "קומת קרקע > כיתות > כיתה א'1",  // מחרוזת תצוגה מוכנה

  // שיוך טכנאי
  assignedTo: "tech_1" | null,
  assignedTechName: "יוסי כהן",
  assignedAt: timestamp | null,

  // תיעוד טיפול
  notes: [
    {
      id: "note_1",
      author: "tech_1",
      authorName: "יוסי כהן",
      text: "הגעתי לאתר, בודק את ספק הכוח",
      timestamp: timestamp
    }
  ],

  // רישום שעות עבודה
  workLog: [
    {
      id: "wl_1",
      techId: "tech_1",
      techName: "יוסי כהן",
      startTime: timestamp,
      endTime: timestamp | null,       // null = טיימר עדיין רץ
      durationMinutes: 45,             // מחושב אוטומטית בסיום
      description: "בדיקת ספק כוח והחלפת כבל",
      parts: ["כבל חשמל"],             // חומרים שהוחלפו (אופציונלי)
      timestamp: timestamp
    }
  ],
  totalWorkMinutes: 75,                // סיכום כל השעות בקריאה

  // זמנים
  createdAt: timestamp,
  updatedAt: timestamp,
  resolvedAt: timestamp | null,
  closedAt: timestamp | null
}
```

### `categories`
```javascript
{
  list: [
    { value: "hardware", label: "חומרה", icon: "Monitor" },
    { value: "software", label: "תוכנה", icon: "Code" },
    { value: "network", label: "רשת", icon: "Wifi" },
    { value: "security", label: "אבטחה", icon: "Shield" },
    { value: "printer", label: "מדפסות", icon: "Printer" },
    { value: "other", label: "אחר", icon: "HelpCircle" }
  ]
}
```

### `locations` (doc: `meta/locations`)
מבנה היררכי של מיקומים בבית הספר - משפך חכם: קומה → סוג חדר → חדר ספציפי.
```javascript
{
  floors: [
    {
      id: "ground",
      label: "קומת קרקע",
      categories: [
        {
          id: "classrooms",
          label: "כיתות",
          rooms: [
            { id: "room_a1", label: "כיתה א'1" },
            { id: "room_a2", label: "כיתה א'2" },
            { id: "room_b1", label: "כיתה ב'1" },
            { id: "room_b2", label: "כיתה ב'2" },
            { id: "room_c1", label: "כיתה ג'1" },
            { id: "room_c2", label: "כיתה ג'2" }
          ]
        },
        {
          id: "labs",
          label: "מעבדות",
          rooms: [
            { id: "lab_computers", label: "מעבדת מחשבים" },
            { id: "lab_science", label: "מעבדת מדעים" }
          ]
        },
        {
          id: "offices",
          label: "משרדים",
          rooms: [
            { id: "office_principal", label: "משרד מנהל" },
            { id: "office_vp", label: "משרד סגן מנהל" },
            { id: "teachers_lounge", label: "חדר מורים" },
            { id: "office_secretary", label: "מזכירות" }
          ]
        },
        {
          id: "common",
          label: "חללים משותפים",
          rooms: [
            { id: "library", label: "ספרייה" },
            { id: "cafeteria", label: "חדר אוכל" },
            { id: "gym", label: "אולם ספורט" },
            { id: "auditorium", label: "אולם כנסים" }
          ]
        }
      ]
    },
    {
      id: "floor_1",
      label: "קומה 1",
      categories: [
        {
          id: "classrooms",
          label: "כיתות",
          rooms: [
            { id: "room_d1", label: "כיתה ד'1" },
            { id: "room_d2", label: "כיתה ד'2" },
            { id: "room_e1", label: "כיתה ה'1" },
            { id: "room_e2", label: "כיתה ה'2" },
            { id: "room_f1", label: "כיתה ו'1" },
            { id: "room_f2", label: "כיתה ו'2" }
          ]
        },
        {
          id: "labs",
          label: "מעבדות",
          rooms: [
            { id: "lab_robotics", label: "מעבדת רובוטיקה" },
            { id: "lab_art", label: "חדר אמנות" }
          ]
        },
        {
          id: "offices",
          label: "משרדים",
          rooms: [
            { id: "office_counselor", label: "משרד יועצת" },
            { id: "meeting_room", label: "חדר ישיבות" },
            { id: "office_special_ed", label: "משרד חינוך מיוחד" }
          ]
        },
        {
          id: "infra",
          label: "תשתיות",
          rooms: [
            { id: "server_room", label: "חדר שרתים" },
            { id: "network_closet", label: "ארון תקשורת" }
          ]
        }
      ]
    }
  ]
}
```

**חשוב:** נתונים אלה הם נתוני דמו (mock data). מבנה המיקומים ניתן לעריכה עתידית דרך ממשק הניהול.

---

## קומפוננטות - פירוט

### DateNavigation - קומפוננטת ניווט תאריכים בעברית
קומפוננטה sticky בראש המסך עם חיצי prev/next וכפתור "חזור להיום". משתמשת ב-date-fns עם locale עברי להצגת תאריך בפורמט: "יום ראשון, 24 בפברואר". בנה אותה בסגנון הבא:
```jsx
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronRight, ChevronLeft } from 'lucide-react';

// הצגת תאריך בעברית:
format(new Date(date), 'EEEE, d בMMMM', { locale: he })

// עיצוב: sticky top-0, backdrop-blur, border-b, shadow-sm
// חיצים: ChevronRight (קודם), ChevronLeft (הבא) - כי RTL
// כפתור "חזור להיום" מופיע רק כשלא ביום הנוכחי
```

### ServiceCallCard - כרטיס קריאת שירות
כרטיס עם border צבעוני לפי עדיפות, מציג: כותרת, קטגוריה (עם אייקון), עדיפות (badge), סטטוס (badge), שם לקוח, מיקום (מתוך `locationDisplay` - למשל: "קומת קרקע > כיתות > כיתה א'1"), וזמן פתיחה. עיצוב: `rounded-2xl shadow-sm border` עם צבע רקע לפי סטטוס.

### StatusControl - כפתורי שינוי סטטוס
שורת כפתורים שמייצגים את מכונת המצבים: new → assigned → in_progress → resolved → closed. כל סטטוס בצבע אחר. הכפתור הפעיל בולט, השאר מעומעמים. כפתור "הבא בתור" תמיד מודגש.

### AssignCallModal - חלון שיבוץ קריאה
Modal שמציג את 5 הטכנאים עם: שם, התמחויות, מספר קריאות פתוחות (currentLoad). טכנאי עם עומס נמוך מודגש בירוק. לחיצה על טכנאי → שיבוץ הקריאה.

### LocationPicker - משפך חכם לבחירת מיקום
קומפוננטה של 3 dropdowns מדורגים לבחירת מיקום בבית הספר. זרימה:

```
[בחר קומה ▼]  →  [בחר סוג חדר ▼]  →  [בחר חדר ▼]
     ↓ (נבחר)         ↓ (נבחר)           ↓ (נבחר)
"קומת קרקע"       "כיתות"           "כיתה א'1"
```

**התנהגות:**
- Dropdown ראשון (קומה) - תמיד פעיל, מציג את כל הקומות
- Dropdown שני (סוג חדר) - נעול (`disabled`) עד שנבחרה קומה, מציג רק את הסוגים של הקומה שנבחרה
- Dropdown שלישי (חדר) - נעול עד שנבחר סוג, מציג רק את החדרים מהסוג שנבחר
- שינוי קומה → מאפס סוג + חדר
- שינוי סוג → מאפס חדר
- מתחת ל-3 ה-dropdowns מוצג טקסט סיכום: `"📍 קומת קרקע > כיתות > כיתה א'1"`
- הקומפוננטה מקבלת `value` ו-`onChange` props - מחזירה אובייקט location מלא

**Props:**
```jsx
<LocationPicker
  locations={locationsData}     // מבנה הנתונים מ-meta/locations
  value={selectedLocation}      // { floorId, categoryId, roomId } | null
  onChange={(location) => {}}   // מחזיר אובייקט מלא עם ids + labels
/>
```

**עיצוב:**
- 3 select elements בשורה אחת (flex row, gap-2) - במובייל עוברים לעמודה (flex-col)
- Select נעול: `opacity-50 cursor-not-allowed bg-gray-100`
- Select פעיל: `border-primary focus:ring-2 focus:ring-primary/20`
- סיכום מיקום: טקסט קטן בצבע muted מתחת ל-selects

---

## מה כל תפקיד ממלא

### לקוח - פותח קריאה:
- **שם ופרטי קשר** (או אוטומטי מהחשבון)
- **קטגוריה** - מחשב, מדפסת, רשת, תוכנה, אחר
- **תיאור התקלה** - טקסט חופשי
- **דחיפות** - נמוכה / בינונית / גבוהה / קריטית
- **מיקום** - משפך חכם (cascading select) בשלושה שלבים:
  1. **בחירת קומה** - dropdown ראשון (למשל: "קומת קרקע", "קומה 1")
  2. **בחירת סוג חדר** - dropdown שני שמתעדכן לפי הקומה שנבחרה (למשל: "כיתות", "מעבדות", "משרדים")
  3. **בחירת חדר ספציפי** - dropdown שלישי שמתעדכן לפי הסוג שנבחר (למשל: "כיתה א'1", "מעבדת מחשבים")
  - כל dropdown נעול עד שהקודם נבחר
  - שינוי בחירה בשלב מוקדם מאפס את השלבים הבאים
  - מציג את הבחירה המלאה כטקסט: "קומת קרקע > כיתות > כיתה א'1"
  - הנתונים נטענים מ-Firestore (`meta/locations`)

### טכנאי - מעדכן תוך כדי טיפול:
- **סטטוס** - התקבל → בטיפול → ממתין לחלק → הושלם
- **הערות טיפול** - תיעוד מה נעשה
- **שעות עבודה** - התחלה/סיום (טיימר) או הזנה ידנית
- **חומרים/חלקים** - אם הוחלף משהו (אופציונלי)

### מנהל - מעדכן:
- **שיבוץ טכנאי** לקריאה
- **שינוי עדיפות** אם צריך
- **סגירת קריאה** סופית

---

## זרימת עבודה (Workflow)

```
לקוח פותח קריאה (status: "new")
       ↓
מנהל רואה קריאה חדשה ב-Dashboard → משבץ לטכנאי (status: "assigned")
       ↓
טכנאי רואה קריאה חדשה → לוחץ "התחלתי טיפול" (status: "in_progress")
       ↓
טכנאי מוסיף הערות תיעוד תוך כדי עבודה
       ↓
טכנאי לוחץ "טופל" (status: "resolved")
       ↓
מנהל/לקוח מאשר → (status: "closed")
```

---

## Storage Service - דפוס real-time subscriptions

בנה את `src/services/storage.js` בדפוס הבא - כל קריאה מחזירה unsubscribe function לניקוי, כל עדכון קריטי דרך Firestore transaction:

```javascript
import { db } from './firebase';
import {
  collection, doc, onSnapshot, setDoc, updateDoc,
  addDoc, query, where, orderBy, runTransaction,
  serverTimestamp
} from 'firebase/firestore';

export const storageService = {

    // ========== קריאות שירות ==========

    // real-time subscription לכל הקריאות (למנהל)
    subscribeToAllCalls(callback) {
        const q = query(
            collection(db, 'service_calls'),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const calls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(calls);
        });
    },

    // real-time subscription לקריאות של טכנאי ספציפי
    subscribeToCallsByTechnician(techId, callback) {
        const q = query(
            collection(db, 'service_calls'),
            where('assignedTo', '==', techId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const calls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(calls);
        });
    },

    // real-time subscription לקריאות של לקוח
    subscribeToCallsByClient(clientId, callback) {
        const q = query(
            collection(db, 'service_calls'),
            where('clientId', '==', clientId),
            orderBy('createdAt', 'desc')
        );
        return onSnapshot(q, (snapshot) => {
            const calls = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(calls);
        });
    },

    // יצירת קריאת שירות חדשה
    async createServiceCall(callData) {
        return await addDoc(collection(db, 'service_calls'), {
            ...callData,
            status: 'new',
            assignedTo: null,
            assignedTechName: null,
            assignedAt: null,
            notes: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            resolvedAt: null,
            closedAt: null
        });
    },

    // שיבוץ קריאה לטכנאי (עם transaction לעדכון עומס)
    async assignCall(callId, techId, techName) {
        await runTransaction(db, async (transaction) => {
            const callRef = doc(db, 'service_calls', callId);
            const techRef = doc(db, 'technicians', techId);

            const techDoc = await transaction.get(techRef);
            if (!techDoc.exists()) throw new Error("טכנאי לא נמצא");

            transaction.update(callRef, {
                assignedTo: techId,
                assignedTechName: techName,
                assignedAt: serverTimestamp(),
                status: 'assigned',
                updatedAt: serverTimestamp()
            });

            transaction.update(techRef, {
                currentLoad: (techDoc.data().currentLoad || 0) + 1
            });
        });
    },

    // עדכון סטטוס קריאה (עם transaction להורדת עומס כשנסגר)
    async updateCallStatus(callId, newStatus) {
        const callRef = doc(db, 'service_calls', callId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            if (!callDoc.exists()) throw new Error("קריאה לא נמצאה");

            const callData = callDoc.data();
            const updates = { status: newStatus, updatedAt: serverTimestamp() };

            if (newStatus === 'resolved') {
                updates.resolvedAt = serverTimestamp();
            }
            if (newStatus === 'closed') {
                updates.closedAt = serverTimestamp();
                // הורד עומס מהטכנאי
                if (callData.assignedTo) {
                    const techRef = doc(db, 'technicians', callData.assignedTo);
                    const techDoc = await transaction.get(techRef);
                    if (techDoc.exists()) {
                        transaction.update(techRef, {
                            currentLoad: Math.max(0, (techDoc.data().currentLoad || 0) - 1)
                        });
                    }
                }
            }

            transaction.update(callRef, updates);
        });
    },

    // הוספת הערת תיעוד
    async addNote(callId, noteData) {
        const callRef = doc(db, 'service_calls', callId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            if (!callDoc.exists()) throw new Error("קריאה לא נמצאה");

            const notes = callDoc.data().notes || [];
            notes.push({
                ...noteData,
                id: `note_${Date.now()}`,
                timestamp: new Date().toISOString()
            });

            transaction.update(callRef, { notes, updatedAt: serverTimestamp() });
        });
    },

    // ========== טכנאים ==========

    subscribeToTechnicians(callback) {
        return onSnapshot(collection(db, 'technicians'), (snapshot) => {
            const techs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(techs);
        });
    },

    // ========== קטגוריות ==========

    subscribeToCategories(callback) {
        const docRef = doc(db, 'meta', 'categories');
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().list) {
                callback(docSnap.data().list);
            } else {
                callback([
                    { value: "hardware", label: "חומרה", icon: "Monitor" },
                    { value: "software", label: "תוכנה", icon: "Code" },
                    { value: "network", label: "רשת", icon: "Wifi" },
                    { value: "security", label: "אבטחה", icon: "Shield" },
                    { value: "printer", label: "מדפסות", icon: "Printer" },
                    { value: "other", label: "אחר", icon: "HelpCircle" }
                ]);
            }
        });
    },

    async updateCategories(list) {
        const docRef = doc(db, 'meta', 'categories');
        await setDoc(docRef, { list }, { merge: true });
    },

    // ========== מיקומים ==========

    // real-time subscription למבנה המיקומים
    subscribeToLocations(callback) {
        const docRef = doc(db, 'meta', 'locations');
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists() && docSnap.data().floors) {
                callback(docSnap.data());
            } else {
                // נתוני ברירת מחדל - מבנה בית ספר עם 2 קומות
                callback(DEFAULT_LOCATIONS);
            }
        });
    },

    async updateLocations(locationsData) {
        const docRef = doc(db, 'meta', 'locations');
        await setDoc(docRef, locationsData, { merge: true });
    }
};
```

---

## Auth Service

בנה את `src/services/authService.js`:

```javascript
import { auth, db } from './firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export const authService = {
    // התחברות
    async login(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        return { uid: result.user.uid, ...userDoc.data() };
    },

    // הרשמה
    async register(email, password, displayName, role, phone) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
            uid: result.user.uid,
            email,
            displayName,
            role,
            phone,
            active: true,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', result.user.uid), userData);
        return userData;
    },

    // התנתקות
    async logout() {
        await signOut(auth);
    },

    // מעקב אחרי מצב אימות
    onAuthChange(callback) {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                callback({ uid: firebaseUser.uid, ...userDoc.data() });
            } else {
                callback(null);
            }
        });
    }
};
```

---

## עיצוב

- **כיוון:** RTL מלא (כבר מוגדר ב-index.css וב-index.html)
- **שפה:** עברית
- **צבעים לפי סטטוס:**
  - New: אפור (`bg-slate-100 text-slate-700`)
  - Assigned: צהוב (`bg-amber-100 text-amber-700`)
  - In Progress: כחול (`bg-blue-100 text-blue-700`)
  - Resolved: ירוק (`bg-emerald-100 text-emerald-700`)
  - Closed: סגול (`bg-purple-100 text-purple-700`)
- **צבעים לפי עדיפות:**
  - Low: ירוק (`bg-green-100 text-green-700`)
  - Medium: צהוב (`bg-yellow-100 text-yellow-700`)
  - High: כתום (`bg-orange-100 text-orange-700`)
  - Urgent: אדום (`bg-red-100 text-red-700`)
- **Responsive:** Mobile First - טכנאים עובדים מהטלפון בשטח
- **אייקונים:** Lucide React
- **כרטיסים:** `rounded-2xl shadow-sm border` עם צבע רקע לפי סטטוס
- **גלאסמורפיזם:** class `.glass` זמין לשימוש (backdrop-blur)

---

## דגשים חשובים

1. **Mobile First** - טכנאים עובדים מהטלפון, העיצוב חייב להיות מותאם מובייל קודם
2. **Real-time** - כל העדכונים ב-real-time דרך Firestore `onSnapshot` subscriptions. כל subscribe מחזיר unsubscribe function שצריך לקרוא ב-useEffect cleanup
3. **Transactions** - שימוש ב-Firestore `runTransaction` לעדכון עומס טכנאים (`currentLoad`) ולשינויי סטטוס שמשפיעים על מספר documents
4. **5 טכנאים בלבד** - האפליקציה מותאמת ל-5 טכנאים, לא צריך pagination מורכב
5. **SPA** - Single Page Application, אין צורך ב-SSR
6. **ProtectedRoute** - כל route עטוף ב-guard שבודק auth + role
7. **Unsubscribe pattern** - כל useEffect שעושה subscribe חייב לעשות cleanup:
```jsx
useEffect(() => {
    const unsubscribe = storageService.subscribeToAllCalls(setCalls);
    return () => unsubscribe();
}, []);
```

---

## תכנון פיתוח - 5 שלבים

### שלב 0 - תשתית
- Setup פרויקט, Firebase config, מבנה תיקיות, routing בסיסי
- זה 30 דקות עבודה שחוסכות בלאגן אחר כך

### שלב 1 - דמו ויזואלי לבוס
> מטרה: מסכים יפים עם דאטה מדומה - "תראה מה בנינו"

- דף התחברות מעוצב
- Dashboard מנהל עם כרטיסיות סיכום (קריאות פתוחות, עומס טכנאים, דחופים)
- רשימת קריאות שירות מעוצבת עם badges צבעוניים
- תצוגת טכנאים עם סטטוס
- **הכל עם mock data קשיח - בלי Firebase אמיתי עדיין**

### שלב 2 - MVP עובד
> מטרה: מערכת שאפשר להתחיל לעבוד איתה מחר

- חיבור Firebase אמיתי (Auth + Firestore)
- Login/Logout
- לקוח: פתיחת קריאה חדשה
- מנהל: צפייה בקריאות + שיבוץ לטכנאי
- טכנאי: צפייה בקריאות שלו + שינוי סטטוס
- Real-time updates (onSnapshot)
- ProtectedRoute לפי role

### שלב 3 - Quick Wins
> מטרה: פיצ'רים שמשדרגים משמעותית אבל קלים לפיתוח

- הוספת הערות תיעוד לקריאה
- **רישום שעות עבודה** - טיימר התחלה/סיום + הזנה ידנית, סיכום שעות בכל קריאה
- סינון קריאות לפי סטטוס/עדיפות/קטגוריה
- DateNavigation - ניווט לפי תאריכים
- Badge עומס על כל טכנאי
- חיפוש חופשי בקריאות
- PWA בסיסי (manifest + service worker) - התקנה כאפליקציה

### שלב 4 - השקעה גדולה יותר
> מטרה: פיצ'רים שדורשים עבודה אבל חשובים לטווח ארוך

- דוחות וסטטיסטיקות (זמן טיפול ממוצע, עומס טכנאים, פילוח קטגוריות)
- **דוחות שעות לחשבונות** - סיכום שעות לפי לקוח (לחיוב) + לפי טכנאי (לשכר) + ייצוא
- Push Notifications (FCM) - דורש Service Worker + Cloud Function + טיפול בטוקנים
- גיבוי אוטומטי יומי
- ניהול קטגוריות דינמי
- היסטוריית שינויים בקריאה (audit log)

### שלב 5 - Nice to Have
- Dark mode
- ייצוא דוחות ל-Excel/PDF
- Dashboard עם גרפים
- SLA - התראה על חריגה מזמן טיפול
- צירוף תמונות לקריאה
- הערות קוליות
