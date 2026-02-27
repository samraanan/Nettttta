/**
 * CSV Import Helper — maps CSV row columns (Hebrew or English) to service call data
 */

const STATUS_MAP_HEB = {
    'חדש': 'new',
    'בטיפול': 'in_progress',
    'ממתין לציוד': 'waiting_for_part',
    'טופל': 'resolved',
    'סגור': 'closed'
};

const PRIORITY_MAP_HEB = {
    'נמוכה': 'low',
    'רגילה': 'medium',
    'גבוהה': 'high',
    'קריטית': 'urgent'
};

/**
 * Parse a CSV row into a service call data object.
 * Supports both Hebrew and English column names.
 */
export function parseCSVRow(row, schoolId, schoolName, schools) {
    // Helper: pick the first non-empty value from multiple column name options
    const pick = (...keys) => {
        for (const k of keys) {
            if (row[k]?.toString().trim()) return row[k].toString().trim();
        }
        return '';
    };

    const description = pick('תיאור', 'description', 'Description');
    if (!description) return null; // Skip empty rows

    // Status — accept Hebrew labels or English keys
    const rawStatus = pick('סטטוס', 'status', 'Status');
    const status = STATUS_MAP_HEB[rawStatus] || rawStatus || 'new';

    // Priority
    const rawPriority = pick('דחיפות', 'priority', 'Priority');
    const priority = PRIORITY_MAP_HEB[rawPriority] || rawPriority || null;

    // Client
    const clientName = pick('פונה', 'לקוח', 'clientName', 'Client', 'client');
    const clientPhone = pick('טלפון', 'phone', 'Phone');

    // Location
    const locationStr = pick('מיקום', 'location', 'Location');

    // Dates
    const createdAtStr = pick('תאריך פתיחה', 'createdAt', 'Created', 'created_at', 'תאריך');
    const updatedAtStr = pick('תאריך עדכון', 'updatedAt', 'Updated', 'updated_at');

    // Notes / what was done
    const notesStr = pick('מה בוצע', 'הערות', 'notes', 'Notes', 'what_done');

    // Supplied equipment
    const equipmentStr = pick('ציוד שסופק', 'equipment', 'Equipment', 'supplied_equipment');

    // Handled by
    const handledBy = pick('טופל ע"י', 'handledBy', 'handled_by', 'HandledBy');

    // School name override (for AllCallsList import)
    const rowSchoolName = pick('בית ספר', 'schoolName', 'School');
    let resolvedSchoolId = schoolId;
    let resolvedSchoolName = schoolName;
    if (rowSchoolName && schools?.length) {
        const match = schools.find(s => s.name === rowSchoolName);
        if (match) {
            resolvedSchoolId = match.id;
            resolvedSchoolName = match.name;
        }
    }

    // Parse dates
    const parseDate = (str) => {
        if (!str) return null;
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    };

    const createdAt = parseDate(createdAtStr);
    const updatedAt = parseDate(updatedAtStr);

    // Use the parsed date (or createdAt as fallback) for note/equipment timestamps
    // to avoid overwriting original dates with today's date
    const importTimestamp = (updatedAt || createdAt || new Date()).toISOString();

    // Build notes array
    const notes = notesStr
        ? [{ id: `note_import_${Date.now()}`, techId: 'csv_import', techName: handledBy || 'ייבוא', text: notesStr, timestamp: importTimestamp }]
        : [];

    // Build supplied equipment array
    const suppliedEquipment = equipmentStr
        ? [{ itemId: 'import', itemName: equipmentStr, quantity: 1, techId: 'csv_import', techName: handledBy || 'ייבוא', timestamp: importTimestamp }]
        : [];

    return {
        schoolId: resolvedSchoolId,
        schoolName: resolvedSchoolName,
        description,
        category: pick('קטגוריה', 'category', 'Category') || 'general',
        clientId: 'csv_import',
        clientName: clientName || 'ייבוא CSV',
        clientPhone: clientPhone || null,
        clientEmail: '',
        location: {
            floorLabel: 'ייבוא',
            categoryLabel: '',
            roomLabel: locationStr,
            roomNumber: ''
        },
        locationDisplay: locationStr || 'לא מוגדר',
        status,
        priority,
        notes,
        suppliedEquipment,
        lastHandledByName: handledBy || null,
        createdAt: createdAt || undefined,  // undefined = let serverTimestamp() handle it
        updatedAt: updatedAt || createdAt || undefined,  // fallback to createdAt, not today
        source: 'csv_import'
    };
}
