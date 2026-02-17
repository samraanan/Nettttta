
import { test, expect } from '@playwright/test';

test.describe('Data Persistence', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/student');
    });

    // 2. Open 'אנגלית' (English) - assume unused by other tests if possible, or re-use logic
    const lessonCard = page.locator('.rounded-2xl').filter({ hasText: 'אנגלית' }).first();
    await lessonCard.click();

    // 3. Rate "Participation" (השתתפות) -> Excellent (2)
    const participationRow = lessonCard.locator('.space-y-2').filter({ hasText: /השתתפות/ });
    const scoreBtn = participationRow.getByRole('button', { name: /מצויין/ }).first();
    await scoreBtn.click();

    // Verify selected class (bg-emerald-500)
    await expect(scoreBtn).toHaveClass(/bg-emerald-500/);

    // 4. Reload Page
    await page.reload();

    // 5. Verify Persistence
    // Need to re-open card?
    // Card state (open/close) might NOT persist (component state), but valid check.
    // Navigate back to Student role first (roles might reset to default or persist? default is likely t1 or null).
    // App default state: `role` state in App.jsx?
    // Wait, App.jsx uses URL routing or state? `window.location.search`.
    // SimulationBar updates URL `?role=student`.
    // So reload SHOULD keep the role if URL persists.

    // Check if we are still student.
    // If URL has ?role=student, App parses it.
    // Let's verify URL parameter logic if implemented, otherwise re-select.
    // SimulationBar implementation: `window.history.pushState` or just `setRole`?
    // Code says `onRoleChange`... let's check App.jsx next step if needed. 
    // Assuming simple reload might reset role if it's just React State without URL sync.
    // Implementation Plan mentioned "Updates window.location.search".
    // So it should persist.

    const lessonCardReloaded = page.locator('.rounded-2xl').filter({ hasText: 'אנגלית' }).first();

    // If card is closed by default, click to open
    // "Openness" is local state `isOpen` initialized to `isLessonTeacher || isStudent`.
    // Since we are loading as student (if URL works), it should Auto-Expand?
    // Code: `const [isOpen, setIsOpen] = useState(isLessonTeacher || isStudent);`
    // So yes, it should be open if we are student.

    // Check if score is still selected
    const participationRowReloaded = lessonCardReloaded.locator('.space-y-2').filter({ hasText: /השתתפות/ });
    const scoreBtnReloaded = participationRowReloaded.getByRole('button', { name: /מצויין/ }).first();

    await expect(scoreBtnReloaded).toHaveClass(/bg-emerald-500/);
});
});
