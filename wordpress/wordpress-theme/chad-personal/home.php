<?php
/**
 * Essays index (blog posts archive at /essays/).
 *
 * @package Chad_Personal
 */

get_header();
?>
<main id="main">
	<div class="page">
		<h1 class="page-title"><?php esc_html_e( 'Essays', 'chad-personal' ); ?></h1>
		<p class="page-dek"><?php esc_html_e( 'Essays and notes.', 'chad-personal' ); ?></p>

		<?php if ( have_posts() ) : ?>
			<ul class="writing-list">
				<?php
				while ( have_posts() ) :
					the_post();
					?>
					<li>
						<a class="writing-link" href="<?php the_permalink(); ?>">
							<span class="writing-title"><?php the_title(); ?></span>
							<?php if ( has_excerpt() ) : ?>
								<span class="writing-dek"><?php echo esc_html( get_the_excerpt() ); ?></span>
							<?php endif; ?>
							<span class="meta">
								<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
							</span>
						</a>
					</li>
				<?php endwhile; ?>
			</ul>

			<?php
			the_posts_pagination(
				array(
					'mid_size'  => 1,
					'prev_text' => __( '← Newer', 'chad-personal' ),
					'next_text' => __( 'Older →', 'chad-personal' ),
				)
			);
			?>
		<?php else : ?>
			<p class="empty-state"><?php esc_html_e( 'Essays soon.', 'chad-personal' ); ?></p>
		<?php endif; ?>
	</div>
</main>
<?php
get_footer();
