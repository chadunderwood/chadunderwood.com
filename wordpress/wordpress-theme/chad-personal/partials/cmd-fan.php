<?php
/**
 * ⌘ fan menu: X, GitHub, dark mode, sound.
 *
 * @package Chad_Personal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$urls = chad_personal_dock_urls();

$x_icon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
$gh_icon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';
?>
<div id="cmd-fan" class="elsewhere-stack" role="menu" hidden>
	<a
		role="menuitem"
		class="elsewhere-link elsewhere-link--icon"
		href="<?php echo esc_url( $urls['x'] ); ?>"
		target="_blank"
		rel="me noopener noreferrer"
	>
		<span class="elsewhere-icon" aria-hidden="true"><?php echo $x_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
		<span>X</span>
	</a>
	<a
		role="menuitem"
		class="elsewhere-link elsewhere-link--icon"
		href="<?php echo esc_url( $urls['github'] ); ?>"
		target="_blank"
		rel="me noopener noreferrer"
	>
		<span class="elsewhere-icon" aria-hidden="true"><?php echo $gh_icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
		<span>GitHub</span>
	</a>
	<div class="fan-row" role="none">
		<span class="fan-row-label" id="fan-dark-label">Dark mode</span>
		<button
			type="button"
			class="ios-switch"
			role="switch"
			aria-checked="true"
			aria-labelledby="fan-dark-label"
			data-theme-toggle
		>
			<span class="ios-switch-track" aria-hidden="true">
				<span class="ios-switch-knob"></span>
			</span>
		</button>
	</div>
	<div class="fan-row" role="none">
		<span class="fan-row-label" id="fan-sound-label">Sound</span>
		<button
			type="button"
			class="ios-switch"
			role="switch"
			aria-checked="false"
			aria-labelledby="fan-sound-label"
			data-sound-toggle
		>
			<span class="ios-switch-track" aria-hidden="true">
				<span class="ios-switch-knob"></span>
			</span>
		</button>
	</div>
</div>
