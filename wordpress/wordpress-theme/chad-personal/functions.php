<?php
/**
 * Chad Personal — classic PHP theme functions.
 *
 * @package Chad_Personal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'CHAD_PERSONAL_VERSION', '1.0.0' );
define( 'CHAD_PERSONAL_DIR', get_template_directory() );
define( 'CHAD_PERSONAL_URI', get_template_directory_uri() );

require_once CHAD_PERSONAL_DIR . '/inc/seo.php';
require_once CHAD_PERSONAL_DIR . '/inc/schema.php';
require_once CHAD_PERSONAL_DIR . '/inc/findability.php';

/**
 * Theme supports.
 */
function chad_personal_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support(
		'html5',
		array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script' )
	);
}
add_action( 'after_setup_theme', 'chad_personal_setup' );

/**
 * Enqueue design tokens, main CSS, and interaction scripts.
 */
function chad_personal_enqueue_assets() {
	$ver = CHAD_PERSONAL_VERSION;

	wp_enqueue_style(
		'chad-personal-tokens',
		CHAD_PERSONAL_URI . '/assets/css/tokens.css',
		array(),
		$ver
	);

	wp_enqueue_style(
		'chad-personal-main',
		CHAD_PERSONAL_URI . '/assets/css/main.css',
		array( 'chad-personal-tokens' ),
		$ver
	);

	// Inter from Google Fonts (matches Astro).
	wp_enqueue_style(
		'chad-personal-fonts',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;450;500;550;600;700&display=swap',
		array(),
		null
	);

	wp_enqueue_script(
		'chad-personal-theme',
		CHAD_PERSONAL_URI . '/assets/js/theme.js',
		array(),
		$ver,
		true
	);

	wp_enqueue_script(
		'chad-personal-dock',
		CHAD_PERSONAL_URI . '/assets/js/dock.js',
		array( 'chad-personal-theme' ),
		$ver,
		true
	);

	if ( is_front_page() ) {
		wp_enqueue_script(
			'chad-personal-bio',
			CHAD_PERSONAL_URI . '/assets/js/bio.js',
			array(),
			$ver,
			true
		);
	}
}
add_action( 'wp_enqueue_scripts', 'chad_personal_enqueue_assets' );

/**
 * Inline FOUC-prevention: apply stored theme before paint.
 */
function chad_personal_theme_boot_script() {
	?>
	<script>
	(function () {
		try {
			var t = localStorage.getItem('cu:theme');
			document.documentElement.setAttribute('data-theme', t === 'light' ? 'light' : 'dark');
		} catch (e) {
			document.documentElement.setAttribute('data-theme', 'dark');
		}
	})();
	</script>
	<?php
}
add_action( 'wp_head', 'chad_personal_theme_boot_script', 1 );

/* -------------------------------------------------------------------------
 * Permalinks: Essays archive at /essays/, singles at /essays/%postname%/
 * ----------------------------------------------------------------------- */

/**
 * Custom query var so /essays/ can be routed to the posts index.
 */
function chad_personal_query_vars( $vars ) {
	$vars[] = 'chad_essays_archive';
	return $vars;
}
add_filter( 'query_vars', 'chad_personal_query_vars' );

/**
 * Point the posts index (blog) at /essays/.
 * Singles use permalink structure /essays/%postname%/.
 */
function chad_personal_essays_rewrite() {
	add_rewrite_rule( '^essays/?$', 'index.php?chad_essays_archive=1', 'top' );
	add_rewrite_rule( '^essays/page/([0-9]+)/?$', 'index.php?chad_essays_archive=1&paged=$matches[1]', 'top' );
}
add_action( 'init', 'chad_personal_essays_rewrite' );

/**
 * Self-heal: flush once if the /essays/ archive rule is missing from the
 * stored rewrite rules (e.g. theme files updated without re-activation).
 */
function chad_personal_maybe_flush_essays_rules() {
	$rules = get_option( 'rewrite_rules' );
	if ( is_array( $rules ) && ! isset( $rules['^essays/?$'] ) ) {
		flush_rewrite_rules( false );
	}
}
add_action( 'init', 'chad_personal_maybe_flush_essays_rules', 99 );

/**
 * Force post permalinks to /essays/%postname%/ even if WP setting differs.
 */
