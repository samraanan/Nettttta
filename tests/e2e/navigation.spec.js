
import { test, expect } from '@playwright/test';
import { format, subDays, addDays } from 'date-fns';
import { he } from 'date-fns/locale';

test.describe('Navigation & Date Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/student');
    });

    test('should navigate between days correctly', async ({ page }) => {
        // 1. Check Today's Date Display
        const today = new Date();
        const todayFormat = format(today, 'EEEE, d בMMMM', { locale: he });
        // Expect logic: "יום חמישי, 18 בינואר"
        // Since we don't know the exact machine date, we construct the string dynamically.
        await expect(page.getByText(todayFormat)).toBeVisible();

        // 2. Click Next Day (Left Arrow in RTL)
        // The arrows: Right arrow (>) is prev, Left arrow (<) is next in component code.
        // "p-2 -ml-2 ... ChevronLeft" is Next.
        const nextBtn = page.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') });
        await nextBtn.click();

        const tomorrow = addDays(today, 1);
        const tomorrowFormat = format(tomorrow, 'EEEE, d בMMMM', { locale: he });
        await expect(page.getByText(tomorrowFormat)).toBeVisible();

        // 3. Click "Return to Today" ('חזור להיום') logic check
        // If not today, "חזור להיום" is visible.
        const returnTodayBtn = page.getByText('חזור להיום');
        await expect(returnTodayBtn).toBeVisible();
        await returnTodayBtn.click();

        // Verify back to today
        await expect(page.getByText(todayFormat)).toBeVisible();
        await expect(returnTodayBtn).not.toBeVisible();
    });
});
