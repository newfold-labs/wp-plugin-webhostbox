<?php
/**
 * Register Admin page and features.
 *
 * @package WPPluginWebHostBox
 */

namespace WebHostBox;

/**
 * \WebHostBox\Admin
 */
final class Admin {

	/**
	 * Register functionality using WordPress Actions.
	 */
	public function __construct() {
		/* Add Page to WordPress Admin Menu. */
		\add_action( 'admin_menu', array( __CLASS__, 'page' ) );
		/* Load Page Scripts & Styles. */
		\add_action( 'admin_enqueue_scripts', array( __CLASS__, 'assets' ) );
		/* Add Links to WordPress Plugins list item. */
		\add_filter( 'plugin_action_links_wp-plugin-webhostbox/wp-plugin-webhostbox.php', array( __CLASS__, 'actions' ) );
		/* Add inline style to hide subnav link */
		\add_action( 'admin_head', array( __CLASS__, 'admin_nav_style' ) );
		/* Add runtime for data store */
		\add_filter( 'newfold_runtime', array( __CLASS__, 'add_to_runtime' ) );
		if ( isset( $_GET['page'] ) && strpos( filter_input( INPUT_GET, 'page', FILTER_UNSAFE_RAW ), 'webhostbox' ) >= 0 ) { // phpcs:ignore
			\add_action( 'admin_footer_text', array( __CLASS__, 'add_brand_to_admin_footer' ) );
		}
	}

	/**
	 * Add to runtime
	 *
	 * @param array $sdk - runtime properties from module.
	 *
	 * @return array
	 */
	public static function add_to_runtime( $sdk ) {
		include WEBHOSTBOX_PLUGIN_DIR . 'inc/Data.php';
		return array_merge( $sdk, Data::runtime() );
	}

	/**
	 * Subpages to register with add_submenu_page().
	 *
	 * Order or array items determines menu order.
	 *
	 * @return array
	 */
	public static function subpages() {
		return array(
			'webhostbox#/home'        => __( 'Home', 'wp-plugin-webhostbox' ),
			'webhostbox#/marketplace' => __( 'Marketplace', 'wp-plugin-webhostbox' ),
			'webhostbox#/settings'    => __( 'Settings', 'wp-plugin-webhostbox' ),
		);
	}

