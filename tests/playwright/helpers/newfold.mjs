/**
 * Newfold/WebHostBox Plugin-Specific Test Helpers
 * 
 * Utilities for testing Newfold Labs modules and WebHostBox-specific functionality.
 * Includes capabilities, coming soon, dashboard widgets, plugin-specific features,
 * and version compatibility checks for third-party plugin integrations.
 */

import { expect } from '@playwright/test';
import wordpress from './wordpress.mjs';
import utils from './utils.mjs';

/**
 * Plugin support requirements
 * Update these when plugin requirements change
 */
const PLUGIN_REQUIREMENTS = {
  // https://wordpress.org/plugins/woocommerce/
  // minWp tracks WooCommerce's own "Requires at least" (11.1.0 → WP 7.0). On older WP,
  // `wp plugin install woocommerce` is rejected outright, so the Woo suites must skip.
  // Check with: curl -s https://api.wordpress.org/plugins/info/1.0/woocommerce.json | jq .requires
  woocommerce: { minWp: '7.0.0', minPhp: '7.4.0' },
  // https://wordpress.org/plugins/jetpack/
  jetpack: { minWp: '6.9.0', minPhp: '7.2.0' },
  // https://wordpress.org/plugins/wordpress-seo/
  yoast: { minWp: '6.8.0', minPhp: '7.4.0' },
  // https://github.com/newfold-labs/yith-wonder/blob/master/style.css
  wonderTheme: { minWp: '6.5.0', minPhp: '7.0.0' },
};

// ============================================================================
// VERSION COMPARISON UTILITIES
// ============================================================================

/**
 * Compare two semantic version strings
 * @param {string} a - First version (e.g., "6.8.0")
 * @param {string} b - Second version (e.g., "6.7.0")
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 */
function compareVersions(a, b) {
  const partsA = String(a).split('.').map(Number);
  const partsB = String(b).split('.').map(Number);
  
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }
  return 0;
}

/**
 * Check if version satisfies minimum requirement (>=)
 * @param {string} version - Current version
 * @param {string} minVersion - Minimum required version
 * @returns {boolean}
 */
function satisfiesMin(version, minVersion) {
  return compareVersions(version, minVersion) >= 0;
}

// ============================================================================
// ENVIRONMENT VERSION DETECTION
// ============================================================================

/** Cached environment versions */
let _envVersions = null;

/**
 * Get WordPress and PHP versions from the environment
 * Caches the result to avoid repeated WP-CLI calls
 * @returns {Promise<{wpVersion: string, phpVersion: string}>}
 */
async function getEnvironmentVersions() {
  if (_envVersions) {
    return _envVersions;
  }
  
  const [wpVersion, phpVersion] = await Promise.all([
    wordpress.wpCli('core version'),
    wordpress.wpCli('eval "echo PHP_VERSION;"'),
  ]);

  _envVersions = {
    wpVersion: wpVersion.trim(),
    phpVersion: phpVersion.trim(),
  };
  
  utils.fancyLog(`📦 Environment: WP ${_envVersions.wpVersion}, PHP ${_envVersions.phpVersion}`);
  
  return _envVersions;
}

/**
 * Clear cached environment versions (useful for testing)
 */
function clearVersionCache() {
  _envVersions = null;
}

// ============================================================================
// THIRD-PARTY PLUGIN SUPPORT CHECKS
// Based on plugin requirements
//
// Example usage:
// const wooSupported = await newfold.supportsWoo();		
// test.skip(!wooSupported, await newfold.getSkipMessage('woocommerce'));
//
// ============================================================================

/**
 * Check if the current environment supports a specific plugin
 * @param {'woocommerce' | 'jetpack' | 'yoast' | 'wonderTheme'} pluginKey - Plugin identifier
 * @returns {Promise<boolean>}
 */
async function supportsPlugin(pluginKey) {
  const requirements = PLUGIN_REQUIREMENTS[pluginKey];
  if (!requirements) {
    throw new Error(`Unknown plugin: ${pluginKey}. Available: ${Object.keys(PLUGIN_REQUIREMENTS).join(', ')}`);
  }
  
  const { wpVersion, phpVersion } = await getEnvironmentVersions();
  
  return satisfiesMin(wpVersion, requirements.minWp) && 
         satisfiesMin(phpVersion, requirements.minPhp);
}

