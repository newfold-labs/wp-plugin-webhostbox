<?php
/**
 * Handle updates for version 1.0.1
 *
 * Sync the plugin's auto-update settings with the new, WordPress Core options.
 *
 * @package WPPluginWebHostBox
 */

// Migrate any existing legacy coming soon setting.
if ( 'true' === get_option( 'mm_coming_soon', 'false' ) ) {
	update_option( 'nfd_coming_soon', 'true' );
}
