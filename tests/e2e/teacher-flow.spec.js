
import { test, expect } from '@playwright/test';

test.describe('Teacher Verification Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/teacher/arithmetic');
    });

    test('should allow teacher to approve and then edit a verified lesson', async ({ page }) => {
        // 1. Open 'חשבון' (Arithmetic) lesson
        const lessonCard = page.locator('.rounded-2xl').filter({ hasText: /חשבון/ }).first();
        await lessonCard.click();

        // 2. Set scores (Teacher Rating)
        // Find the first parameter "הוצאת ציוד" (Equipment)
        const equipmentRow = lessonCard.locator('.space-y-2').filter({ hasText: /הוצאת ציוד/ });

        // Teacher sets "Excellent" (2)
        await equipmentRow.getByRole('button', { name: /מצויין/ }).first().click();

        // 3. Approve ('אשר')
        const approveButton = lessonCard.getByRole('button', { name: /אשר/ });
        await expect(approveButton).toBeVisible();
        await approveButton.click();

        // 4. Verify Verified State
        // Status icon should be checkmark
        // "Edit" ('ערוך') button should appear
        const editButton = lessonCard.getByRole('button', { name: 'ערוך' });
        await expect(editButton).toBeVisible();

        // Verify scores are LOCKED (buttons disabled)
        // Note: In Verified state, `readOnly` is true unless `isEditMode`.
        await expect(equipmentRow.getByRole('button', { name: /מצויין/ }).first()).toBeDisabled();

        // 5. Enter Edit Mode
        await editButton.click();

        // Verify "Save Changes" ('שמור שינויים') appears
        const saveButton = lessonCard.getByRole('button', { name: 'שמור שינויים' });
        await expect(saveButton).toBeVisible();

        // Verify buttons are UNLOCKED
        await expect(equipmentRow.getByRole('button', { name: /מצויין/ }).first()).toBeEnabled();

        // Change score to 'Reasonable' (1)
        await equipmentRow.getByRole('button', { name: /סביר/ }).first().click();

        // 6. Save
        await saveButton.click();

        // Verify locked again
        await expect(editButton).toBeVisible();
        await expect(equipmentRow.getByRole('button', { name: /סביר/ }).first()).toBeDisabled();

        // Verify status is still verified (Checkmark icon visible)
        // Searching for CheckCircle2 icon (lucide) is hard by text.
        // We can check the class or visually if needed, but the "Edit" button presence confirms verified state logic.
    });
});