/** Cached WooCommerce "Requires at least" lookup (null when unavailable). */
let _wooWpRequirement;

/**
 * WooCommerce's current "Requires at least" WordPress version, from the plugin API.
 *
 * WooCommerce raises this over time while the CI matrix pins older WordPress. On a WP
 * below it, `wp plugin install woocommerce` is refused outright, so reading the live
 * value keeps the Woo suites skipping (instead of failing) without hand-editing
 * PLUGIN_REQUIREMENTS after every WooCommerce release.
 *
 * @returns {Promise<string|null>} e.g. '7.0', or null when the API is unreachable
 */
async function getWooCommerceWpRequirement() {
  if (undefined !== _wooWpRequirement) {
    return _wooWpRequirement;
  }

  try {
    const response = await fetch(
      'https://api.wordpress.org/plugins/info/1.0/woocommerce.json',
      { signal: AbortSignal.timeout(5000) },
    );
    const { requires } = await response.json();
    _wooWpRequirement = requires || null;
  } catch (error) {
    // Offline or blocked: fall back to the static PLUGIN_REQUIREMENTS floor.
    _wooWpRequirement = null;
  }

  return _wooWpRequirement;
}

/**
 * The WordPress version WooCommerce needs here: the higher of our static floor and
 * WooCommerce's own current requirement.
 *
 * @returns {Promise<string>}
 */
async function getWooCommerceMinWp() {
  const staticMin = PLUGIN_REQUIREMENTS.woocommerce.minWp;
  const declared = await getWooCommerceWpRequirement();

  return declared && !satisfiesMin(staticMin, declared) ? declared : staticMin;
}

/**
 * Check if current environment supports WooCommerce.
 * Combines our PHP/WP floor with WooCommerce's live "Requires at least".
 *
 * @returns {Promise<boolean>}
 */
async function supportsWoo() {
  if (!(await supportsPlugin('woocommerce'))) {
    return false;
  }

  const { wpVersion } = await getEnvironmentVersions();

  return satisfiesMin(wpVersion, await getWooCommerceMinWp());
}

/**
 * Check if current environment supports Jetpack
 *
 * @returns {Promise<boolean>}
 */
async function supportsJetpack() {
  return supportsPlugin('jetpack');
}

/**
 * Check if current environment supports Yoast SEO
 *
 * @returns {Promise<boolean>}
 */
async function supportsYoast() {
  return supportsPlugin('yoast');
}

/**
 * Check if current environment supports Wonder Theme
 *
 * @returns {Promise<boolean>}
 */
async function supportsWonderTheme() {
  // theme support is determined the same way as a plugin
  return supportsPlugin('wonderTheme');
}

/**
 * Get a skip message for unsupported plugin
 * @param {'woocommerce' | 'jetpack' | 'yoast' | 'wonderTheme'} pluginKey
 * @returns {Promise<string>}
 */
async function getSkipMessage(pluginKey) {
  const requirements = PLUGIN_REQUIREMENTS[pluginKey];
  const { wpVersion, phpVersion } = await getEnvironmentVersions();
  const minWp =
    'woocommerce' === pluginKey ? await getWooCommerceMinWp() : requirements.minWp;

  return `Skipping: ${pluginKey} requires WP >=${minWp} & PHP >=${requirements.minPhp}, ` +
         `current: WP ${wpVersion} & PHP ${phpVersion}`;
}

// ============================================================================
// WOOCOMMERCE / COMPANION PLUGIN MANAGEMENT
// ============================================================================

/**
 * Companion plugins known to call WooCommerce classes (e.g. WC_Data_Store) unconditionally
 * on bootstrap. If WooCommerce is removed while one of these is still active, it fatals on
 * the next WP-Cron tick and can take the rest of a test run down with it. Deactivated
 * alongside WooCommerce so that failure mode can't cascade regardless of upstream fixes.
 */
const WOOCOMMERCE_DEPENDENT_PLUGINS = ['wp-plugin-payments-shipping'];