function chad_personal_post_link( $permalink, $post ) {
	if ( 'post' !== $post->post_type ) {
		return $permalink;
	}
	return home_url( user_trailingslashit( 'essays/' . $post->post_name ) );
}
add_filter( 'post_link', 'chad_personal_post_link', 10, 2 );

/**
 * Treat /essays/ as the posts index (is_home) so home.php loads.
 */
function chad_personal_pre_get_posts( $query ) {
	if ( is_admin() || ! $query->is_main_query() ) {
		return;
	}
	if ( $query->get( 'chad_essays_archive' ) ) {
		$query->set( 'post_type', 'post' );
		$query->set( 'chad_essays_archive', 1 );
		$query->is_home       = true;
		$query->is_posts_page = true;
		$query->is_archive    = false;
		$query->is_singular   = false;
		$query->is_page       = false;
	}
}
add_action( 'pre_get_posts', 'chad_personal_pre_get_posts' );

/**
 * Prefer home.php for the essays archive rewrite.
 */
function chad_personal_template_include( $template ) {
	if ( get_query_var( 'chad_essays_archive' ) ) {
		$home = locate_template( 'home.php' );
		if ( $home ) {
			return $home;
		}
	}
	return $template;
}
add_filter( 'template_include', 'chad_personal_template_include' );

/**
 * On theme activate: set permalink structure + flush rewrites.
 * Does not invent credentials; only updates WP options locally.
 */
function chad_personal_flush_rewrites() {
	$desired = '/essays/%postname%/';
	if ( get_option( 'permalink_structure' ) !== $desired ) {
		update_option( 'permalink_structure', $desired );
	}
	chad_personal_essays_rewrite();
	flush_rewrite_rules();
}
add_action( 'after_switch_theme', 'chad_personal_flush_rewrites' );

/**
 * On theme switch-away, flush leftover /essays/ rules.
 */
function chad_personal_deactivate_flush() {
	flush_rewrite_rules();
}
add_action( 'switch_theme', 'chad_personal_deactivate_flush' );

/* -------------------------------------------------------------------------
 * Helpers
 * ----------------------------------------------------------------------- */

/**
 * Dock / site URLs.
 *
 * @return array<string,string>
 */
function chad_personal_dock_urls() {
	$email = apply_filters( 'chad_personal_email', 'hello@chadunderwood.com' );

	$now  = get_page_by_path( 'now' );
	$work = get_page_by_path( 'work' );

	return array(
		'home'   => home_url( '/' ),
		'essays' => home_url( '/essays/' ),
		'work'   => $work ? get_permalink( $work ) : home_url( '/work/' ),
		'now'    => $now ? get_permalink( $now ) : home_url( '/now/' ),
		'email'  => 'mailto:' . $email,
		'x'      => 'https://x.com/chadunderwood',
		'github' => 'https://github.com/chadunderwood',
		'pprpros' => 'https://pprpros.substack.com',
	);
}

/**
 * Load bio JSON (filterable).
 *
 * @return array{lead:string,words:array}
 */
function chad_personal_get_bio() {
	$path = CHAD_PERSONAL_DIR . '/data/bio.json';
	$bio  = array(
		'lead'  => '',
		'words' => array(),
	);

	if ( file_exists( $path ) ) {
		$raw = file_get_contents( $path );
		if ( false !== $raw ) {
			$decoded = json_decode( $raw, true );
			if ( is_array( $decoded ) ) {
				$bio = $decoded;
			}
		}
	}

	return apply_filters( 'chad_personal_bio', $bio );
}

/**
 * Build bio lead HTML with hotspot buttons (longer triggers first).
 *
 * @param string $lead  Lead text.
 * @param array  $words Word definitions.
 * @return string
 */
