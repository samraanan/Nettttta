
import { test, expect } from '@playwright/test';

test.describe('Weekly Schedule Editor (Admin)', () => {
    test.beforeEach(async ({ page }) => {
        // Go to Admin view
        await page.goto('http://localhost:5173/admin');
    });

    test('should allow editing the weekly template', async ({ page }) => {
        // 1. Open Editor
        const editBtn = page.getByRole('button', { name: /ערוך מערכת/ });
        await expect(editBtn).toBeVisible();
        await editBtn.click();

        // 2. Verify Modal
        await expect(page.getByText('עריכת מערכת שבועית')).toBeVisible();

        // 3. Switch to Tuesday (Day index 2 -> "שלישי")
        await page.getByText('שלישי').click();

        // 4. Add a specific lesson
        const addBtn = page.getByRole('button', { name: /הוסף שיעור/ });
        await addBtn.click();

        // 5. Change subject of the last lesson to 'ספורט'
        // We find the last select in the list
        const selects = page.locator('select');
        const lastSelect = selects.last();
        await lastSelect.selectOption({ label: 'ספורט' });

        // 6. Close Modal
        const closeBtn = page.locator('button > svg.lucide-x').first(); // Close icon
        await closeBtn.click();

        // 7. Verify Data Persisted (re-open)
        await editBtn.click();
        await page.getByText('שלישי').click();

        // Check if last select is effectively Sports
        // Note: state persistence depends on mock/firebase. In E2E with real firebase, ensure test env is handled.
        // For now, we verified the UI flow works.
        const reloadedSelect = page.locator('select').last();
        await expect(reloadedSelect).toHaveValue('ספורט');
    });
});
