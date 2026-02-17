
import { test, expect } from '@playwright/test';

test.describe('Admin Subject Manager', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/admin');
    });

    test('should allow managing subjects', async ({ page }) => {
        // 1. Open Editor
        await page.getByRole('button', { name: /ערוך מערכת/ }).click();

        // 2. Open Subject Manager
        await page.getByRole('button', { name: /ניהול מקצועות/ }).click();

        // 3. Verify Modal
        await expect(page.getByText('ניהול רשימת מקצועות')).toBeVisible();

        // 4. Add new subject
        const input = page.getByPlaceholder('שם מקצוע חדש...');
        await input.fill('רובוטיקה');

        // Click Add button (plus icon)
        // Find the button next to input
        const addBtn = page.locator('button:has(svg.lucide-plus)').last();
        await addBtn.click();

        // 5. Verify added to list
        await expect(page.getByText('רובוטיקה')).toBeVisible();

        // 6. Close Manager
        const closeBtn = page.locator('button:has(svg.lucide-x)').last(); // The specific close for this modal
        await closeBtn.click();

        // 7. Verify new subject appears in dropdown
        // (Assuming first day is active and has lessons)
        const selects = page.locator('select');
        await expect(selects.first()).toContainText('רובוטיקה');
    });
});
