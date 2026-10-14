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

/* ---- 2. RSS feed discovery ---- */

/**
 * Replace core feed links (which add "» Feed" titles and comment feeds)
 * with exactly one site feed link on every page.
 */
function chad_personal_feed_links_setup() {
	remove_action( 'wp_head', 'feed_links', 2 );
	remove_action( 'wp_head', 'feed_links_extra', 3 );
}
add_action( 'after_setup_theme', 'chad_personal_feed_links_setup', 20 );

function chad_personal_feed_link_head() {
	printf(
		"<link rel=\"alternate\" type=\"application/rss+xml\" title=\"%s\" href=\"%s\" />\n",
		esc_attr( get_bloginfo( 'name' ) ),
		esc_url( get_feed_link() )
	);
}
add_action( 'wp_head', 'chad_personal_feed_link_head', 2 );

/**
 * /essays/feed/ → 301 to /feed/ (the site feed is the essays feed).
 */
function chad_personal_essays_feed_rewrite() {
	add_rewrite_rule( '^essays/feed/?$', 'index.php?chad_essays_feed=1', 'top' );
	add_rewrite_rule( '^essays/feed/(rss2|rss|atom|rdf)/?$', 'index.php?chad_essays_feed=1', 'top' );
}
add_action( 'init', 'chad_personal_essays_feed_rewrite' );

function chad_personal_essays_feed_query_var( $vars ) {
	$vars[] = 'chad_essays_feed';
	return $vars;
}
add_filter( 'query_vars', 'chad_personal_essays_feed_query_var' );

function chad_personal_essays_feed_redirect() {
	if ( get_query_var( 'chad_essays_feed' ) ) {
		wp_safe_redirect( get_feed_link(), 301 );
		exit;
	}
}
add_action( 'template_redirect', 'chad_personal_essays_feed_redirect', 1 );

/**
 * Self-heal: flush once if the essays feed rule is missing.
 */
function chad_personal_maybe_flush_feed_rules() {
	$rules = get_option( 'rewrite_rules' );
	if ( is_array( $rules ) && ! isset( $rules['^essays/feed/?$'] ) ) {
		flush_rewrite_rules( false );
	}
}
add_action( 'init', 'chad_personal_maybe_flush_feed_rules', 99 );

/* ---- 4. Staging guard (host/env gated; apex unaffected) ---- */

/**
 * True on any non-production host: staging.* subdomains, or a
 * WP_ENVIRONMENT_TYPE of staging/development/local.
 *
 * @return bool
 */
function chad_personal_is_staging() {
	$host = strtolower( (string) wp_parse_url( home_url( '/' ), PHP_URL_HOST ) );
	$is   = ( 0 === strpos( $host, 'staging.' ) ) || in_array( wp_get_environment_type(), array( 'staging', 'development', 'local' ), true );
	return (bool) apply_filters( 'chad_personal_is_staging', $is );
}

function chad_personal_staging_header() {
	if ( chad_personal_is_staging() && ! headers_sent() ) {
		header( 'X-Robots-Tag: noindex, nofollow', true );
	}
}
add_action( 'send_headers', 'chad_personal_staging_header' );

function chad_personal_staging_robots_meta( $robots ) {
	if ( ! chad_personal_is_staging() ) {
		return $robots;
	}
	unset( $robots['max-image-preview'], $robots['index'], $robots['follow'] );
	$robots['noindex']  = true;
	$robots['nofollow'] = true;
	return $robots;
}
add_filter( 'wp_robots', 'chad_personal_staging_robots_meta', 99 );

function chad_personal_staging_sitemaps( $enabled ) {
	return chad_personal_is_staging() ? false : $enabled;
}
add_filter( 'wp_sitemaps_enabled', 'chad_personal_staging_sitemaps' );

/* ---- 5. Sitemap hygiene: posts and pages only ---- */

/**
 * Drop taxonomy sitemaps (1-URL category sitemap, ~110 thin single-use tags).
 */
function chad_personal_sitemap_taxonomies( $taxonomies ) {
	return array();
}
add_filter( 'wp_sitemaps_taxonomies', 'chad_personal_sitemap_taxonomies' );
