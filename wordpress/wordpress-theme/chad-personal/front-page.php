<?php
/**
 * Front page — conversational bio with hotspots + discovery counter.
 *
 * @package Chad_Personal
 */

get_header();

$bio   = chad_personal_get_bio();
$words = isset( $bio['words'] ) && is_array( $bio['words'] ) ? $bio['words'] : array();
$lead  = isset( $bio['lead'] ) ? $bio['lead'] : '';
$total = count( $words );
$public_count = 0;
foreach ( $words as $w ) {
	if ( empty( $w['secret'] ) ) {
		$public_count++;
	}
}
$lead_html = chad_personal_build_lead_html( $lead, $words );
?>
<main id="main">
	<section
		class="bio"
		data-bio
		data-total="<?php echo esc_attr( (string) $total ); ?>"
		data-public-total="<?php echo esc_attr( (string) $public_count ); ?>"
	>
		<div class="bio-counter" data-bio-counter aria-live="polite">
			<span data-bio-count>0</span>/<span><?php echo esc_html( (string) $total ); ?></span>
			<span class="sr-only">discoveries</span>
		</div>

		<p class="bio-lead"><?php echo $lead_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped — built with esc_html + safe markup ?></p>

		<div class="bio-panels">
			<?php foreach ( $words as $w ) : ?>
				<?php
				$id     = isset( $w['id'] ) ? $w['id'] : '';
				$title  = isset( $w['title'] ) ? $w['title'] : '';
				$body   = isset( $w['body'] ) ? $w['body'] : '';
				$href   = chad_personal_bio_href( isset( $w['href'] ) ? $w['href'] : null );
				$secret = ! empty( $w['secret'] );
				if ( '' === $id ) {
					continue;
				}
				?>
				<div
					id="panel-<?php echo esc_attr( $id ); ?>"
					class="bio-panel"
					role="dialog"
					aria-modal="false"
					aria-labelledby="panel-title-<?php echo esc_attr( $id ); ?>"
					hidden
					data-panel-id="<?php echo esc_attr( $id ); ?>"
				>
					<div class="bio-panel-inner">
						<div class="bio-panel-head">
							<h2 id="panel-title-<?php echo esc_attr( $id ); ?>" class="bio-panel-title"><?php echo esc_html( $title ); ?></h2>
							<button type="button" class="bio-panel-close" data-panel-close aria-label="Close">×</button>
						</div>
						<p class="bio-panel-body"><?php echo esc_html( $body ); ?></p>
						<?php if ( $href ) : ?>
							<p class="bio-panel-link">
								<a href="<?php echo esc_url( $href ); ?>">
									<?php echo $secret ? esc_html__( 'Open the quiet door →', 'chad-personal' ) : esc_html__( 'Learn more →', 'chad-personal' ); ?>
								</a>
							</p>
						<?php endif; ?>
					</div>
				</div>
			<?php endforeach; ?>
		</div>
		<div class="bio-backdrop" data-bio-backdrop hidden></div>
	</section>
</main>
<?php
get_footer();
