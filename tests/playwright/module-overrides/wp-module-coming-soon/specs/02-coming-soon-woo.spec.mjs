import { test, expect } from '@playwright/test';
import {
  auth,
  newfold,
  installWooCommerce,
  navigateToWpAdmin,
  navigateToSettings,
  verifyWooCommerceComingSoonActive,
  verifyWooCommerceComingSoonInactive,
  enableComingSoon,
  disableComingSoon,
  verifySitePreviewWarningHidden,
} from '../helpers';

// Use environment variable to resolve plugin helpers
const pluginId = process.env.PLUGIN_ID || 'bluehost';

// Cache WooCommerce support check (set in beforeAll, used in tests)
let wooSupported;
let wooSkipMessage;

// Shared across the suite: WooCommerce install, options and login are all one-time costs,
// and every WP-CLI call boots WordPress in the container.
let page;

test.describe('Coming Soon with WooCommerce', () => {
  test.describe.configure({ mode: 'serial', timeout: 120000 });

  test.beforeAll(async ({ browser }) => {
    // Container WP-CLI plus a first admin load: generous so a slow Docker host does not
    // abort setup and force the whole serial group to retry.
    test.setTimeout(180000);

    wooSupported = await newfold.supportsWoo();
    if (!wooSupported) {
      wooSkipMessage = await newfold.getSkipMessage('woocommerce');
      return;
    }

    await installWooCommerce();
    await newfold.primeComingSoonState(true);

    const context = await browser.newContext();
    page = await context.newPage();
    await auth.loginToWordPress(page);
    await navigateToWpAdmin(page);
  });

  // Intentionally no WooCommerce teardown: this is the last coming-soon suite to
  // run (see numeric filename prefix), and deactivating/uninstalling
  // WooCommerce here fatals other plugins in the shared brand-plugin test
  // environment that assume WooCommerce stays active once installed, which
  // in turn breaks wp-login.php for every test that runs afterward.
  test.afterAll(async () => {
    await page?.context().close();
  });

  test("Replace our admin bar site status badge with WooCommerce's when active", async () => {
    // Skip if WooCommerce is not supported in this environment
    test.skip(!wooSupported, wooSkipMessage);

    // Visit settings page: the badge is rendered on every admin screen
    await navigateToSettings(page, pluginId);

    // Verify WooCommerce coming soon is active
    await verifyWooCommerceComingSoonActive(page);
  });

  test('Our plugin settings should toggle WooCommerce admin bar badge', async () => {
    // Skip if WooCommerce is not supported in this environment
    test.skip(!wooSupported, wooSkipMessage);

    // Disable coming soon via dashboard widget
    await disableComingSoon(page);

    // WooCommerce badge should now show "Live"
    await verifyWooCommerceComingSoonInactive(page);

    // Re-enable coming soon via dashboard widget
    await enableComingSoon(page);

    // WooCommerce badge should now show "Coming soon"
    const comingSoonBadge = page.locator('#wp-toolbar .woocommerce-site-status-badge-coming-soon a.ab-item');
    await expect(comingSoonBadge).toBeVisible();
    await expect(comingSoonBadge).toContainText('Coming soon');
  });

  test('Hide our site preview notice when WooCommerce is active', async () => {
    // Skip if WooCommerce is not supported in this environment
    test.skip(!wooSupported, wooSkipMessage);

    // Verify site preview warning is hidden (helper visits the frontend)
    await verifySitePreviewWarningHidden(page);
  });
});
