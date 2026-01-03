<?php
/**
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

$top_image_id = $attributes['topImageId'] ?? 0;
$top_image_url = $attributes['topImageUrl'] ?? '';
$top_image_alt = $attributes['topImageAlt'] ?? '';
$top_image_size_slug = $attributes['topImageSizeSlug'] ?? 'full';
$bottom_image_id = $attributes['bottomImageId'] ?? 0;
$bottom_image_url = $attributes['bottomImageUrl'] ?? '';
$bottom_image_alt = $attributes['bottomImageAlt'] ?? '';
$bottom_image_size_slug = $attributes['bottomImageSizeSlug'] ?? 'full';
$caption = $attributes['caption'] ?? '';
$show_caption = $attributes['showCaption'] ?? true;
$reveal_direction = $attributes['revealDirection'] ?? 'top';
$transition_fade_width = $attributes['transitionFadeWidth'] ?? 20;
$object_fit = $attributes['objectFit'] ?? 'cover';

if ( empty( $top_image_url ) || empty( $bottom_image_url ) ) {
	return;
}

// Get the appropriate image size URL if ID is available
if ( $bottom_image_id ) {
	$bottom_image_data = wp_get_attachment_image_src( $bottom_image_id, $bottom_image_size_slug );
	if ( $bottom_image_data ) {
		$bottom_image_url = $bottom_image_data[0];
	}
}

if ( $top_image_id ) {
	$top_image_data = wp_get_attachment_image_src( $top_image_id, $top_image_size_slug );
	if ( $top_image_data ) {
		$top_image_url = $top_image_data[0];
	}
}

$wrapper_attributes = get_block_wrapper_attributes( array(
	'data-reveal-direction' => esc_attr( $reveal_direction ),
	'data-transition-fade-width' => esc_attr( $transition_fade_width ),
	'data-object-fit' => esc_attr( $object_fit )
) );

$initial_clip_path = 'inset(0 0 100% 0)';
switch ( $reveal_direction ) {
	case 'left':
		$initial_clip_path = 'inset(0 100% 0 0)';
		break;
	case 'right':
		$initial_clip_path = 'inset(0 0 0 100%)';
		break;
	case 'bottom':
		$initial_clip_path = 'inset(100% 0 0 0)';
		break;
}

$images_content = sprintf(
	'<div class="images-wrapper">
		<img src="%s" alt="%s" class="bottom-image" style="object-fit: %s;" />
		<img src="%s" alt="%s" class="top-image" style="clip-path: %s; object-fit: %s;" />
	</div>',
	esc_url( $bottom_image_url ),
	esc_attr( $bottom_image_alt ),
	esc_attr( $object_fit ),
	esc_url( $top_image_url ),
	esc_attr( $top_image_alt ),
	esc_attr( $initial_clip_path ),
	esc_attr( $object_fit )
);

if ( $show_caption && ! empty( $caption ) ) {
	$content = sprintf(
		'<figure>%s<figcaption class="image-scroll-reveal-caption">%s</figcaption></figure>',
		$images_content,
		wp_kses_post( $caption )
	);
} else {
	$content = $images_content;
}
?>
<div <?php echo $wrapper_attributes; ?>>
	<?php echo $content; ?>
</div>