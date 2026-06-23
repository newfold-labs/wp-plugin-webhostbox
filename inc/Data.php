<?php
/**
 * All data retrieval and saving happens from this file.
 *
 * @package WPPluginWebHostBox
 */

namespace WebHostBox;

/**
 * \WPPluginWebHostBox\Data
 * This class does not have a constructor to get instantiated, just static methods.
 */
final class Data {
	/**
	 * Data loaded onto window.NewfoldRuntime
	 *
	 * @return array
	 */
	public static function runtime() {
		global $webhostbox_module_container;
		$runtime = array(
			'plugin' => array(
				'url'     => WEBHOSTBOX_BUILD_URL,
				'version' => WEBHOSTBOX_PLUGIN_VERSION,
				'assets'  => WEBHOSTBOX_PLUGIN_URL . 'assets/',
				'brand'   => $webhostbox_module_container->plugin()->brand,
			),
		);
		return $runtime;
	}
}
