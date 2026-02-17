# ריכוז קישורים למערכת (MyTrack)

הכתובת הבסיסית של המערכת: `https://netta.surge.sh`

## 👨‍🎓 תצוגות ראשיות
| תפקיד | קישור | תיאור |
|-------|-------|-------|
| **תלמיד** | [/student](https://netta.surge.sh/student) | צפייה במערכת, שליחת עדכונים, צפייה בניקוד |
| **מנהל / הורה** | [/admin](https://netta.surge.sh/admin) | עריכת מערכת שעות, הוספת מקצועות, צפייה בכל הנתונים |

## 👩‍🏫 קישורים למורים (לפי מקצוע)
כל מורה מקבל קישור ייחודי למקצוע שלו. הקישור מאפשר למורה לאשר דיווחים של תלמידים.

| מקצוע (קוד) | מזהה מורה (ID) | קישור ישיר |
|---|---|---|
| **חשבון** (Arithmetic) | `t1` | [/teacher/arithmetic](https://netta.surge.sh/teacher/arithmetic) |
| **אנגלית** (English) | `t2` | [/teacher/english](https://netta.surge.sh/teacher/english) |
| **היסטוריה** (History) | `t3` | [/teacher/history](https://netta.surge.sh/teacher/history) |
| **ספורט** (Sports) | `t4` | [/teacher/sports](https://netta.surge.sh/teacher/sports) |
| **מדעים** (Science) | `t5` | [/teacher/science](https://netta.surge.sh/teacher/science) |

> **הערה לפיתוח:** שמות המקצועות ב-URL מוגדרים בקובץ `src/App.jsx` באובייקט `SUBJECT_MAP`.
