# Changelog

## v2.0.0 — School Management & Integrations (2026-02-27)

### ✨ New Features

#### School Onboarding Wizard
- Multi-step wizard for creating new schools (`NewSchoolWizard.jsx`)
- Step 1: Basic info (name, address, contact, optional Webhook URL)
- Step 2: Location hierarchy with customizable level names (שכבות/בניינים/אגפים)
- Step 3: Service categories (editable defaults)
- Step 4: Initial inventory quick-add (consumables with quantities)

#### Secure School Deletion
- Hard delete with cascading removal of all school data (calls, users, metadata)
- Confirmation modal requiring exact school name to proceed
- "Danger Zone" section in school settings

#### Mobile Device Tickets
- Toggle between "Physical Location" and "Mobile Device" in LocationPicker
- Barcode/Device ID input for laptops and portable equipment
- Bypasses floor/room selection for mobile devices

#### Google Sheets Integration
- `GAS_WEBHOOK_TEMPLATE.js` — ready-to-deploy Apps Script for Google Sheets
- Real-time webhook: tickets auto-sync to Google Sheets on create/update
- `doGet()` for reading existing sheet rows back
- Webhook URL field in school settings (פרטים כלליים tab)

#### CSV Import/Export
- **Export**: Download filtered tickets as CSV with Hebrew headers (15 columns)
- **Import**: Upload CSV to bulk-create tickets (supports Hebrew and English column names)
- Shared `csvImportHelper.js` parser with smart column mapping
- Full column support: תיאור, סטטוס, דחיפות, תאריך פתיחה/עדכון, טלפון, מה בוצע, ציוד שסופק, טופל ע"י

#### Advanced Filtering & Sorting
- Date range filtering (from/to) in ticket list
- Sorting by: date, school name, status, priority
- Sort dropdown in AllCallsList header

### 🔧 Infrastructure
- Migrated to isolated Firebase project (`it-management-e6c9a`)
- Added `updateSchoolInfo()` and `addSchool()` to storageService
- `createServiceCall()` now accepts optional overrides for imports (status, dates, notes, equipment)
- Bulk user import via CSV with PapaParse

### 📁 Files Added
- `src/components/tech-manager/NewSchoolWizard.jsx`
- `src/lib/csvImportHelper.js`
- `src/services/migrationService.js`
- `GAS_WEBHOOK_TEMPLATE.js`

### 📝 Files Modified
- `src/services/storage.js` — deleteSchool, addSchool, updateSchoolInfo, webhook helper
- `src/components/tech-manager/SchoolSetup.jsx` — Info tab, Danger Zone, CSV import
- `src/components/tech-manager/SchoolSettings.jsx` — New School button
- `src/components/shared/LocationPicker.jsx` — Mobile device toggle
- `src/components/technician/AllCallsList.jsx` — Export/Import CSV, date filter, sorting
- `src/components/tech-manager/UserManager.jsx` — Bulk CSV user import
- `src/components/tech-manager/ManagerDashboard.jsx` — Migration button
- `src/App.jsx` — New routes
- `src/services/firebase.js` — New project config
