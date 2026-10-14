<?php
/**
 * Page template for slug `work`.
 *
 * @package Chad_Personal
 */

get_header();
?>
<main id="main">
	<?php
	while ( have_posts() ) :
		the_post();
		$content = trim( get_the_content() );
		$has_content = '' !== $content;
		?>
		<article <?php post_class( 'page' ); ?>>
			<h1 class="page-title"><?php the_title(); ?></h1>
			<p class="page-dek"><?php esc_html_e( 'Selected projects. Short blurbs — no case-study theater.', 'chad-personal' ); ?></p>

			<?php if ( $has_content ) : ?>
				<div class="page-body prose">
					<?php the_content(); ?>
				</div>
			<?php else : ?>
				<ul class="work-list">
					<li>
						<a class="work-item" href="<?php echo esc_url( home_url( '/colophon/' ) ); ?>">
							<span class="work-title"><?php esc_html_e( 'Personal site (this one)', 'chad-personal' ); ?></span>
							<span class="meta"><?php esc_html_e( 'Design & engineering · 2026', 'chad-personal' ); ?></span>
							<span class="work-summary"><?php esc_html_e( 'Classic WordPress theme with interactive bio, frosted dock, and Essays at /essays/.', 'chad-personal' ); ?></span>
						</a>
					</li>
					<li>
						<div class="work-item">
							<span class="work-title"><?php esc_html_e( 'Placeholder project', 'chad-personal' ); ?></span>
							<span class="meta"><?php esc_html_e( 'Founder / builder · TBD', 'chad-personal' ); ?></span>
							<span class="work-summary"><?php esc_html_e( 'Case blurbs go here — title, role, one line. Edit this page in WP admin to replace the placeholder.', 'chad-personal' ); ?></span>
						</div>
					</li>
				</ul>
			<?php endif; ?>
		</article>
	<?php endwhile; ?>
</main>
<?php
get_footer();