/**
 * @param {string} slug - Plugin slug
 * @returns {Promise<boolean>} true if `wp plugin is-active <slug>` exits 0
 *
 * --skip-plugins: `is-active` only needs the active_plugins option, not a full plugin
 * bootstrap. Without this flag, checking a plugin that's *currently fataling on load*
 * (e.g. one of the WOOCOMMERCE_DEPENDENT_PLUGINS right after WooCommerce is removed)
 * makes the check itself fail, which wordpress.wpCli() reports as a non-zero/error
 * result — indistinguishable from "not active". That masked exactly the case this
 * helper exists to catch: the plugin was still active and still fataling, but looked
 * "inactive" to this check, so it never got deactivated.
 */
async function isPluginActive(slug) {
  return (await wordpress.wpCli(`plugin is-active ${slug} --skip-plugins`)) === 0;
}

/** WP-CLI user for `eval` calls that need capability checks to resolve. */
const wpCliUser = () => process.env.WP_ADMIN_USERNAME || 'admin';

/**
 * Mirror nfd_coming_soon into WooCommerce site-visibility options (wp-cli).
 * The coming-soon module only syncs when woocommerce_* options already exist.
 *
 * Done in a single `eval` because every `wp` invocation boots WordPress in the wp-env
 * container, which costs several seconds each on a plugin stack this size.
 */
async function syncWooCommerceVisibilityOptions() {
  await wordpress.wpCli(
    `eval '${[
      '$cs = wp_validate_boolean( get_option( "nfd_coming_soon" ) );',
      'update_option( "woocommerce_store_pages_only", "no" );',
      'update_option( "woocommerce_coming_soon", $cs ? "yes" : "no" );',
    ].join(' ')}' --user=${wpCliUser()}`,
    { failOnNonZeroExit: false },
  );
}

/**
 * Set the brand and WooCommerce coming-soon options in one WP-CLI call, and return the
 * gates WooCommerce checks before rendering its site-visibility badge.
 *
 * @param {boolean} [comingSoon] Desired coming soon state
 * @returns {Promise<Object|null>} Parsed gate values, or null when the call failed
 */
async function primeComingSoonState(comingSoon = true) {
  const value = comingSoon ? '1' : '0';
  const php = [
    `$cs = ${value};`,
    'update_option( "mm_coming_soon", $cs );',
    'update_option( "nfd_coming_soon", $cs );',
    'update_option( "woocommerce_store_pages_only", "no" );',
    'update_option( "woocommerce_coming_soon", $cs ? "yes" : "no" );',
    'echo wp_json_encode( array(',
    '"woo_active" => class_exists( "woocommerce" ),',
    '"nfd_coming_soon" => get_option( "nfd_coming_soon" ),',
    '"woocommerce_coming_soon" => get_option( "woocommerce_coming_soon" ),',
    '"woocommerce_store_pages_only" => get_option( "woocommerce_store_pages_only" ),',
    '"badge_feature" => get_option( "woocommerce_feature_site_visibility_badge_enabled", "yes" ),',
    '"manage_woocommerce" => current_user_can( "manage_woocommerce" ),',
    ') );',
  ].join(' ');

  const raw = await wordpress.wpCli(`eval '${php}' --user=${wpCliUser()}`, {
    failOnNonZeroExit: false,
  });

  if (wordpress.isWpCliFailure(raw)) {
    utils.fancyLog(`⚠ Could not prime coming soon state: ${raw}`, 200, 'yellow');
    return null;
  }

  // wp-env can wrap command output with its own status lines, so pick out the JSON payload.
  const json = String(raw).match(/\{[\s\S]*\}/);

  try {
    const gates = JSON.parse(json[0]);
    utils.fancyLog(`🔎 Woo badge gates: ${JSON.stringify(gates)}`, 250, 'gray');
    return gates;
  } catch (error) {
    utils.fancyLog(`⚠ Unexpected coming soon state output: ${raw}`, 200, 'yellow');
    return null;
  }
}

