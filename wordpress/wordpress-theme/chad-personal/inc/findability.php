<?php
/**
 * Findability: rel=me identity links, feed discovery, staging guard, sitemap hygiene.
 *
 * @package Chad_Personal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ---- 1. rel="me" identity links in <head> ---- */

/**
 * Profiles that represent the same person (IndieWeb rel=me).
 *
 * @return string[]
 */
function chad_personal_rel_me_urls() {
	return apply_filters(
		'chad_personal_rel_me_urls',
		array(
			'https://x.com/chadunderwood',
			'https://github.com/chadunderwood',
			'https://pprpros.substack.com',
		)
	);
}

function chad_personal_rel_me_head() {
	foreach ( chad_personal_rel_me_urls() as $url ) {
		printf( "<link rel=\"me\" href=\"%s\" />\n", esc_url( $url ) );
	}
}
add_action( 'wp_head', 'chad_personal_rel_me_head', 7 );
