<?php
/**
 * WP-CLI: wp eval-file import-essays.php /path/to/posts-wp.json
 * Idempotent upsert by slug into staging.
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit( 1 );
}

$json_path = $args[0] ?? '';
if ( ! $json_path || ! file_exists( $json_path ) ) {
	fwrite( STDERR, "Usage: wp eval-file import-essays.php /path/to/posts-wp.json\n" );
	exit( 1 );
}

$items = json_decode( file_get_contents( $json_path ), true );
if ( ! is_array( $items ) ) {
	fwrite( STDERR, "Invalid JSON\n" );
	exit( 1 );
}

// Ensure Essays category.
$essays_cat = term_exists( 'Essays', 'category' );
if ( ! $essays_cat ) {
	$essays_cat = wp_insert_term( 'Essays', 'category' );
}
$essays_cat_id = is_array( $essays_cat ) ? (int) $essays_cat['term_id'] : (int) $essays_cat;

function chad_import_wp_datetime( $iso ) {
	if ( ! $iso ) {
		return current_time( 'mysql' );
	}
	try {
		$dt = new DateTimeImmutable( $iso );
		$dt = $dt->setTimezone( new DateTimeZone( 'UTC' ) );
		return $dt->format( 'Y-m-d H:i:s' );
	} catch ( Exception $e ) {
		return current_time( 'mysql' );
	}
}

$created = 0;
$updated = 0;
$failed  = array();

foreach ( $items as $item ) {
	$slug  = sanitize_title( $item['slug'] ?? '' );
	$title = $item['title'] ?? '';
	if ( ! $slug || ! $title ) {
		$failed[] = 'missing slug/title';
		continue;
	}

	$existing = get_page_by_path( $slug, OBJECT, 'post' );
	$post_date_gmt = chad_import_wp_datetime( $item['date'] ?? null );
	$post_modified_gmt = chad_import_wp_datetime( $item['updated'] ?? $item['date'] ?? null );

	// Convert GMT to site local for post_date / post_modified.
	$post_date     = get_date_from_gmt( $post_date_gmt );
	$post_modified = get_date_from_gmt( $post_modified_gmt );

	$postarr = array(
		'post_title'    => wp_strip_all_tags( $title ),
		'post_name'     => $slug,
		'post_content'  => $item['content'] ?? '',
		'post_excerpt'  => $item['excerpt'] ?? '',
		'post_status'   => 'publish',
		'post_type'     => 'post',
		'post_date'     => $post_date,
		'post_date_gmt' => $post_date_gmt,
		'post_modified' => $post_modified,
		'post_modified_gmt' => $post_modified_gmt,
		'edit_date'     => true,
	);

	if ( $existing ) {
		$postarr['ID'] = $existing->ID;
		$result        = wp_update_post( $postarr, true );
		$action        = 'update';
	} else {
		$result = wp_insert_post( $postarr, true );
		$action = 'create';
	}

	if ( is_wp_error( $result ) ) {
		$failed[] = $slug . ': ' . $result->get_error_message();
		continue;
	}

	$post_id = (int) $result;
	wp_set_post_categories( $post_id, array( $essays_cat_id ), false );

	$tags = $item['tags'] ?? array();
	if ( is_array( $tags ) && $tags ) {
		wp_set_post_tags( $post_id, $tags, false );
	} else {
		wp_set_post_tags( $post_id, array(), false );
	}

	if ( 'create' === $action ) {
		$created++;
	} else {
		$updated++;
	}
	WP_CLI::log( sprintf( '%s %s (#%d)', $action, $slug, $post_id ) );
}

$count = (int) wp_count_posts( 'post' )->publish;
WP_CLI::success( sprintf( 'created=%d updated=%d publish_count=%d failures=%d', $created, $updated, $count, count( $failed ) ) );
foreach ( $failed as $f ) {
	WP_CLI::warning( $f );
}
