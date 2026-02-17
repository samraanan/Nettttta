
import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/admin');
    });

    test('should see all verified lessons and be able to edit them without unlocking', async ({ page }) => {
        // 1. Open a lesson (Arithmetic - default t1)
        const lessonCard = page.locator('.rounded-2xl').filter({ hasText: /חשבון/ }).first();
        await lessonCard.click();

        // 2. Check Permissions
        // Admin should see scoring controls.
        // Logic: `readOnly` is false for admin.

        // Find a score button
        const equipmentRow = lessonCard.locator('.space-y-2').filter({ hasText: /הוצאת ציוד/ });
        const excellentBtn = equipmentRow.getByRole('button', { name: /מצויין/ }).first();

        // Verify enabled
        await expect(excellentBtn).toBeEnabled();

        // 3. Make a change
        await excellentBtn.click();
        await expect(excellentBtn).toHaveClass(/bg-emerald-500/);

        // 4. Verify "Approve" button logic
        // Admins are "Lesson Teacher" (role === 'admin' check in isLessonTeacher).
        // So they should see "Approve" buttons if not verified, or "Edit" if verified?
        const approveButton = lessonCard.getByRole('button', { name: /אשר/ });
        if (await approveButton.isVisible()) {
            await approveButton.click();
        }

        // Now valid "Verified" state.
        // Admin should still be able to click buttons directly.
        const reasonableBtn = equipmentRow.getByRole('button', { name: /סביר/ }).first();
        await reasonableBtn.click();

        // Verify it changed
        await expect(reasonableBtn).toHaveClass(/bg-yellow-500/);
    });
});
