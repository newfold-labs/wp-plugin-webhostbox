<?php
/**
 * Widgets bootstrap file
 *
 * @package WPPluginWebHostBox
 */

namespace WebHostBox\Widgets;

use WebHostBox\Widgets\SitePreview;

require_once WEBHOSTBOX_PLUGIN_DIR . '/inc/widgets/SitePreview.php';

/* Start up the Dashboards */
if ( is_admin() ) {
	new SitePreview();
}
