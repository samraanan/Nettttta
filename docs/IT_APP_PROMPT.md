# פרומפט לבניית אפליקציית ניהול טכנאי IT

## הוראות כלליות

בנה לי אפליקציה לניהול צוות של 5 טכנאי IT שנותנים שירות למספר בתי ספר.
הטכנאים הם צוות אחד (לא שייכים לבית ספר מסוים) שמשרת את כל בתי הספר.
כל בית ספר הוא "לקוח" עם הגדרות משלו (מיקומים, קטגוריות וכו').
כשנכנס בית ספר חדש למערכת, מגדירים לו את המאפיינים הייחודיים שלו.

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
│   │   ├── CategoryIcon.jsx       # אייקון קטגוריה מ-Lucide
│   │   └── LocationPicker.jsx     # משפך חכם לבחירת מיקום (קומה → סוג → חדר)
│   ├── tech-manager/
│   │   ├── ManagerDashboard.jsx   # מסך ראשי מנהל טכנאים - כל בתי הספר או בית ספר בודד
│   │   ├── SchoolSelector.jsx     # בחירת בית ספר (תצוגה כולל / בית ספר בודד)
│   │   ├── AllCallsView.jsx       # כל הפניות עם סינון (בית ספר / סטטוס / קטגוריה)
│   │   ├── ReportsView.jsx        # סטטיסטיקות ודוחות חוצי בתי ספר
│   │   ├── InventoryManager.jsx   # ניהול מלאי ציוד
│   │   └── SchoolSettings.jsx     # הגדרות בית ספר חדש (מיקומים, קטגוריות)
│   ├── technician/
│   │   ├── TechDashboard.jsx      # מסך ראשי טכנאי - כל הפניות + כניסה/יציאה לבי"ס
│   │   ├── ClockInOut.jsx         # כניסה/יציאה לבית ספר (מעקב שעות)
│   │   ├── ServiceCallCard.jsx    # כרטיס פנייה
│   │   ├── CallDetailView.jsx     # פרטי פנייה + הערות + שינוי סטטוס + היסטוריה
│   │   ├── StatusControl.jsx      # כפתורי שינוי סטטוס
│   │   └── SendMessageModal.jsx   # שליחת הודעה ללקוח (מייל/ווצאפ/נוטיפיקציה)
│   ├── school-admin/
│   │   ├── SchoolDashboard.jsx    # מסך ראשי מנהל בית ספר - סיכום + דוחות
│   │   ├── SchoolCallsView.jsx    # צפייה בפניות בית הספר (קריאה בלבד + drill down)
│   │   └── SchoolReports.jsx      # דוחות ברמת בית ספר
│   └── client/
│       ├── NewCallForm.jsx        # טופס פתיחת פנייה חדשה
│       └── MyCallsView.jsx        # רשימת הפניות שלי + סטטוס
├── pages/
│   └── LoginPage.jsx              # דף התחברות
├── services/
│   ├── firebase.js                # אתחול Firebase
│   ├── storage.js                 # Firestore CRUD + real-time subscriptions
│   ├── authService.js             # פונקציות login/logout/register
│   └── googleSheetsService.js     # משיכת פניות מ-Google Forms/Sheets
├── lib/
│   └── utils.js                   # cn() utility
├── App.jsx                        # Router ראשי
├── main.jsx                       # Entry point
└── index.css                      # Tailwind base + CSS variables
```

---

## מבנה האפליקציה

### תפקידים (Roles)
1. **מנהל טכנאים (tech_manager)** - הבעלים של צוות הטכנאים. רואה פניות של **כל** בתי הספר ביחד או לחוד. מנהל מלאי, דוחות, הגדרות בתי ספר. **גם טכנאי בעצמו** - קונסולת מנהל = קונסולת טכנאי + יכולות ניהול.
2. **טכנאי (technician)** - רואה את **כל** הפניות מכל בתי הספר. כל פנייה יכולה להיות מטופלת ע"י כל טכנאי. **אין שיבוץ** - מי שנוגע בפנייה מתועד כאחרון שטיפל. מנהל שעות כניסה/יציאה לבתי ספר.
3. **מנהל בית ספר (school_admin)** - רואה נתונים ודוחות של **בית הספר שלו בלבד**. יכול לרדת לרזולוציות ולקרוא פניות ספציפיות. לא מטפל בפניות.
4. **לקוח (client)** - צוות בית הספר. פותח פנייה חדשה ועוקב אחרי הסטטוס שלה. **לא מגדיר דחיפות**.

### Routes
```
/login                        → דף התחברות (email + password)
/manager                      → Dashboard מנהל טכנאים (כולל יכולות טכנאי)
/manager/calls                → כל הפניות מכל בתי הספר (עם סינון)
/manager/calls/:callId        → פרטי פנייה + היסטוריה
/manager/reports              → דוחות וסטטיסטיקות חוצי בתי ספר
/manager/inventory            → ניהול מלאי ציוד
/manager/schools/:schoolId    → הגדרות בית ספר (מיקומים, קטגוריות)
/technician                   → Dashboard טכנאי (כל הפניות + כניסה/יציאה)
/technician/call/:callId      → פרטי פנייה + היסטוריה
/school/:schoolId             → Dashboard מנהל בית ספר (דוחות + צפייה בפניות)
/client                       → דף פתיחת פנייה + מעקב
```

### אימות (Authentication)
- Firebase Auth עם Email/Password
- בעת הרשמה - שמור את ה-role ב-Firestore (collection: `users`)
- **לקוח ומנהל בית ספר** משויכים ל-`schoolId` ספציפי
- **טכנאי ומנהל טכנאים** לא משויכים לבית ספר - רואים את כל בתי הספר
- Guard על כל route - אם לא מחובר → redirect ל-`/login`
- אם מחובר אבל ניגש ל-route לא שלו → redirect ל-dashboard שלו

---

## מודל נתונים (Firestore Collections)

### `schools`
כל בית ספר הוא "לקוח" של צוות הטכנאים. כשנכנס בית ספר חדש - מגדירים לו מיקומים, קטגוריות וכו'.
```javascript
{
  id: "school_1",
  name: "בית ספר אופק",
  address: "רחוב הרצל 15, תל אביב",
  phone: "03-1234567",
  contactName: "דוד כהן",
  contactEmail: "david@ofek-school.co.il",
  // אינטגרציית Google Forms - אופציונלי
  googleSheetId: "1BxiMVs0XRA5nFMdKvBd..." | null,   // ID של Google Sheet שמקושר לטופס
  googleFormUrl: "https://forms.gle/..." | null,       // URL של טופס Google לשליחה ללקוחות
  active: true,
  createdAt: timestamp
}
```

### `users`
```javascript
{
  uid: "firebase-auth-uid",
  email: "user@example.com",
  displayName: "ישראל ישראלי",
  role: "tech_manager" | "technician" | "school_admin" | "client",
  // לקוחות ומנהלי בתי ספר - משויכים לבית ספר
  schoolId: "school_1" | null,         // null עבור טכנאים ומנהל טכנאים
  schoolName: "בית ספר אופק" | null,
  phone: "050-1234567",
  active: true,
  createdAt: timestamp
}
```

### `technicians`
הטכנאים הם צוות אחד גלובלי (לא שייכים לבית ספר). 5 טכנאים בסה"כ.
```javascript
{
  id: "tech_1",
  uid: "firebase-auth-uid",            // קישור ל-users collection
  name: "יוסי כהן",
  phone: "050-1234567",
  email: "yossi@company.com",
  specialties: ["network", "hardware", "software"],
  isManager: false,                     // true = מנהל טכנאים (role: tech_manager)
  active: true
}
```

### `service_calls` (פניות)
**אין שיבוץ** לטכנאי ספציפי. כל הטכנאים רואים הכל. מי שנוגע - מתועד כאחרון.
```javascript
{
  id: "call_20260224_001",
  schoolId: "school_1",
  schoolName: "בית ספר אופק",          // denormalized

  // תיאור הפנייה (לקוח ממלא)
  // אין title - הקטגוריה מספיקה
  description: "המחשב בעמדה 5 לא מגיב ללחיצה על כפתור ההפעלה",
  category: "hardware" | "software" | "network" | "security" | "printer" | "other",

  // דחיפות - נקבעת ע"י טכנאי/מנהל טכנאים (לא הלקוח!)
  priority: "low" | "medium" | "high" | "urgent" | null,  // null = טרם נקבעה

  // סטטוס: התקבל → בטיפול → ממתין → הושלם → סגור
  status: "new" | "in_progress" | "waiting" | "resolved" | "closed",

  // שיוך לקוח
  clientId: "user-uid",
  clientName: "שרה לוי",
  clientPhone: "052-9876543",
  clientEmail: "sara@ofek-school.co.il",

  // מיקום - נבחר דרך משפך חכם (קומה → סוג → חדר)
  location: {
    floorId: "ground",
    floorLabel: "קומת קרקע",
    categoryId: "classrooms",
    categoryLabel: "כיתות",
    roomId: "room_a1",
    roomLabel: "כיתה א'1"
  },
  locationDisplay: "קומת קרקע > כיתות > כיתה א'1",

  // אחרון שטיפל (לא שיבוץ - כל טכנאי יכול לטפל)
  lastHandledBy: "tech_1" | null,
  lastHandledByName: "יוסי כהן" | null,
  lastHandledAt: timestamp | null,

  // הערות טיפול
  notes: [
    {
      id: "note_1",
      techId: "tech_1",
      techName: "יוסי כהן",
      text: "הגעתי לאתר, בודק את ספק הכוח",
      timestamp: timestamp
    }
  ],

  // ציוד שסופק - מתוך רשימת מלאי קשיחה (לא טקסט חופשי)
  suppliedEquipment: [
    {
      itemId: "inv_cable_power",
      itemName: "כבל חשמל",
      quantity: 1,
      techId: "tech_1",
      techName: "יוסי כהן",
      timestamp: timestamp
    }
  ],

  // היסטוריה (Audit Log) - כל שינוי מתועד אוטומטית
  history: [
    {
      id: "hist_1",
      action: "created",              // created | status_changed | priority_set | note_added | equipment_supplied | message_sent | closed
      description: "פנייה נפתחה",
      performedBy: "user-uid",
      performedByName: "שרה לוי",
      oldValue: null,
      newValue: "new",
      timestamp: timestamp
    },
    {
      id: "hist_2",
      action: "status_changed",
      description: "סטטוס שונה ל: בטיפול",
      performedBy: "tech_1",
      performedByName: "יוסי כהן",
      oldValue: "new",
      newValue: "in_progress",
      timestamp: timestamp
    }
  ],

  // מקור הפנייה
  source: "app" | "google_form",       // app = נפתחה דרך האפליקציה, google_form = נמשכה מ-Google Sheets

  // זמנים
  createdAt: timestamp,
  updatedAt: timestamp,
  resolvedAt: timestamp | null,
  closedAt: timestamp | null
}
```

### `work_sessions` (מעקב שעות כניסה/יציאה לבתי ספר)
**לא ברמת פנייה** אלא ברמת ביקור בבית ספר. במסך הראשי הטכנאי לוחץ "כניסה" → בוחר בית ספר → כשיוצא לוחץ "יציאה".
```javascript
{
  id: "ws_20260224_tech1_001",
  techId: "tech_1",
  techName: "יוסי כהן",
  schoolId: "school_1",
  schoolName: "בית ספר אופק",
  clockIn: timestamp,                   // שעת כניסה
  clockOut: timestamp | null,           // null = עדיין באתר
  durationMinutes: 120 | null,          // מחושב אוטומטית ב-clockOut
  date: "2026-02-24",                   // תאריך (לשליפה קלה לדוחות)
  createdAt: timestamp
}
```

### `inventory_items` (מלאי ציוד)
רשימה קשיחה של פריטי ציוד. כשטכנאי מספק ציוד בפנייה - בוחר מרשימה זו.
```javascript
{
  id: "inv_cable_power",
  name: "כבל חשמל",
  category: "cables" | "peripherals" | "components" | "consumables" | "other",
  inStock: 25,                          // כמות במלאי
  minStock: 5,                          // התראה כשיורד מתחת
  active: true
}
```

### `categories` (doc: `schools/{schoolId}/meta/categories`)
הקטגוריות מנוהלות **ברמת בית ספר** - כל בית ספר יכול להתאים את הקטגוריות שלו.
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

### `locations` (doc: `schools/{schoolId}/meta/locations`)
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

### ServiceCallCard - כרטיס פנייה
כרטיס עם border צבעוני לפי דחיפות (אם נקבעה). מציג: **שם בית ספר**, קטגוריה (עם אייקון), דחיפות (badge, רק אם נקבעה), סטטוס (badge), שם לקוח, מיקום (מתוך `locationDisplay`), אחרון שטיפל, וזמן פתיחה. עיצוב: `rounded-2xl shadow-sm border` עם צבע רקע לפי סטטוס.

### StatusControl - כפתורי שינוי סטטוס
שורת כפתורים: **התקבל** (new) → **בטיפול** (in_progress) → **ממתין** (waiting) → **הושלם** (resolved) → **סגור** (closed). כל סטטוס בצבע אחר. הכפתור הפעיל בולט. **כל שינוי סטטוס מתועד ב-history אוטומטית** ומעדכן את `lastHandledBy`.

### ClockInOut - כניסה/יציאה לבית ספר
קומפוננטה במסך הראשי של הטכנאי:
- **כפתור "כניסה"** → נפתח modal לבחירת בית ספר → יוצר `work_session` עם `clockIn`
- **כפתור "יציאה"** (מופיע כשיש session פתוח) → מסיים את ה-session עם `clockOut`
- מציג טיימר חי של כמה זמן הטכנאי באתר
- מציג את שם בית הספר הנוכחי

### SendMessageModal - שליחת הודעה ללקוח
Modal שמאפשר לטכנאי להזין הודעה חופשית ולשלוח ללקוח:
- **ערוצי שליחה:** מייל / WhatsApp / Push Notification
- ההודעה נשמרת גם כ-note בפנייה וגם ב-history

### LocationPicker - משפך חכם לבחירת מיקום
3 dropdowns מדורגים: קומה → סוג חדר → חדר ספציפי.
```
[בחר קומה ▼]  →  [בחר סוג חדר ▼]  →  [בחר חדר ▼]
```
- כל dropdown נעול עד שהקודם נבחר
- שינוי בחירה מוקדמת מאפס את השלבים הבאים
- מתחת: טקסט סיכום "קומת קרקע > כיתות > כיתה א'1"
- הנתונים נטענים מ-`schools/{schoolId}/meta/locations`

### InventoryManager - ניהול מלאי (מנהל טכנאים)
טבלה של פריטי ציוד עם: שם, קטגוריה, כמות במלאי, סף מינימום. התראה ויזואלית על פריטים מתחת לסף.

---

## מה כל תפקיד ממלא

### לקוח (client) - פותח פנייה:
**רושם:**
- **קטגוריה** - חומרה / תוכנה / רשת / אבטחה / מדפסות / אחר (בחירה קשיחה)
- **תיאור התקלה** - טקסט חופשי
- **מיקום** - משפך חכם: קומה → סוג חדר → חדר ספציפי

**מקבל:**
- רשימת הפניות שלו עם סטטוס מעודכן בזמן אמת
- הודעות מהטכנאי (מייל/ווצאפ/נוטיפיקציה)

**לא ממלא:** דחיפות (נקבעת ע"י טכנאי/מנהל)

### טכנאי (technician) - מטפל בפניות:
**רואה:** את **כל** הפניות מכל בתי הספר (לא רק "שלו")

**רושם:**
- **שינוי סטטוס** - התקבל → בטיפול → ממתין → הושלם → סגור
- **קביעת דחיפות** - נמוכה / בינונית / גבוהה / קריטית
- **הערות טיפול** - תיעוד מה נעשה (טקסט חופשי)
- **ציוד שסופק** - בחירה מרשימת מלאי קשיחה + כמות
- **הודעה ללקוח** - טקסט חופשי שנשלח במייל/ווצאפ/נוטיפיקציה
- **כניסה/יציאה לבית ספר** - שעון נוכחות ברמת ביקור
- **סגירת פנייה** - טכנאי יכול לסגור פנייה

**מקבל:**
- כל הפניות מכל בתי הספר
- כל שינוי בזמן אמת (טכנאי אחר עדכן → רואה מיד)

### מנהל טכנאים (tech_manager) - **גם טכנאי** + ניהול:
**כל מה שיש לטכנאי**, ובנוסף:
- **תצוגה כוללת** - כל הפניות מכל בתי הספר ביחד, או סינון לבית ספר בודד
- **דוחות** - זמן טיפול, פילוח קטגוריות, שעות עבודה לפי טכנאי/בית ספר
- **ניהול מלאי** - הוספה/הסרה/עדכון כמויות של פריטי ציוד
- **הגדרות בתי ספר חדשים** - הגדרת מיקומים, קטגוריות, אינטגרציית Google

### מנהל בית ספר (school_admin) - צפייה ודוחות:
**רואה:** רק את בית הספר שלו

**מקבל:**
- סיכום פניות (פתוחות, בטיפול, ממתינות, סגורות)
- דוחות ברמת בית ספר (זמני טיפול, פילוח קטגוריות)
- יכולת לרדת לפנייה ספציפית ולקרוא את הפרטים וההיסטוריה

**לא עושה:** לא מטפל בפניות, לא משנה סטטוס, לא מוסיף הערות

---

## זרימת עבודה (Workflow)

```
לקוח פותח פנייה (status: "new", priority: null)
       ↓
כל הטכנאים רואים את הפנייה ברשימה
       ↓
טכנאי נכנס לפנייה → קובע דחיפות + לוחץ "בטיפול" (status: "in_progress")
       ↓                  (lastHandledBy מתעדכן אוטומטית)
טכנאי מוסיף הערות, מספק ציוד, שולח הודעה ללקוח
       ↓
[אם צריך להמתין] → טכנאי לוחץ "ממתין" (status: "waiting")
       ↓
טכנאי (אותו אחד או אחר) חוזר לפנייה → "בטיפול" → "הושלם" (status: "resolved")
       ↓
טכנאי סוגר את הפנייה (status: "closed")

כל שינוי מתועד אוטומטית ב-history עם: מי, מה, מתי
```

### Google Forms Integration
חלק מבתי הספר אוספים פניות דרך Google Forms:
```
לקוח ממלא Google Form
       ↓
תשובות נכנסות ל-Google Sheet מקושר
       ↓
המערכת מושכת (poll) שורות חדשות מהשיט → יוצרת פניות עם source: "google_form"
       ↓
הפניות נכנסות לזרימה הרגילה
```

---

## Storage Service - דפוס real-time subscriptions

בנה את `src/services/storage.js` - כל subscribe מחזיר unsubscribe function.

**הבדל חשוב:**
- **טכנאי/מנהל טכנאים** - רואים פניות מ**כל** בתי הספר (אפשר לסנן לבית ספר בודד)
- **לקוח** - רואה רק פניות **שלו** בבית הספר שלו
- **מנהל בית ספר** - רואה רק פניות של **בית הספר שלו**

```javascript
import { db } from './firebase';
import {
  collection, doc, onSnapshot, setDoc, updateDoc,
  addDoc, query, where, orderBy, runTransaction,
  serverTimestamp, arrayUnion
} from 'firebase/firestore';

export const storageService = {

    // ========== פניות ==========

    // כל הפניות - לטכנאים ומנהל טכנאים (חוצה בתי ספר)
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

    // פניות לפי בית ספר - למנהל בית ספר
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

    // פניות של לקוח ספציפי
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

    // יצירת פנייה חדשה (לקוח)
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
            priority: null,              // דחיפות נקבעת ע"י טכנאי
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

    // עדכון סטטוס פנייה + תיעוד ב-history + עדכון lastHandledBy
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

            // הוסף ל-history
            const history = callData.history || [];
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

    // קביעת/שינוי דחיפות
    async updateCallPriority(callId, priority, techId, techName) {
        const callRef = doc(db, 'service_calls', callId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            if (!callDoc.exists()) throw new Error("פנייה לא נמצאה");

            const callData = callDoc.data();
            const history = callData.history || [];
            history.push({
                id: `hist_${Date.now()}`,
                action: 'priority_set',
                description: `דחיפות נקבעה: ${priority}`,
                performedBy: techId,
                performedByName: techName,
                oldValue: callData.priority,
                newValue: priority,
                timestamp: new Date().toISOString()
            });

            transaction.update(callRef, {
                priority,
                lastHandledBy: techId,
                lastHandledByName: techName,
                lastHandledAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                history
            });
        });
    },

    // הוספת הערת טיפול
    async addNote(callId, noteData, techId, techName) {
        const callRef = doc(db, 'service_calls', callId);

        await runTransaction(db, async (transaction) => {
            const callDoc = await transaction.get(callRef);
            if (!callDoc.exists()) throw new Error("פנייה לא נמצאה");

            const callData = callDoc.data();
            const notes = callData.notes || [];
            const history = callData.history || [];

            notes.push({
                ...noteData,
                id: `note_${Date.now()}`,
                techId,
                techName,
                timestamp: new Date().toISOString()
            });

            history.push({
                id: `hist_${Date.now()}`,
                action: 'note_added',
                description: `הערה נוספה: "${noteData.text.substring(0, 50)}..."`,
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

    // הוספת ציוד שסופק (מרשימת מלאי)
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

            // הורד מהמלאי
            transaction.update(invRef, {
                inStock: Math.max(0, (invData.inStock || 0) - quantity)
            });

            const suppliedEquipment = callData.suppliedEquipment || [];
            const history = callData.history || [];

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

    // ========== שעות עבודה (כניסה/יציאה לבית ספר) ==========

    // יצירת session כניסה
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

    // סיום session יציאה
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

    // session פתוח של טכנאי (אם יש)
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

    // sessions לפי טכנאי ותאריך (לדוחות)
    subscribeToWorkSessions(filters, callback) {
        let q = query(collection(db, 'work_sessions'), orderBy('clockIn', 'desc'));
        // filters יכול לכלול: techId, schoolId, dateFrom, dateTo
        return onSnapshot(q, (snapshot) => {
            let sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // סינון client-side לפי filters
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

    // ========== קטגוריות + מיקומים (ברמת בית ספר) ==========

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
            callback(docSnap.exists() && docSnap.data().floors ? docSnap.data() : DEFAULT_LOCATIONS);
        });
    },

    async updateLocations(schoolId, locationsData) {
        await setDoc(doc(db, 'schools', schoolId, 'meta', 'locations'), locationsData, { merge: true });
    }
};
```

---

## Auth Service

בנה את `src/services/authService.js`.
**חשוב:**
- **טכנאי/מנהל טכנאים** - `schoolId` = null (רואים הכל)
- **לקוח/מנהל בית ספר** - `schoolId` מחייב (רואים רק בית ספר שלהם)

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
    async login(email, password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        return { uid: result.user.uid, ...userDoc.data() };
    },

    async register({ email, password, displayName, role, phone, schoolId, schoolName }) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const userData = {
            uid: result.user.uid,
            email, displayName, role, phone,
            schoolId: schoolId || null,
            schoolName: schoolName || null,
            active: true,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'users', result.user.uid), userData);
        return userData;
    },

    async logout() {
        await signOut(auth);
    },

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
  - התקבל (new): אפור (`bg-slate-100 text-slate-700`)
  - בטיפול (in_progress): כחול (`bg-blue-100 text-blue-700`)
  - ממתין (waiting): צהוב (`bg-amber-100 text-amber-700`)
  - הושלם (resolved): ירוק (`bg-emerald-100 text-emerald-700`)
  - סגור (closed): סגול (`bg-purple-100 text-purple-700`)
- **צבעים לפי דחיפות:**
  - לא נקבעה (null): אפור (`bg-gray-100 text-gray-500`)
  - נמוכה (low): ירוק (`bg-green-100 text-green-700`)
  - בינונית (medium): צהוב (`bg-yellow-100 text-yellow-700`)
  - גבוהה (high): כתום (`bg-orange-100 text-orange-700`)
  - קריטית (urgent): אדום (`bg-red-100 text-red-700`)
- **Responsive:** Mobile First - טכנאים עובדים מהטלפון בשטח
- **אייקונים:** Lucide React
- **כרטיסים:** `rounded-2xl shadow-sm border` עם צבע רקע לפי סטטוס
- **גלאסמורפיזם:** class `.glass` זמין לשימוש (backdrop-blur)

---

## דגשים חשובים

1. **Multi-Tenant** - הטכנאים הם צוות גלובלי שרואה הכל. לקוחות ומנהלי בתי ספר רואים רק את בית הספר שלהם.
2. **אין שיבוץ** - כל טכנאי רואה את כל הפניות. מי שנוגע בפנייה מתועד כ-`lastHandledBy`. כמה טכנאים יכולים לטפל באותה פנייה.
3. **Audit Log** - כל שינוי בפנייה (סטטוס, דחיפות, הערה, ציוד, הודעה) מתועד אוטומטית ב-`history` עם: מי, מה, מתי.
4. **Mobile First** - טכנאים עובדים מהטלפון בשטח
5. **Real-time** - כל העדכונים ב-real-time דרך Firestore `onSnapshot`. כל subscribe מחזיר unsubscribe function שצריך לקרוא ב-useEffect cleanup
6. **Transactions** - שימוש ב-`runTransaction` כשמעדכנים כמה documents (למשל: ציוד שסופק → עדכון מלאי + עדכון פנייה)
7. **5 טכנאים בלבד** - צוות קטן וקבוע, לא צריך pagination
8. **SPA** - Single Page Application
9. **ProtectedRoute** - guard שבודק auth + role
10. **Unsubscribe pattern:**
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
- הגדרת 4 roles ב-ProtectedRoute

### שלב 1 - דמו ויזואלי
> מטרה: מסכים יפים עם mock data

- דף התחברות
- Dashboard טכנאי/מנהל - רשימת פניות מכל בתי הספר עם badges צבעוניים
- כרטיס פנייה עם סטטוס + דחיפות + בית ספר + מיקום
- כפתורי שינוי סטטוס (התקבל → בטיפול → ממתין → הושלם → סגור)
- **הכל עם mock data קשיח**

### שלב 2 - MVP עובד
> מטרה: מערכת שאפשר להתחיל לעבוד איתה מחר

- חיבור Firebase אמיתי (Auth + Firestore)
- Login/Logout + ProtectedRoute לפי role
- לקוח: פתיחת פנייה (קטגוריה + תיאור + מיקום)
- טכנאי: צפייה בכל הפניות + שינוי סטטוס + קביעת דחיפות + הערות
- מנהל טכנאים: כמו טכנאי + סינון לפי בית ספר
- מנהל בית ספר: צפייה בפניות בית הספר שלו
- Real-time updates
- כניסה/יציאה לבית ספר (שעון נוכחות)
- היסטוריה (audit log) בכל פנייה

### שלב 3 - Quick Wins
> מטרה: פיצ'רים שמשדרגים משמעותית

- שליחת הודעה ללקוח (מייל/ווצאפ/נוטיפיקציה)
- ציוד שסופק מרשימת מלאי + ניהול מלאי
- סינון פניות לפי סטטוס/דחיפות/קטגוריה/בית ספר
- חיפוש חופשי בפניות
- הגדרות בית ספר חדש (מיקומים, קטגוריות)
- PWA בסיסי - התקנה כאפליקציה

### שלב 4 - השקעה גדולה יותר
> מטרה: פיצ'רים חשובים לטווח ארוך

- Google Forms/Sheets integration - משיכת פניות מגוגל
- דוחות: זמן טיפול, שעות לפי טכנאי/בית ספר, פילוח קטגוריות
- Push Notifications (FCM)
- גיבוי אוטומטי יומי

### שלב 5 - Nice to Have
- Dark mode
- ייצוא דוחות ל-Excel/PDF
- Dashboard עם גרפים
- SLA - התראה על חריגה מזמן טיפול
- צירוף תמונות לפנייה
