<?php
/**
 * Bottom dock — Home · Essays · Work · Now · ⌘ · Email
 * (No Signal, no Photos.)
 *
 * @package Chad_Personal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$urls = chad_personal_dock_urls();

$items = array(
	array(
		'id'     => 'home',
		'label'  => 'Home',
		'href'   => $urls['home'],
		'active' => chad_personal_is_dock_active( 'home' ),
	),
	array(
		'id'     => 'essays',
		'label'  => 'Essays',
		'href'   => $urls['essays'],
		'active' => chad_personal_is_dock_active( 'essays' ),
	),
	array(
		'id'     => 'work',
		'label'  => 'Work',
		'href'   => $urls['work'],
		'active' => chad_personal_is_dock_active( 'work' ),
	),
	array(
		'id'     => 'now',
		'label'  => 'Now',
		'href'   => $urls['now'],
		'active' => chad_personal_is_dock_active( 'now' ),
	),
);
?>
<nav class="dock" aria-label="Primary">
	<div class="dock-bar" role="menubar">
		<?php foreach ( $items as $item ) : ?>
			<a
				class="dock-item<?php echo $item['active'] ? ' active' : ''; ?>"
				href="<?php echo esc_url( $item['href'] ); ?>"
				role="menuitem"
				<?php echo $item['active'] ? ' aria-current="page"' : ''; ?>
				title="<?php echo esc_attr( $item['label'] ); ?>"
				data-dock-id="<?php echo esc_attr( $item['id'] ); ?>"
			>
				<span class="dock-icon"><?php chad_personal_dock_icon( $item['id'] ); ?></span>
				<span class="dock-label"><?php echo esc_html( $item['label'] ); ?></span>
			</a>
		<?php endforeach; ?>

		<div class="dock-item-wrap elsewhere-wrap">
			<button
				type="button"
				class="dock-item"
				role="menuitem"
				aria-haspopup="menu"
				aria-expanded="false"
				aria-controls="cmd-fan"
				data-elsewhere-toggle
				data-dock-id="cmd"
				title="⌘"
			>
				<span class="dock-icon"><?php chad_personal_dock_icon( 'cmd' ); ?></span>
				<span class="dock-label">⌘</span>
			</button>
			<?php get_template_part( 'partials/cmd-fan' ); ?>
		</div>

		<a
			class="dock-item"
			href="<?php echo esc_url( $urls['email'] ); ?>"
			role="menuitem"
			title="Email"
			data-dock-id="email"
		>
			<span class="dock-icon"><?php chad_personal_dock_icon( 'email' ); ?></span>
			<span class="dock-label">Email</span>
		</a>
	</div>
</nav>
