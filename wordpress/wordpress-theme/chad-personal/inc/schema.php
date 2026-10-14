<?php
/**
 * JSON-LD structured data: WebSite + Person (all pages), BlogPosting (essays).
 *
 * @package Chad_Personal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Person node.
 *
 * @return array
 */
function chad_personal_schema_person() {
	$same_as = apply_filters(
		'chad_personal_same_as',
		array(
			'https://x.com/chadunderwood',
			'https://pprpros.substack.com',
			'https://x.com/thepprpros',
			'https://github.com/chadunderwood',
		)
	);
	return array(
		'@type'  => 'Person',
		'@id'    => home_url( '/#person' ),
		'name'   => 'Chad Underwood',
		'url'    => home_url( '/' ),
		'sameAs' => array_values( $same_as ),
	);
}

/**
 * Print JSON-LD graph.
 */
function chad_personal_schema_head() {
	if ( ! apply_filters( 'chad_personal_seo_enabled', true ) || is_404() ) {
		return;
	}
	$graph = array(
		array(
			'@type'       => 'WebSite',
			'@id'         => home_url( '/#website' ),
			'url'         => home_url( '/' ),
			'name'        => get_bloginfo( 'name' ),
			'description' => chad_personal_seo_tagline(),
			'inLanguage'  => get_bloginfo( 'language' ),
			'publisher'   => array( '@id' => home_url( '/#person' ) ),
		),
		chad_personal_schema_person(),
	);

	if ( is_singular( 'post' ) ) {
		$post  = get_queried_object();
		$d     = chad_personal_seo_data();
		$url   = get_permalink( $post );
		$graph[] = array(
			'@type'            => 'BlogPosting',
			'@id'              => $url . '#article',
			'headline'         => wp_strip_all_tags( get_the_title( $post ) ),
			'description'      => $d['description'],
			'datePublished'    => get_the_date( DATE_W3C, $post ),
			'dateModified'     => get_the_modified_date( DATE_W3C, $post ),
			'author'           => array( '@id' => home_url( '/#person' ) ),
			'publisher'        => array( '@id' => home_url( '/#person' ) ),
			'image'            => array(
				'@type'  => 'ImageObject',
				'url'    => $d['image']['url'],
				'width'  => $d['image']['width'],
				'height' => $d['image']['height'],
			),
			'mainEntityOfPage' => array(
				'@type' => 'WebPage',
				'@id'   => $url,
			),
			'isPartOf'         => array( '@id' => home_url( '/#website' ) ),
			'inLanguage'       => get_bloginfo( 'language' ),
		);
	}

	$json = array(
		'@context' => 'https://schema.org',
		'@graph'   => $graph,
	);
	echo '<script type="application/ld+json">' . wp_json_encode( $json, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG ) . "</script>\n";
}
add_action( 'wp_head', 'chad_personal_schema_head', 6 );