function chad_personal_build_lead_html( $lead, $words ) {
	$html   = esc_html( $lead );
	$sorted = $words;
	usort(
		$sorted,
		static function ( $a, $b ) {
			return strlen( $b['trigger'] ) - strlen( $a['trigger'] );
		}
	);

	foreach ( $sorted as $w ) {
		$trigger = isset( $w['trigger'] ) ? $w['trigger'] : '';
		if ( '' === $trigger ) {
			continue;
		}
		$escaped_trigger = esc_html( $trigger );
		$pos             = mb_strpos( $html, $escaped_trigger );
		if ( false === $pos ) {
			continue;
		}
		$id     = esc_attr( $w['id'] );
		$secret = ! empty( $w['secret'] );
		$cls    = $secret ? 'hotspot hotspot--secret' : 'hotspot';
		$sec    = $secret ? '1' : '0';
		$mark   = sprintf(
			'<button type="button" class="%1$s" data-hotspot-id="%2$s" data-secret="%3$s" aria-expanded="false" aria-controls="panel-%2$s"><span class="hotspot-text">%4$s</span></button>',
			esc_attr( $cls ),
			$id,
			$sec,
			$escaped_trigger
		);
		$html = mb_substr( $html, 0, $pos ) . $mark . mb_substr( $html, $pos + mb_strlen( $escaped_trigger ) );
	}

	return $html;
}

/**
 * Resolve a bio href (site-relative) to a full URL.
 *
 * @param string|null $href Relative path or null.
 * @return string|null
 */
function chad_personal_bio_href( $href ) {
	if ( empty( $href ) ) {
		return null;
	}
	if ( 0 === strpos( $href, 'http://' ) || 0 === strpos( $href, 'https://' ) || 0 === strpos( $href, 'mailto:' ) ) {
		return $href;
	}
	return home_url( $href );
}

/**
 * Whether current request matches a dock path prefix.
 *
 * @param string $slug Path slug without slashes (e.g. essays, now).
 * @return bool
 */

/**
 * Inline SVG dock icons (ported from DockIcons.astro).
 * Essays uses the document glyph (formerly "writing").
 *
 * @param string $id Icon id: home|essays|work|now|cmd|email.
 */
function chad_personal_dock_icon( $id ) {
	switch ( $id ) {
		case 'home':
			echo '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#5B8DEF"/><path d="M8 15.2L16 9l8 6.2V24a1 1 0 0 1-1 1h-4.5v-5.5h-5V25H9a1 1 0 0 1-1-1v-8.8z" fill="#fff"/></svg>';
			break;
		case 'essays':
			echo '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#34C759"/><path d="M9.5 7.5h9.2L22.5 11.3V24.2A1.3 1.3 0 0 1 21.2 25.5H10.8A1.3 1.3 0 0 1 9.5 24.2V8.8A1.3 1.3 0 0 1 10.8 7.5H9.5z" fill="#fff"/><path d="M18.7 7.5v3.6h3.8L18.7 7.5z" fill="#D8F5E0"/><path d="M12.2 14.2h7.6M12.2 17.4h7.6M12.2 20.6h5" fill="none" stroke="#34C759" stroke-width="1.5" stroke-linecap="round"/></svg>';
			break;
		case 'work':
			echo '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#FF9F0A"/><path d="M11 12h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zm1.5-3h7a1 1 0 0 1 1 1v2h-9v-2a1 1 0 0 1 1-1z" fill="#fff"/></svg>';
			break;
		case 'now':
			echo '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#FF453A"/><circle cx="16" cy="16" r="8" fill="none" stroke="#fff" stroke-width="2"/><path d="M16 11v5.2l3.2 2" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
			break;
		case 'cmd':
			echo '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#8E8E93"/><text x="16" y="21" text-anchor="middle" font-size="13" font-family="system-ui,sans-serif" font-weight="700" fill="#fff">⌘</text></svg>';
			break;
		case 'email':
			echo '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#0A84FF"/><path d="M8.5 11h15a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm.8 1.4l6.7 5.1 6.7-5.1" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
			break;
	}
}

function chad_personal_is_dock_active( $slug ) {
	$path = trim( (string) wp_parse_url( $_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH ), '/' );
	$home = trim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( $home && 0 === strpos( $path, $home ) ) {
		$path = trim( substr( $path, strlen( $home ) ), '/' );
	}

	if ( 'home' === $slug ) {
		return ( '' === $path || 'index.php' === $path ) && is_front_page();
	}
	if ( 'essays' === $slug ) {
		return ( is_home() && ! is_front_page() ) || is_singular( 'post' ) || 0 === strpos( $path, 'essays' );
	}
	return 0 === strpos( $path, $slug ) || is_page( $slug );
}