/**
 * Wait for WooCommerce's admin bar site-visibility badge.
 *
 * WooCommerce renders this node server-side on the same request as the page
 * (ComingSoonAdminBarBadge, admin_bar_menu priority 31), so it either arrives with the
 * document or never does. A long timeout only delays a certain failure — use
 * `logWooCommerceBadgeDiagnostics()` to find out which gate rejected it.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} [timeoutMs]
 */
async function waitForWooCommerceAdminBarBadge(page, timeoutMs = 15000) {
  await page.waitForSelector('#wp-admin-bar-woocommerce-site-visibility-badge', {
    state: 'attached',
    timeout: timeoutMs,
  });
}

/**
 * Install and activate WooCommerce plugin (WP-CLI only; callers own navigation).
 * No-op when WooCommerce is already active, so suites can call this per run without
 * paying for a reinstall. Callers that need to know whether WooCommerce is expected to
 * work in the current environment first should check `supportsWoo()` above.
 *
 * Reports the outcome instead of swallowing it: a silent failure here used to surface
 * much later as an unexplained wait for WooCommerce's admin bar badge. Callers should
 * skip (not fail) when `ok` is false, since no WooCommerce assertion can pass without it.
 *
 * @returns {Promise<{ok: boolean, reason?: string}>}
 */
async function installWooCommerce() {
  if (await isWooCommerceActive()) {
    return { ok: true };
  }

  const result = await wordpress.wpCli('plugin install woocommerce --activate', {
    failOnNonZeroExit: false,
  });

  if (await isWooCommerceActive()) {
    await syncWooCommerceVisibilityOptions();
    return { ok: true };
  }

  const { wpVersion, phpVersion } = await getEnvironmentVersions();
  const detail = wordpress.formatWpCliResult(result);
  const reason =
    `Skipping: WooCommerce could not be activated on WP ${wpVersion} / PHP ${phpVersion} ` +
    `(needs WP >=${await getWooCommerceMinWp()}). WP-CLI said: ${detail}`;

  utils.fancyLog(`⚠ ${reason}`, 400, 'yellow');

  return { ok: false, reason };
}

/**
 * @returns {Promise<boolean>} true if WooCommerce is active
 */
async function isWooCommerceActive() {
  return isPluginActive('woocommerce');
}

/**
 * Uninstall WooCommerce, and any companion plugin known to fatal without it active.
 * Runs `deactivate --uninstall` first; if the plugin is still active (e.g. uninstall step
 * failed), runs `plugin deactivate` so later tests do not run with WooCommerce still active.
 * Repeats up to `maxAttempts` (no unbounded recursion).
 */
async function uninstallWooCommerce() {
  const maxAttempts = 3;
  for (let i = 0; i < maxAttempts; i++) {
    if (!(await isWooCommerceActive())) {
      break;
    }
    await wordpress.wpCli('plugin deactivate woocommerce --uninstall');
    if (!(await isWooCommerceActive())) {
      break;
    }
    await wordpress.wpCli('plugin deactivate woocommerce');
  }
  if (await isWooCommerceActive()) {
    utils.fancyLog(
      'WooCommerce is still active after multiple deactivate attempts; later tests may fail.',
      100,
      'yellow',
    );
  }

  for (const slug of WOOCOMMERCE_DEPENDENT_PLUGINS) {
    if (await isPluginActive(slug)) {
      // --skip-plugins here too: we want this plugin out of active_plugins even
      // though (especially because) loading it currently fatals.
      await wordpress.wpCli(`plugin deactivate ${slug} --skip-plugins`);
    }
  }
}

/**
 * Set plugin capabilities (WebHostBox-specific functionality)
 * 
 * @param {Object} capabilities - Capabilities object
 * @param {number} expiration - Expiration time in seconds (default: 3600)
 * @returns {Promise<void>}
 */
async function setCapability(capabilitiesJSON, expiration = 3600) {
  const capabilities = { ...capabilitiesJSON };

  // Default canAccessAI only when omitted — callers can pass false to simulate no AI access.
  // Without this key, capabilities are discarded by wp-module-data.
  // see https://github.com/newfold-labs/wp-module-data/pull/285
  if (capabilities.canAccessAI === undefined) {
    capabilities.canAccessAI = true;
  }

  utils.fancyLog(`🔐 Setting capabilities: ${JSON.stringify(capabilities)}`);
  const expiry = Math.floor( new Date().getTime() / 1000.0 ) + expiration;

  // Use Promise.all to ensure both operations complete before returning
  await Promise.all([
    wordpress.wpCli(`option update _transient_nfd_site_capabilities '${ JSON.stringify(
      capabilities
    ) }' --format=json`),
    wordpress.wpCli(`option update _transient_timeout_nfd_site_capabilities ${ expiry }`)
  ]);
}

