/**
 * Load @wordpress/e2e-test-utils-playwright (CommonJS) from ESM helpers.
 *
 * Playwright's test loader can treat bare ESM imports of this package as native
 * modules, which throws "exports is not defined in ES module scope". createRequire
 * loads the published CJS build correctly (including when helpers are imported
 * from vendor module specs via dynamic import).
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { Admin, PageUtils } = require('@wordpress/e2e-test-utils-playwright');

export { Admin, PageUtils };
