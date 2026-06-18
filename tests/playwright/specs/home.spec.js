import { test, expect } from '@playwright/test';
import { auth, a11y, utils } from '../helpers';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await auth.navigateToAdminPage(page, 'admin.php?page=webhostbox#/home');
  });

  test('Is Accessible', async ({ page }) => {
    // Wait for the home page to load - check for the main app container and home page class
    await page.waitForSelector('#wpwhb-app-rendered', { timeout: 10000 });
    await page.waitForSelector('.wpwhb-page-home', { timeout: 10000 });
    
    // Run accessibility test with WCAG 2.1 AA standards (includes color contrast)
    await a11y.checkA11y(page, '.wpwhb-app-body');
  });

 
  test('Home page UI elements are present and visible', async ({ page }) => {
    // Header
    const header = page.locator(
      '.wpwhb-app-home-container .wpwhb-app-home-header'
    );
    await expect(header).toBeVisible();

    // Main content
    const content = page.locator('.wpwhb-app-home-content');
    await expect(content).toBeVisible();

    // Settings section
    const settings = page.locator('.wpwhb-app-home-settings');
    await expect(settings).toBeVisible();

    // Settings actions (scoped inside settings)
    await expect(
      settings.locator('.wpwhb-app-home-settings-action')
    ).toBeVisible();

    await expect(
      settings.locator('.wpwhb-app-home-performance-action')
    ).toBeVisible();

    await expect(
      settings.locator('.wpwhb-app-home-marketplace-action')
    ).toBeVisible();

  });

});