/**
 * Clear all plugin capabilities
 */
async function clearCapabilities() {
  // Clear all capability options
  return await wordpress.wpCli('option delete _transient_nfd_site_capabilities');
}

/**
 * Clear installer work that could leak into later Playwright projects.
 *
 * The installer cron remains enabled. On its next run it will observe an empty
 * queue, mark the task manager complete, and unschedule itself.
 */
async function clearInstallerQueues() {
  const options = [
    'nfd_module_installer_plugin_install_queue',
    'nfd_module_installer_plugin_activation_queue',
    'nfd_module_installer_plugins_init_status',
  ];
  const encodedOptions = Buffer.from(
    JSON.stringify(options),
    'utf8',
  ).toString('base64');

  // --skip-plugins/--skip-themes: only need the options API. Loading the full
  // plugin stack can fatal (e.g. a half-installed companion plugin) and then this
  // cleanup itself cannot run — exactly when it is most needed.
  return await wordpress.wpCli(
    `eval '$options = json_decode( base64_decode( "${encodedOptions}" ), true ); foreach ( $options as $option ) { delete_option( $option ); } $remaining = array_values( array_filter( $options, static function ( $option ) { return false !== get_option( $option, false ); } ) ); if ( $remaining ) { WP_CLI::error( "Failed to clear installer options: " . implode( ", ", $remaining ) ); }' --skip-plugins --skip-themes`,
    { failOnNonZeroExit: true },
  );
}

/**
 * Log the current capabilities option from the database
 * 
 * @returns {Promise<Object>} The current capabilities object
 */
async function logCapabilities() {
  const result = await wordpress.wpCli('option get _transient_nfd_site_capabilities --format=json');
  
  utils.fancyLog('📋 Current capabilities:');
  
  try {
    const capabilities = JSON.parse(result);

    if (typeof capabilities === 'object' && capabilities !== null) {
      Object.entries(capabilities).forEach(([key, value]) => {
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        utils.fancyLog(`- ${key}: ${valueStr}`, 100, 'gray', '            ');
      });
    } else {
      utils.fancyLog(`- ${String(capabilities)}`, 100, 'gray', '            ');
    }

    return capabilities;
  } catch (error) {
    // Fallback if JSON parsing fails
    utils.fancyLog(`${result}`, 100, 'gray', '            ');
    return result;
  }
}

/**
 * Check if coming soon is enabled
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if coming soon is enabled
 */
async function isComingSoonEnabled(page) {
  const response = await page.request.get('/wp-json/wp/v2/options/nfd_coming_soon');
  if (response.ok()) {
    const data = await response.json();
    return data === '1' || data === true;
  }
  return false;
}

/**
 * Enable or disable coming soon mode
 * 
 * @param {boolean} enabled - Whether to enable coming soon
 */
async function setComingSoon(enabled) {
  return await wordpress.setOption('nfd_coming_soon', enabled);
}

/**
 * Click coming soon toggle button
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {boolean} enable - Whether to enable (true) or disable (false) coming soon
 */
async function toggleComingSoon(page, enable = true) {
  const buttonSelector = enable 
    ? '[data-cy="nfd-coming-soon-enable"]' 
    : '[data-cy="nfd-coming-soon-disable"]';
  
  const button = page.locator(buttonSelector);
  await button.click();
  
  // Wait for the toggle to take effect
  await page.waitForTimeout(1000);
}

/**
 * Verify coming soon status in site preview widget
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {boolean} expectedEnabled - Expected coming soon status
 */
