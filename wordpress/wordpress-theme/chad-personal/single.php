<?php
/**
 * Single essay.
 *
 * @package Chad_Personal
 */

get_header();
?>
<main id="main">
	<?php
	while ( have_posts() ) :
		the_post();
		?>
		<article <?php post_class( 'page prose' ); ?> data-essay>
			<header class="essay-header">
				<h1 class="page-title"><?php the_title(); ?></h1>
				<p class="meta">
					<time datetime="<?php echo esc_attr( get_the_date( DATE_W3C ) ); ?>"><?php echo esc_html( get_the_date() ); ?></time>
				</p>
			</header>
			<div class="essay-body">
				<?php the_content(); ?>
			</div>
			<footer class="essay-footer">
				<p><a class="essay-back" href="<?php echo esc_url( home_url( '/essays/' ) ); ?>"><?php esc_html_e( '← All essays', 'chad-personal' ); ?></a></p>
			</footer>
		</article>
	<?php endwhile; ?>
</main>
<?php
get_footer();
