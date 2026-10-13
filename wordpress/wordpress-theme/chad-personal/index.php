<?php
/**
 * Main fallback template.
 *
 * @package Chad_Personal
 */

get_header();
?>
<main id="main">
	<div class="page">
		<?php if ( have_posts() ) : ?>
			<ul class="writing-list">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<li>
						<a class="writing-link" href="<?php the_permalink(); ?>">
							<span class="writing-title"><?php the_title(); ?></span>
							<span class="meta">
								<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
							</span>
						</a>
					</li>
				<?php endwhile; ?>
			</ul>
		<?php else : ?>
			<p class="empty-state"><?php esc_html_e( 'Nothing here yet.', 'chad-personal' ); ?></p>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