async function verifyComingSoonStatus(page, expectedEnabled) {
  const statusText = expectedEnabled ? 'Not Live' : 'Live';
  const bodyText = expectedEnabled ? 'Coming Soon' : 'website is live';
  const dataAttribute = expectedEnabled ? 'true' : 'false';
  
  // Check status text
  await expect(page.locator('.iframe-preview-status')).toContainText(statusText);
  
  // Check body text
  await expect(page.locator('.site-preview-widget-body')).toContainText(bodyText);
  
  // Check data attribute
  await expect(page.locator('.site-preview-widget-body')).toHaveAttribute('data-coming-soon', dataAttribute);
}

/**
 * Verify widget link attributes
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} linkSelector - CSS selector for the link
 * @param {string} expectedText - Expected link text
 * @param {string|RegExp} expectedHref - Expected href pattern
 * @param {Object} expectedAttributes - Expected attributes (optional)
 */
async function verifyWidgetLink(page, linkSelector, expectedText, expectedHref, expectedAttributes = {}) {
  const link = page.locator(linkSelector);
  
  // Check text content
  await expect(link).toContainText(expectedText);
  
  // Check href
  const href = await link.getAttribute('href');
  if (typeof expectedHref === 'string') {
    expect(href).toContain(expectedHref);
  } else {
    expect(href).toMatch(expectedHref);
  }
  
  // Check additional attributes
  for (const [attr, value] of Object.entries(expectedAttributes)) {
    await expect(link).toHaveAttribute(attr, value);
  }
}

/**
 * Wait for dashboard widgets to load
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {number} timeout - Timeout in milliseconds (default: 10000)
 */
async function waitForDashboardWidgets(page, timeout = 10000) {
  await page.waitForSelector('#dashboard-widgets-wrap', { timeout });
}

/**
 * Navigate to a specific plugin page in the WordPress admin.
 * Assumes the plugin ID is known.
 *
 * @param {import('@playwright/test').Page} page - Playwright page object.
 * @param {string} pluginId - The ID of the plugin (e.g., 'webhostbox').
 * @param {string} path - The path within the plugin (e.g., '#/home').
 */
async function navigateToPluginPage(page, pluginId, path = '') {
  await page.goto(`/wp-admin/admin.php?page=${pluginId}${path}`);
  await waitForWordPressAdmin(page);
}

/**
 * Wait for WordPress admin to be ready (helper function)
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function waitForWordPressAdmin(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('#wpadminbar'); // Wait for admin bar to be visible
}

/**
 * Get admin menu items
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<Array<string>>} List of admin menu item texts
 */
async function getAdminMenuItems(page) {
  return await page.$$eval('#adminmenu > li > a .wp-menu-text', (elements) =>
    elements.map((el) => el.textContent.trim())
  );
}

/**
 * Wait for WordPress REST API to be available
 * 
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
async function waitForRestAPI(page) {
  // Try to access a simple REST endpoint
  const response = await page.request.get('/wp-json/wp/v2/users/me');
  if (!response.ok()) {
    throw new Error('WordPress REST API not available');
  }
}

export default {
  // Version Utilities
  compareVersions,
  satisfiesMin,
  getEnvironmentVersions,
  clearVersionCache,
  
  // Plugin Support Checks
  PLUGIN_REQUIREMENTS,
  supportsPlugin,
  supportsWoo,
  getWooCommerceWpRequirement,
  getWooCommerceMinWp,
  supportsJetpack,
  supportsYoast,
  supportsWonderTheme,
  getSkipMessage,

  // WooCommerce / Companion Plugin Management
  installWooCommerce,
  syncWooCommerceVisibilityOptions,
  primeComingSoonState,
  waitForWooCommerceAdminBarBadge,
  isWooCommerceActive,
  uninstallWooCommerce,

  // Capabilities
  setCapability,
  clearCapabilities,
  clearInstallerQueues,
  logCapabilities,
  
  // Coming Soon
  isComingSoonEnabled,
  setComingSoon,
  toggleComingSoon,
  verifyComingSoonStatus,
  
  // Dashboard Widgets
  verifyWidgetLink,
  waitForDashboardWidgets,
  
  // Plugin Navigation
  navigateToPluginPage,
  
  // WordPress Admin
  waitForWordPressAdmin,
  getAdminMenuItems,
  waitForRestAPI,
};
