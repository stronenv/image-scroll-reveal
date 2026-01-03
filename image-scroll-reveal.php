<?php
/**
 * Plugin Name:       Image Scroll Reveal
 * Description:       Create stunning scroll-triggered image reveal animations with customizable directions and fade effects.
 * Version:           0.1.0
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Author:            stronenv, WordPress Telex
 * Author URI:        https://github.com/stronenv/image-scroll-reveal
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       image-scroll-reveal
 *
 * @package ImageScrollReveal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function image_scroll_reveal_image_scroll_reveal_block_init() {
	register_block_type( __DIR__ . '/build/' );
}
add_action( 'init', 'image_scroll_reveal_image_scroll_reveal_block_init' );
