<?php
/**
 * Page template for slug `colophon`.
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
		<article <?php post_class( 'page prose' ); ?>>
			<h1 class="page-title"><?php the_title(); ?></h1>
			<p class="page-dek"><?php esc_html_e( 'How this room is built. (Dock ⌘ fans to X & GitHub; this page stays at /colophon/.)', 'chad-personal' ); ?></p>

			<?php if ( $has_content ) : ?>
				<div class="page-body">
					<?php the_content(); ?>
				</div>
			<?php else : ?>
				<div class="page-body">
					<h2><?php esc_html_e( 'Stack', 'chad-personal' ); ?></h2>
					<ul>
						<li><strong>WordPress</strong> — classic PHP theme (not block/FSE).</li>
						<li><strong>Posts</strong> — Essays at <code>/essays/</code>.</li>
						<li><strong>Hostinger</strong> — managed WordPress hosting.</li>
					</ul>

					<h2><?php esc_html_e( 'Inspiration', 'chad-personal' ); ?></h2>
					<p>
						<?php
						echo wp_kses_post(
							__(
								'Interaction model inspired by <a href="https://ped.ro" rel="noopener noreferrer" target="_blank">ped.ro</a> (conversational bio, sparse chrome) — original execution and content, not a clone. Energy also from Benji Taylor’s note that a personal site should feel like leaving the rest of the internet.',
								'chad-personal'
							)
						);
						?>
					</p>

					<h2><?php esc_html_e( 'Type', 'chad-personal' ); ?></h2>
					<p><?php esc_html_e( 'Inter (Google Fonts) with system-ui fallbacks. Dark tokens; light via html[data-theme=light].', 'chad-personal' ); ?></p>

					<h2><?php esc_html_e( 'Sound', 'chad-personal' ); ?></h2>
					<p><?php esc_html_e( 'Optional UI ticks on hotspot open / dock switch. Default: off. Toggle from the ⌘ fan.', 'chad-personal' ); ?></p>

					<p class="empty-state"><?php esc_html_e( 'Edit this page in WP admin to replace the placeholder.', 'chad-personal' ); ?></p>
				</div>
			<?php endif; ?>
		</article>
	<?php endwhile; ?>
</main>
<?php
get_footer();
