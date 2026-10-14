<?php
/**
 * Head SEO: meta description, canonical, Open Graph, Twitter cards.
 * Hand-rolled (no plugin). Disable via the `chad_personal_seo_enabled` filter
 * if an SEO plugin is installed later, to avoid duplicate output.
 *
 * @package Chad_Personal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Site tagline (ported from Astro site.json).
 *
 * @return string
 */
function chad_personal_seo_tagline() {
	$tagline = get_bloginfo( 'description' );
	if ( '' === trim( (string) $tagline ) ) {
		$tagline = 'Personal site — writing, work, and a small corner of the internet.';
	}
	return apply_filters( 'chad_personal_seo_tagline', $tagline );
}

/**
 * Whether the current request is the /essays/ archive.
 *
 * @return bool
 */
function chad_personal_is_essays_archive() {
	return (bool) get_query_var( 'chad_essays_archive' ) || ( is_home() && ! is_front_page() );
}

/**
 * Trim text to ~155 chars on a word boundary.
 *
 * @param string $text Raw text/HTML.
 * @param int    $max  Max length.
 * @return string
 */
function chad_personal_seo_trim( $text, $max = 155 ) {
	$text = trim( preg_replace( '/\s+/u', ' ', wp_strip_all_tags( strip_shortcodes( (string) $text ) ) ) );
	if ( mb_strlen( $text ) <= $max ) {
		return $text;
	}
	$cut = mb_substr( $text, 0, $max - 1 );
	$sp  = mb_strrpos( $cut, ' ' );
	if ( false !== $sp && $sp > 80 ) {
		$cut = mb_substr( $cut, 0, $sp );
	}
	return rtrim( $cut, " ,.;:—-" ) . '…';
}

/**
 * Default share image (1200x630 PNG in theme assets).
 *
 * @return array{url:string,width:int,height:int}
 */
function chad_personal_seo_default_image() {
	return array(
		'url'    => CHAD_PERSONAL_URI . '/assets/img/og-default.png',
		'width'  => 1200,
		'height' => 630,
	);
}

/**
 * Collect SEO data for the current request.
 *
 * @return array
 */
function chad_personal_seo_data() {
	$site  = get_bloginfo( 'name' );
	$data  = array(
		'title'       => $site,
		'description' => chad_personal_seo_tagline(),
		'url'         => home_url( '/' ),
		'type'        => 'website',
		'image'       => chad_personal_seo_default_image(),
		'published'   => '',
		'modified'    => '',
	);
	$paged = max( 1, (int) get_query_var( 'paged' ) );

	if ( is_front_page() ) {
		$data['title'] = 'Chad Underwood — ' . chad_personal_seo_tagline();
	} elseif ( chad_personal_is_essays_archive() ) {
		$data['title']       = 'Essays — ' . $site;
		$data['description'] = 'Essays and notes by Chad Underwood.';
		$data['url']         = $paged > 1 ? home_url( user_trailingslashit( 'essays/page/' . $paged ) ) : home_url( '/essays/' );
	} elseif ( is_singular() ) {
		$post          = get_queried_object();
		$data['title'] = wp_strip_all_tags( get_the_title( $post ) );
		$data['url']   = get_permalink( $post );
		$desc          = has_excerpt( $post ) ? $post->post_excerpt : $post->post_content;
		$desc          = chad_personal_seo_trim( $desc );
		if ( '' !== $desc ) {
			$data['description'] = $desc;
		}
		if ( 'post' === $post->post_type ) {
			$data['type']      = 'article';
			$data['published'] = get_the_date( DATE_W3C, $post );
			$data['modified']  = get_the_modified_date( DATE_W3C, $post );
		}
		if ( has_post_thumbnail( $post ) ) {
			$img = wp_get_attachment_image_src( get_post_thumbnail_id( $post ), 'full' );
			if ( $img ) {
				$data['image'] = array(
					'url'    => $img[0],
					'width'  => (int) $img[1],
					'height' => (int) $img[2],
				);
			}
		}
	} elseif ( is_archive() ) {
		$data['title'] = wp_strip_all_tags( get_the_archive_title() ) . ' — ' . $site;
		$arch_desc     = chad_personal_seo_trim( get_the_archive_description() );
		if ( '' !== $arch_desc ) {
			$data['description'] = $arch_desc;
		}
		$data['url'] = '';
	} else {
		$data['url'] = '';
	}

	return apply_filters( 'chad_personal_seo_data', $data );
}

/**
 * Print head tags.
 */
function chad_personal_seo_head() {
	if ( ! apply_filters( 'chad_personal_seo_enabled', true ) || is_404() || is_search() ) {
		return;
	}
	$d = chad_personal_seo_data();

	echo "\n<!-- chad-personal seo -->\n";
	printf( '<meta name="description" content="%s">' . "\n", esc_attr( $d['description'] ) );

	// Core rel_canonical covers singular views; add it for the essays archive.
	if ( ! is_singular() && $d['url'] ) {
		printf( '<link rel="canonical" href="%s">' . "\n", esc_url( $d['url'] ) );
	}

	printf( '<meta property="og:site_name" content="%s">' . "\n", esc_attr( get_bloginfo( 'name' ) ) );
	printf( '<meta property="og:locale" content="%s">' . "\n", esc_attr( str_replace( '-', '_', get_bloginfo( 'language' ) ) ) );
	printf( '<meta property="og:type" content="%s">' . "\n", esc_attr( $d['type'] ) );
	printf( '<meta property="og:title" content="%s">' . "\n", esc_attr( $d['title'] ) );
	printf( '<meta property="og:description" content="%s">' . "\n", esc_attr( $d['description'] ) );
	if ( $d['url'] ) {
		printf( '<meta property="og:url" content="%s">' . "\n", esc_url( $d['url'] ) );
	}
	printf( '<meta property="og:image" content="%s">' . "\n", esc_url( $d['image']['url'] ) );
	if ( $d['image']['width'] ) {
		printf( '<meta property="og:image:width" content="%d">' . "\n", (int) $d['image']['width'] );
		printf( '<meta property="og:image:height" content="%d">' . "\n", (int) $d['image']['height'] );
	}
	if ( 'article' === $d['type'] ) {
		printf( '<meta property="article:published_time" content="%s">' . "\n", esc_attr( $d['published'] ) );
		printf( '<meta property="article:modified_time" content="%s">' . "\n", esc_attr( $d['modified'] ) );
	}
	echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
	echo '<meta name="twitter:site" content="@chadunderwood">' . "\n";
	echo '<meta name="twitter:creator" content="@chadunderwood">' . "\n";
	printf( '<meta name="twitter:title" content="%s">' . "\n", esc_attr( $d['title'] ) );
	printf( '<meta name="twitter:description" content="%s">' . "\n", esc_attr( $d['description'] ) );
	printf( '<meta name="twitter:image" content="%s">' . "\n", esc_url( $d['image']['url'] ) );
}
add_action( 'wp_head', 'chad_personal_seo_head', 5 );

/**
 * Document title for the /essays/ archive (core would otherwise use the
 * first post's title, since there is no page_for_posts page).
 *
 * @param array $parts Title parts.
 * @return array
 */
function chad_personal_essays_title_parts( $parts ) {
	if ( chad_personal_is_essays_archive() ) {
		$parts['title'] = __( 'Essays', 'chad-personal' );
	}
	return $parts;
}
add_filter( 'document_title_parts', 'chad_personal_essays_title_parts' );
