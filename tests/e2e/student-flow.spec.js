
import { test, expect } from '@playwright/test';

test.describe('Student Scoring Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to local dev server student route
        await page.goto('http://localhost:5173/student');
    });

    test('should allow setting scores without premature locking (Whac-A-Mole fix)', async ({ page }) => {
        // 1. Open 'חשבון' (Arithmetic) lesson
        // Find the specific card container using class and text
        const lessonCard = page.locator('.rounded-2xl').filter({ hasText: /חשבון/ }).first();
        await lessonCard.click();

        // 2. Set scores for the first parameter "הוצאת ציוד" (Equipment)
        // Scope search to this specific card and finding the row container
        const equipmentRow = lessonCard.locator('.space-y-2').filter({ hasText: /הוצאת ציוד/ });

        // Buttons are "מצויין 2", "סביר 1", "לשפר 0"
        const excellentBtn = equipmentRow.getByRole('button', { name: /מצויין/ }).first();
        const reasonableBtn = equipmentRow.getByRole('button', { name: /סביר/ }).first();

        // Set score to Excellent (2)
        await excellentBtn.click();

        // Verify Reasonable (1) is STILL enabled (Whac-A-Mole check)
        await expect(reasonableBtn).toBeEnabled();

        // Change score to Reasonable (1) - demonstrates ability to change score without locking
        await reasonableBtn.click();

        // Verify Excellent (2) is STILL enabled
        await expect(excellentBtn).toBeEnabled();

        // Set scores for other 2 parameters
        const participationRow = lessonCard.locator('.space-y-2').filter({ hasText: /השתתפות/ });
        await participationRow.getByRole('button', { name: /מצויין/ }).first().click();

        const assignmentsRow = lessonCard.locator('.space-y-2').filter({ hasText: /ביצוע מטלות/ });
        await assignmentsRow.getByRole('button', { name: /מצויין/ }).first().click();

        // 3. Click Send ('שלח')
        const sendButton = lessonCard.getByRole('button', { name: 'שלח' });
        await expect(sendButton).toBeVisible();
        await sendButton.click();

        // 4. Verify Pending State & Locking
        // "Send" should be gone, "Edit Report" ('ערוך דיווח') should appear
        const editButton = lessonCard.getByRole('button', { name: 'ערוך דיווח' });
        await expect(editButton).toBeVisible();

        // Verify buttons are now DISABLED
        // Note: Equipment row buttons should be disabled.
        await expect(excellentBtn).toBeDisabled();
        await expect(reasonableBtn).toBeDisabled();

        // 5. Unlock (Edit Mode)
        await editButton.click();

        // Verify "Save Changes" ('שמור שינויים') appears
        const saveButton = lessonCard.getByRole('button', { name: 'שמור שינויים' });
        await expect(saveButton).toBeVisible();

        // Verify buttons are ENABLED again
        await expect(excellentBtn).toBeEnabled();
        await expect(reasonableBtn).toBeEnabled();

        // 6. Save
        await saveButton.click();

        // Verify locked again
        await expect(editButton).toBeVisible();
        await expect(excellentBtn).toBeDisabled();
    });
});
