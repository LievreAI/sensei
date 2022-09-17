<?php
/**
 * File containing Sensei_Extensions class.
 *
 * @package Sensei\Admin
 * @since 2.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Sensei_Extensions class.
 *
 * Has functionality pertaining to the extension management system.
 *
 * @since 2.0.0
 */
final class Sensei_Extensions {
	const SENSEILMS_PRODUCTS_API_BASE_URL = 'https://senseilms.com/wp-json/senseilms-products/1.0';

	/**
	 * Instance of class.
	 *
	 * @var self
	 */
	private static $instance;

	/**
	 * Courses constructor. Prevents other instances from being created outside `Sensei_Extensions::instance()`.
	 */
	private function __construct() {}

	/**
	 * Initializes the class and adds all filters and actions related to the extension directory.
	 *
	 * @since 2.0.0
	 * @deprecated $$next-version$$
	 */
	public function init() {
		_deprecated_function( __METHOD__, '$$next-version$$' );
	}

	/**
	 * Enqueues admin scripts when needed on different screens.
	 *
	 * @since  2.0.0
	 * @access private
	 * @deprecated $$next-version$$
	 */
	public function enqueue_admin_assets() {
		_deprecated_function( __METHOD__, '$$next-version$$' );
	}

	/**
	 * Localize extensions script.
	 *
	 * @since 3.11.0
	 * @deprecated $$next-version$$
	 */
	private function localize_script() {
		_deprecated_function( __METHOD__, '$$next-version$$' );
	}

	/**
	 * Call API to get Sensei extensions.
	 *
	 * @since  2.0.0
	 * @since  3.1.0 The method is public.
	 *
	 * @param  string $type                  Product type ('plugin' or 'theme').
	 * @param  string $category              Category to fetch (null = all).
	 * @param  string $additional_query_args Additional query arguments.
	 * @return array
	 */
	public function get_extensions( $type = null, $category = null, $additional_query_args = [] ) {
		$extension_request_key = md5( $type . '|' . $category . '|' . determine_locale() . '|' . wp_json_encode( $additional_query_args ) . '|' . self::SENSEILMS_PRODUCTS_API_BASE_URL );
		$extensions            = get_transient( 'sensei_extensions_' . $extension_request_key );

		if ( false === $extensions ) {
			$url = add_query_arg(
				[
					array_merge(
						[
							'category' => $category,
							'type'     => $type,
							'lang'     => determine_locale(),
						],
						$additional_query_args
					),
				],
				self::SENSEILMS_PRODUCTS_API_BASE_URL . '/search'
			);

			$raw_extensions = wp_safe_remote_get( $url );
			if ( ! is_wp_error( $raw_extensions ) ) {
				$json       = json_decode( wp_remote_retrieve_body( $raw_extensions ) );
				$extensions = isset( $json->products ) ? $json->products : [];

				set_transient( 'sensei_extensions_' . $extension_request_key, $extensions, DAY_IN_SECONDS );
			}
		}

		if ( empty( $extensions ) ) {
			return [];
		}

		if ( 'plugin' === $type ) {
			return $this->add_installed_extensions_properties( $extensions );
		}

		return $extensions;
	}

	/**
	 * Map the extensions array, adding the installed properties.
	 *
	 * @param array $extensions Extensions.
	 *
	 * @return array Extensions with installed properties.
	 */
	private function add_installed_extensions_properties( $extensions ) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';

		$installed_plugins = get_plugins();

		$wccom_subscriptions = [];

		if ( class_exists( 'WC_Helper_Options' ) ) {
			$wccom_subscriptions = WC_Helper::get_subscriptions();
		}

		// Includes installed version, whether it has update and WC.com metadata.
		$extensions = array_map(
			function( $extension ) use ( $installed_plugins, $wccom_subscriptions ) {
				$extension->is_installed = isset( $installed_plugins[ $extension->plugin_file ] );
				$extension->is_activated = $extension->is_installed && is_plugin_active( $extension->plugin_file );

				if ( $extension->is_installed ) {
					$extension->installed_version = $installed_plugins[ $extension->plugin_file ]['Version'];
					$extension->has_update        = isset( $extension->version ) && version_compare( $extension->version, $extension->installed_version, '>' );
				}

				if ( isset( $extension->wccom_product_id ) ) {
					foreach ( $wccom_subscriptions as $wccom_subscription ) {
						if ( (int) $extension->wccom_product_id === $wccom_subscription['product_id'] ) {
							$extension->wccom_expired = $wccom_subscription['expired'];

							if ( ! $extension->wccom_expired ) {
								break;
							}
						}
					}
				}

				return $extension;
			},
			$extensions
		);

		return $extensions;
	}

	/**
	 * Get extensions page layout.
	 *
	 * @since 3.11.0
	 *
	 * @return array
	 */
	public function get_layout() {
		$transient_key = implode(
			'_',
			[
				'sensei_extensions_layout',
				determine_locale(),
				md5( self::SENSEILMS_PRODUCTS_API_BASE_URL ),
			]
		);

		$extension_layout = get_transient( $transient_key );

		if ( false === $extension_layout ) {
			$raw_layout = wp_safe_remote_get(
				add_query_arg(
					[ 'lang' => determine_locale() ],
					self::SENSEILMS_PRODUCTS_API_BASE_URL . '/layout'
				)
			);

			if ( ! is_wp_error( $raw_layout ) ) {
				$json             = json_decode( wp_remote_retrieve_body( $raw_layout ) );
				$extension_layout = isset( $json->layout ) ? $json->layout : [];
				set_transient( $transient_key, $extension_layout, DAY_IN_SECONDS );
			}
		}

		return $extension_layout;
	}

	/**
	 * Get installed Sensei plugins.
	 *
	 * @param bool $only_woo Only include WooCommerce.com extensions.
	 *
	 * @return array
	 */
	public function get_installed_plugins( $only_woo = false ) {
		$extensions = $this->get_extensions( 'plugin' );

		return array_filter(
			$extensions,
			function( $extension ) use ( $only_woo ) {
				if (
					empty( $extension->installed_version )
					|| ( $only_woo && empty( $extension->wccom_product_id ) )
				) {
					return false;
				}

				return true;
			}
		);
	}

	/**
	 * Adds the menu item for the Home page.
	 *
	 * @since  $$next-version$$
	 *
	 * @access private
	 * @deprecated $$next-version$$
	 */
	public function add_admin_menu_item() {
		_deprecated_function(__METHOD__, '$$next-version$$');
	}

	/**
	 * Renders the extensions page.
	 *
	 * @since  2.0.0
	 * @access private
	 * @deprecated $$next-version$$
	 */
	public function render() {
		_deprecated_function(__METHOD__, '$$next-version$$');
	}

	/**
	 * Fetches an instance of the class.
	 *
	 * @return self
	 */
	public static function instance() {
		if ( ! self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

}
