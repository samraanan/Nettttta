# פרומפט לבניית אפליקציית ניהול טכנאי IT

## הוראות כלליות

בנה לי אפליקציה לניהול 5 טכנאי IT מאפס.
השתמש באותו stack טכנולוגי כמו פרויקט Nettttta הקיים בריפו הזה:
**React 19 + Vite + Tailwind CSS + Firebase (Firestore + Auth) + date-fns (עברית) + Lucide React (אייקונים)**

קח מהפרויקט הקיים את הדברים הבאים והתאם אותם:
- `src/services/firebase.js` - אתחול Firebase (אותו פרויקט Firebase, רק הוסף Email/Password auth)
- `src/lib/utils.js` - פונקציית `cn()` למיזוג Tailwind classes
- `tailwind.config.js`, `postcss.config.js`, `vite.config.js` - קונפיגורציה
- `index.html` - שנה את הכותרת ל"ניהול טכנאי IT"
- תמיכה מלאה ב-RTL ועברית בכל ה-UI
- דפוס ה-real-time subscriptions מ-`src/services/storage.js` (subscribeToDate, transactions)
- דפוס ה-routing לפי תפקידים מ-`src/App.jsx`
- קומפוננטת `DateNavigation` - התאם לניווט בין תאריכים בקריאות שירות

---

## מבנה האפליקציה

### תפקידים (Roles)
1. **מנהל (admin)** - רואה הכל, מנהל טכנאים, משבץ קריאות, צופה בדוחות
2. **טכנאי (technician)** - רואה קריאות שמשובצות אליו, מעדכן סטטוס, מתעד טיפול
3. **לקוח (client)** - פותח קריאת שירות חדשה, עוקב אחרי הסטטוס שלה

### Routes
```
/login                    → דף התחברות (email + password)
/admin                    → Dashboard מנהל
/admin/technicians        → ניהול 5 טכנאים
/admin/calls              → כל הקריאות
/admin/reports            → דוחות וסטטיסטיקות
/technician/:id           → Dashboard טכנאי ספציפי
/technician/:id/call/:callId → פרטי קריאה מלאים
/client                   → דף פתיחת קריאה + מעקב
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

  // שיוך
  clientId: "user-uid",
  clientName: "שרה לוי",
  clientPhone: "052-9876543",
  location: "קומה 3, חדר 301",

  // טכנאי
  assignedTo: "tech_1" | null,
  assignedTechName: "יוסי כהן",
  assignedAt: timestamp | null,

  // תיעוד
  notes: [
    {
      id: "note_1",
      author: "tech_1",
      authorName: "יוסי כהן",
      text: "הגעתי לאתר, בודק את ספק הכוח",
      timestamp: timestamp
    }
  ],

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

---

## קומפוננטות לבנות

### Layout
- **AppLayout** - תפריט צד (sidebar) עם ניווט לפי role, header עם שם משתמש ו-logout
- **LoginPage** - טופס התחברות פשוט

### Dashboard מנהל
- **AdminDashboard** - סיכום: קריאות פתוחות, קריאות דחופות, עומס טכנאים, גרף יומי
- **TechnicianList** - רשימת 5 הטכנאים עם סטטוס (פנוי/עסוק), מספר קריאות פתוחות
- **AllCallsView** - טבלה של כל הקריאות עם סינון (לפי סטטוס, עדיפות, טכנאי, תאריך)
- **AssignCallModal** - חלון שיבוץ קריאה לטכנאי (בחירת טכנאי מתוך 5)
- **ReportsView** - סטטיסטיקות: זמן טיפול ממוצע, קריאות לפי קטגוריה, ביצועי טכנאים

### Dashboard טכנאי
- **TechDashboard** - הקריאות המשובצות לטכנאי, מסודרות לפי עדיפות
- **ServiceCallCard** - כרטיס קריאה (בהשראת LessonCard מ-Nettttta) עם: כותרת, קטגוריה, עדיפות, סטטוס, לקוח, מיקום
- **CallDetailView** - פרטים מלאים של קריאה + אזור הוספת הערות + כפתור שינוי סטטוס
- **StatusControl** - כפתורי שינוי סטטוס (בהשראת ScoringControl): new → assigned → in_progress → resolved

### ממשק לקוח
- **NewCallForm** - טופס פתיחת קריאה חדשה (כותרת, תיאור, קטגוריה, עדיפות, מיקום)
- **MyCallsView** - רשימת הקריאות של הלקוח עם סטטוס בזמן אמת

### משותף
- **DateNavigation** - (מבוסס על הקומפוננטה מ-Nettttta) ניווט בין תאריכים
- **PriorityBadge** - תגית עדיפות צבעונית (ירוק/צהוב/כתום/אדום)
- **StatusBadge** - תגית סטטוס צבעונית
- **CategoryIcon** - אייקון קטגוריה מ-Lucide

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

## Storage Service - פונקציות נדרשות

בנה את `src/services/storage.js` עם הפונקציות הבאות (באותו סגנון כמו הקובץ הקיים ב-Nettttta - real-time subscriptions + transactions):

```javascript
// קריאות שירות
subscribeToAllCalls(callback)                    // real-time - כל הקריאות
subscribeToCallsByTechnician(techId, callback)    // real-time - קריאות של טכנאי
subscribeToCallsByClient(clientId, callback)      // real-time - קריאות של לקוח
createServiceCall(callData)                       // יצירת קריאה חדשה
updateCallStatus(callId, newStatus, techId?)      // עדכון סטטוס (עם transaction)
assignCall(callId, techId)                        // שיבוץ קריאה לטכנאי
addNote(callId, noteData)                         // הוספת הערת תיעוד

// טכנאים
subscribeToTechnicians(callback)                  // real-time - רשימת טכנאים
updateTechnicianLoad(techId, delta)               // עדכון עומס (transaction: +1 או -1)

// קטגוריות
subscribeToCategories(callback)                   // real-time - קטגוריות
updateCategories(list)                            // עדכון קטגוריות

// סטטיסטיקות
getCallStats(dateRange)                           // סטטיסטיקות לפי טווח תאריכים
getTechnicianStats(techId, dateRange)             // ביצועי טכנאי
```

---

## עיצוב

- **כיוון:** RTL מלא
- **שפה:** עברית
- **צבעים:**
  - Primary: כחול (`blue-600`)
  - New: אפור (`slate-100`)
  - Assigned: צהוב (`amber-100`)
  - In Progress: כחול (`blue-100`)
  - Resolved: ירוק (`emerald-100`)
  - Urgent: אדום (`red-100`)
- **Responsive:** מותאם למובייל (טכנאים משתמשים בטלפון בשטח)
- **אייקונים:** Lucide React

---

## דגשים חשובים

1. **Mobile First** - טכנאים עובדים מהטלפון, העיצוב חייב להיות מותאם מובייל
2. **Real-time** - כל העדכונים ב-real-time דרך Firestore subscriptions (כמו ב-Nettttta)
3. **Transactions** - שימוש ב-Firestore transactions לעדכון עומס טכנאים ושינוי סטטוס
4. **5 טכנאים בלבד** - האפליקציה מותאמת ל-5 טכנאים, לא צריך pagination מורכב
5. **אין צורך ב-SSR** - SPA פשוט כמו Nettttta
6. **Firestore Security Rules** - כתוב rules בסיסיים שמגבילים גישה לפי role