	/**
	 * Add inline script to admin screens
	 *  - hide extra link in subnav
	 */
	public static function admin_nav_style() {
		echo '<style>';
		echo 'li#toplevel_page_webhostbox a.toplevel_page_webhostbox div.wp-menu-image.svg { transition: fill 0.15s; background-size: 24px auto !important; }';
		echo 'li#toplevel_page_webhostbox a.toplevel_page_webhostbox div.wp-menu-name {
		    padding: 8px 2px 8px 29px;
			font-size: 14px;
		}';
		echo 'li#toplevel_page_webhostbox a.toplevel_page_webhostbox div.wp-menu-image img {
			padding: 6px 8px 0px;
			opacity: 1 !important;
			display: block;
		}';
		echo 'ul#adminmenu a.toplevel_page_webhostbox.wp-has-current-submenu:after, ul#adminmenu>li#toplevel_page_webhostbox.current>a.current:after { border-right-color: #fff !important; }';
		echo 'li#toplevel_page_webhostbox > ul > li.wp-first-item { display: none !important; }';
		echo '#wp-toolbar #wp-admin-bar-webhostbox-coming_soon .ab-item { padding: 0; }';
		echo '</style>';
	}

	/**
	 * Add WordPress Page to Appearance submenu.
	 *
	 * @return void
	 */
	public static function page() {
		$iconurl = WEBHOSTBOX_PLUGIN_URL . 'assets/svg/whb-dark.svg';
		$iconurl = \add_query_arg( 'ver', WEBHOSTBOX_PLUGIN_VERSION, $iconurl );

		\add_menu_page(
			__( 'WebHostBox', 'wp-plugin-webhostbox' ),
			__( 'WebHostBox', 'wp-plugin-webhostbox' ),
			'manage_options',
			'webhostbox',
			array( __CLASS__, 'render' ),
			$iconurl,
			0
		);

		// Add subpages to the menu
		foreach ( self::subpages() as $route => $title ) {
			\add_submenu_page(
				'webhostbox',
				$title,
				$title,
				'manage_options',
				$route,
				array( __CLASS__, 'render' )
			);
		}
	}

	/**
	 * Render DOM element for React to load onto.
	 *
	 * @return void
	 */
	public static function render() {
		global $wp_version;
		echo '<!-- WebHostBox -->' . PHP_EOL;

		if ( version_compare( $wp_version, '5.4', '>=' ) ) {
			echo '<div id="wpwhb-app" class="wpwhb wpwhb_app"></div>' . PHP_EOL;
			// Render bootstrap containers for modules that need portals
			// Only enabled features get their containers rendered
			$features_with_portals = array( 'performance', 'coming-soon' );
			foreach ( $features_with_portals as $feature ) {
				if ( function_exists( 'NewfoldLabs\WP\Module\Features\isEnabled' ) &&
					\NewfoldLabs\WP\Module\Features\isEnabled( $feature ) ) {
					$portal_id = 'nfd-' . $feature . '-portal';
					echo '<div id="' . esc_attr( $portal_id ) . '" style="display:none"></div>' . PHP_EOL;
				}
			}
		} else {
			// fallback messaging for WordPress older than 5.4.
			echo '<div id="wpwhb-app" class="wpwhb wpwhb_app">' . PHP_EOL;
			echo '<header class="wpwhb-header" style="min-height: 90px; padding: 1rem; margin-bottom: 1.5rem;"><div class="wpwhb-header-inner"><div class="wpwhb-logo-wrap">' . PHP_EOL;
			echo '<img src="' . esc_url( WEBHOSTBOX_PLUGIN_URL . 'assets/svg/webhostbox.svg' ) . '" alt=" logo" />' . PHP_EOL;
			echo '</div></div></header>' . PHP_EOL;
			echo '<div class="wrap">' . PHP_EOL;
			echo '<div class="card" style="margin-left: 20px;"><h2 class="title">' . esc_html__( 'Please update to a newer WordPress version.', 'wp-plugin-webhostbox' ) . '</h2>' . PHP_EOL;
			echo '<p>' . esc_html__( 'There are new WordPress components which this plugin requires in order to render the interface.', 'wp-plugin-webhostbox' ) . '</p>' . PHP_EOL;
			echo '<p><a href="' . esc_url( admin_url( 'update-core.php' ) ) . '" class="button component-button is-primary button-primary" variant="primary">' . esc_html__( 'Please update now', 'wp-plugin-webhostbox' ) . '</a></p>' . PHP_EOL;
			echo '</div></div></div>' . PHP_EOL;
		}

		echo '<!-- /WebHostBox -->' . PHP_EOL;
	}

	/**
	 * Load Page Scripts & Styles.
	 *
	 * @return void
	 */
	public static function assets() {
		$asset_file = WEBHOSTBOX_BUILD_DIR . '/index.asset.php';
		if ( is_readable( $asset_file ) ) {
			$asset = include_once $asset_file;
		} else {
			return;
		}

		\wp_register_script(
			'webhostbox-script',
			WEBHOSTBOX_BUILD_URL . '/index.js',
			array_merge( $asset['dependencies'], array( 'newfold-features', 'nfd-runtime' ) ),
			$asset['version'],
			true
		);

		\wp_register_style(
			'webhostbox-style',
			WEBHOSTBOX_BUILD_URL . '/index.css',
			array( 'wp-components' ),
			$asset['version']
		);
		$screen = get_current_screen();
		if ( false !== strpos( $screen->id, 'webhostbox' ) ) {
			\wp_enqueue_script( 'webhostbox-script' );
			\wp_enqueue_style( 'webhostbox-style' );
		}
	}

	/**
	 * Add Links to WordPress Plugins list item for WebHostBox.
	 *
	 * @param  array $actions - array of action links for Plugin row item.
	 * @return array
	 */
	public static function actions( $actions ) {
		return array_merge(
			array(
				'overview' => '<a href="' . \apply_filters( 'nfd_build_url', admin_url( 'admin.php?page=webhostbox#/home' ) ) . '">' . __( 'Home', 'wp-plugin-webhostbox' ) . '</a>',
				'settings' => '<a href="' . \apply_filters( 'nfd_build_url', admin_url( 'admin.php?page=webhostbox#/settings' ) ) . '">' . __( 'Settings', 'wp-plugin-webhostbox' ) . '</a>',
			),
			$actions
		);
	}

	/**
	 * Filter WordPress Admin Footer Text "Thank you for creating with..."
	 *
	 * @param string $footer_text footer text.
	 * @return string
	 */
	public static function add_brand_to_admin_footer( $footer_text ) {
		$wordpress_url  = '<a href="' . apply_filters( 'nfd_build_url', 'https://wordpress.org/', array( 'source' => 'webhostbox_admin_footer' ) ) . '">WordPress</a>';
		$webhostbox_url = '<a href="#">WebHostBox</a>';

		// translators: %1$s is the WordPress URL, %2$s is the WebHostBox URL.
		$footer_text = sprintf( \__( 'Thank you for creating with %1$s and %2$s', 'wp-plugin-webhostbox' ), $wordpress_url, $webhostbox_url );

		return $footer_text;
	}
} // END \WebHostBox\Admin
