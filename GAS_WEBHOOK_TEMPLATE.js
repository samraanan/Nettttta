/**
 * Google Apps Script - IT Management Webhook Integration
 * 
 * Instructions:
 * 1. Open your target Google Sheet.
 * 2. Go to Extensions -> Apps Script.
 * 3. Delete any existing code and paste this entire file.
 * 4. Click "Deploy" -> "New deployment" at the top right.
 * 5. Select type "Web app".
 * 6. Set "Execute as" to "Me".
 * 7. Set "Who has access" to "Anyone".
 * 8. Click Deploy, authorize the permissions, and copy the "Web app URL".
 * 9. Paste that URL into the "Webhook URL" field in your IT Management app School Settings.
 */

const SHEET_NAME = "Tickets"; // Change this if your sheet tab has a different name

function doPost(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

        // Parse the incoming JSON payload from the React App
        const data = JSON.parse(e.postData.contents);

        const callId = data.id;
        const action = data.action; // 'create' or 'update'
        const payload = data.payload;

        // Check if row already exists for this callId
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();
        const headers = values[0];

        // Find the ID column index (assuming column header is "ID" or "Call ID", or we just append)
        let idColIndex = headers.findIndex(h => h.toString().toLowerCase().includes("id"));
        if (idColIndex === -1) {
            // If no ID column found, let's just assume it's the first column
            idColIndex = 0;
        }

        let rowIndex = -1;
        for (let i = 1; i < values.length; i++) {
            if (values[i][idColIndex] === callId) {
                rowIndex = i + 1; // +1 because rows are 1-indexed in GAS
                break;
            }
        }

        const timestamp = new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
        const locationStr = payload.locationDisplay || (payload.location ? `${payload.location.floorLabel} > ${payload.location.roomLabel}` : 'לא מוגדר');

        // Prepare row data
        // Map this array to match your actual Google Sheet columns!
        // Example: [ID, Date, Client, Location, Category, Description, Status, Priority, Handled By, Notes]
        const rowData = [
            callId,
            timestamp, // Date Updated
            payload.clientName || '',
            locationStr,
            payload.category || '',
            payload.description || '',
            translateStatus(payload.status) || payload.status || 'חדש',
            translatePriority(payload.priority) || '',
            payload.lastHandledByName || '',
            payload.notes ? payload.notes.map(n => n.text).join(" | ") : ''
        ];

        if (rowIndex > -1) {
            // Update existing row
            // We update columns A through J for example. Adjust range as needed.
            sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
        } else {
            // Insert new row
            sheet.appendRow(rowData);
        }

        return ContentService.createTextOutput(JSON.stringify({ success: true }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * doGet — Returns all existing rows from the Sheet as JSON.
 * The React app calls: fetch(webhookUrl)  (GET request)
 * Response: { success: true, rows: [ { id, date, client, location, category, description, status, priority, handledBy, notes }, ... ] }
 */
function doGet(e) {
    try {
        const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
        const dataRange = sheet.getDataRange();
        const values = dataRange.getValues();

        if (values.length <= 1) {
            return ContentService.createTextOutput(JSON.stringify({ success: true, rows: [] }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // First row = headers, rest = data
        const headers = values[0];
        const rows = [];

        for (let i = 1; i < values.length; i++) {
            const row = values[i];
            // Map columns to a structured object
            // Expected column order: ID, Date, Client, Location, Category, Description, Status, Priority, HandledBy, Notes
            rows.push({
                id: row[0] || '',
                date: row[1] || '',
                clientName: row[2] || '',
                locationDisplay: row[3] || '',
                category: row[4] || '',
                description: row[5] || '',
                status: reverseTranslateStatus(row[6]) || 'closed',
                priority: reverseTranslatePriority(row[7]) || null,
                lastHandledByName: row[8] || '',
                notes: row[9] || ''
            });
        }

        return ContentService.createTextOutput(JSON.stringify({ success: true, rows }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

// Helpers
function translateStatus(status) {
    const map = {
        'new': 'חדש',
        'in_progress': 'בטיפול',
        'waiting_for_part': 'ממתין לציוד',
        'resolved': 'טופל',
        'closed': 'סגור'
    };
    return map[status];
}

function translatePriority(p) {
    const map = {
        'low': 'נמוכה',
        'medium': 'רגילה',
        'high': 'גבוהה',
        'urgent': 'קריטית'
    };
    return map[p];
}

function reverseTranslateStatus(heb) {
    const map = {
        'חדש': 'new',
        'בטיפול': 'in_progress',
        'ממתין לציוד': 'waiting_for_part',
        'טופל': 'resolved',
        'סגור': 'closed'
    };
    return map[heb];
}

function reverseTranslatePriority(heb) {
    const map = {
        'נמוכה': 'low',
        'רגילה': 'medium',
        'גבוהה': 'high',
        'קריטית': 'urgent'
    };
    return map[heb];
}
