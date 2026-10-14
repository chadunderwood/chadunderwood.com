<?php
/**
 * Page template for slug `now`.
 *
 * @package Chad_Personal
 */

get_header();

$has_content = false;
?>
<main id="main">
	<?php
	while ( have_posts() ) :
		the_post();
		$content = trim( get_the_content() );
		$has_content = '' !== $content;
		?>
		<article <?php post_class( 'page prose' ); ?>>
			<h1 class="page-title"><?php the_title(); ?></h1>
			<p class="page-dek meta">
				<?php
				printf(
					/* translators: %s: last modified date */
					esc_html__( 'Last updated %s', 'chad-personal' ),
					'<time datetime="' . esc_attr( get_the_modified_date( DATE_W3C ) ) . '">' . esc_html( get_the_modified_date() ) . '</time>'
				);
				?>
			</p>
			<?php if ( $has_content ) : ?>
				<div class="page-body">
					<?php the_content(); ?>
				</div>
			<?php else : ?>
				<div class="page-body">
					<h2><?php esc_html_e( 'Focus', 'chad-personal' ); ?></h2>
					<ul>
						<li><?php esc_html_e( 'Shipping this personal site (WordPress classic theme on Hostinger).', 'chad-personal' ); ?></li>
						<li><?php esc_html_e( 'Keeping the home bio playful without turning into a portfolio hero.', 'chad-personal' ); ?></li>
						<li><?php esc_html_e( 'Essays when something sticks — Drafts → publish → here.', 'chad-personal' ); ?></li>
					</ul>
					<h2><?php esc_html_e( 'Reading / listening', 'chad-personal' ); ?></h2>
					<p><?php esc_html_e( 'TBD — Chad fills this in.', 'chad-personal' ); ?></p>
					<p class="empty-state"><?php esc_html_e( 'Edit this page in WP admin to replace the placeholder.', 'chad-personal' ); ?></p>
				</div>
			<?php endif; ?>
		</article>
	<?php endwhile; ?>
</main>
<?php
get_footer();
