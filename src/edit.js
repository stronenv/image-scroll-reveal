/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { 
	useBlockProps,
	InspectorControls,
	MediaPlaceholder,
	BlockControls,
	MediaReplaceFlow,
	RichText
} from '@wordpress/block-editor';

import {
	PanelBody,
	SelectControl,
	RangeControl,
	ToolbarGroup,
	ToolbarButton,
	TextControl
} from '@wordpress/components';

import { useState } from '@wordpress/element';
import { caption as captionIcon, update } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object} props Block properties
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes, isSelected } ) {
	const {
		topImageId,
		topImageUrl,
		topImageAlt,
		topImageSizeSlug,
		bottomImageId,
		bottomImageUrl,
		bottomImageAlt,
		bottomImageSizeSlug,
		caption,
		showCaption,
		revealDirection,
		transitionFadeWidth,
		objectFit
	} = attributes;

	const [ revealProgress, setRevealProgress ] = useState( 50 );

	// Get available image sizes and media details
	const { imageSizes, topImage, bottomImage } = useSelect(
		( select ) => {
			const { getMedia } = select( coreStore );
			const { getSettings } = select( 'core/block-editor' );
			const settings = getSettings();

			return {
				imageSizes: settings?.imageSizes || [],
				topImage: topImageId ? getMedia( topImageId ) : null,
				bottomImage: bottomImageId ? getMedia( bottomImageId ) : null
			};
		},
		[ topImageId, bottomImageId ]
	);

	// Get the URL for a specific image size
	const getImageUrl = ( image, sizeSlug ) => {
		if ( ! image ) {
			return null;
		}

		if ( ! sizeSlug || sizeSlug === 'full' ) {
			return image.source_url;
		}

		const imageSize = image?.media_details?.sizes?.[ sizeSlug ];
		return imageSize?.source_url || image.source_url;
	};

	// Get display URL for each image based on selected size
	const topImageDisplayUrl = topImage ? getImageUrl( topImage, topImageSizeSlug ) : topImageUrl;
	const bottomImageDisplayUrl = bottomImage ? getImageUrl( bottomImage, bottomImageSizeSlug ) : bottomImageUrl;

	const blockProps = useBlockProps( {
		className: 'image-scroll-reveal-container'
	} );

	const onSelectBottomImage = ( media ) => {
		setAttributes( {
			bottomImageId: media.id,
			bottomImageUrl: media.url,
			bottomImageAlt: media.alt || '',
			bottomImageSizeSlug: 'full'
		} );
	};

	const onSelectTopImage = ( media ) => {
		setAttributes( {
			topImageId: media.id,
			topImageUrl: media.url,
			topImageAlt: media.alt || '',
			topImageSizeSlug: 'full'
		} );
	};

	const onSelectBottomImageURL = ( url ) => {
		setAttributes( {
			bottomImageId: undefined,
			bottomImageUrl: url,
			bottomImageAlt: '',
			bottomImageSizeSlug: 'full'
		} );
	};

	const onSelectTopImageURL = ( url ) => {
		setAttributes( {
			topImageId: undefined,
			topImageUrl: url,
			topImageAlt: '',
			topImageSizeSlug: 'full'
		} );
	};

	const onRemoveBottomImage = () => {
		setAttributes( {
			bottomImageId: undefined,
			bottomImageUrl: undefined,
			bottomImageAlt: '',
			bottomImageSizeSlug: 'full'
		} );
	};

	const onRemoveTopImage = () => {
		setAttributes( {
			topImageId: undefined,
			topImageUrl: undefined,
			topImageAlt: '',
			topImageSizeSlug: 'full'
		} );
	};

	const onSwapImages = () => {
		setAttributes( {
			topImageId: bottomImageId,
			topImageUrl: bottomImageUrl,
			topImageAlt: bottomImageAlt,
			topImageSizeSlug: bottomImageSizeSlug,
			bottomImageId: topImageId,
			bottomImageUrl: topImageUrl,
			bottomImageAlt: topImageAlt,
			bottomImageSizeSlug: topImageSizeSlug
		} );
	};

	const getClipPathStyle = ( progress ) => {
		const percent = progress;
		
		switch ( revealDirection ) {
			case 'left':
				return `inset(0 ${100 - percent}% 0 0)`;
			case 'right':
				return `inset(0 0 0 ${100 - percent}%)`;
			case 'top':
				return `inset(0 0 ${100 - percent}% 0)`;
			case 'bottom':
				return `inset(${100 - percent}% 0 0 0)`;
			default:
				return `inset(0 ${100 - percent}% 0 0)`;
		}
	};

	// Create size options for SelectControl
	const imageSizeOptions = imageSizes.map( ( size ) => ( {
		label: size.name,
		value: size.slug
	} ) );

	const hasBottomImage = !! bottomImageUrl;
	const hasTopImage = !! topImageUrl;
	const hasBothImages = hasBottomImage && hasTopImage;

	return (
		<>
			<BlockControls>
				{ hasBottomImage && (
					<ToolbarGroup>
						<MediaReplaceFlow
							mediaId={ bottomImageId }
							mediaURL={ bottomImageUrl }
							allowedTypes={ [ 'image' ] }
							accept="image/*"
							onSelect={ onSelectBottomImage }
							onSelectURL={ onSelectBottomImageURL }
							onReset={ onRemoveBottomImage }
							name={ __( 'Replace Bottom Image', 'image-scroll-reveal' ) }
						/>
					</ToolbarGroup>
				) }
				{ hasTopImage && (
					<ToolbarGroup>
						<MediaReplaceFlow
							mediaId={ topImageId }
							mediaURL={ topImageUrl }
							allowedTypes={ [ 'image' ] }
							accept="image/*"
							onSelect={ onSelectTopImage }
							onSelectURL={ onSelectTopImageURL }
							onReset={ onRemoveTopImage }
							name={ __( 'Replace Top Image', 'image-scroll-reveal' ) }
						/>
					</ToolbarGroup>
				) }
				{ hasBothImages && (
					<>
						<ToolbarGroup>
							<ToolbarButton
								icon={ update }
								title={ __( 'Swap images', 'image-scroll-reveal' ) }
								onClick={ onSwapImages }
							/>
						</ToolbarGroup>
						<ToolbarGroup>
							<ToolbarButton
								icon={ captionIcon }
								title={ __( 'Toggle caption', 'image-scroll-reveal' ) }
								isPressed={ showCaption }
								onClick={ () => setAttributes( { showCaption: ! showCaption } ) }
							/>
						</ToolbarGroup>
					</>
				) }
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Reveal Settings', 'image-scroll-reveal' ) }>
					<SelectControl
						label={ __( 'Reveal Direction', 'image-scroll-reveal' ) }
						value={ revealDirection }
						options={ [
							{ label: __( 'Left to Right', 'image-scroll-reveal' ), value: 'left' },
							{ label: __( 'Right to Left', 'image-scroll-reveal' ), value: 'right' },
							{ label: __( 'Top to Bottom', 'image-scroll-reveal' ), value: 'top' },
							{ label: __( 'Bottom to Top', 'image-scroll-reveal' ), value: 'bottom' }
						] }
						onChange={ ( value ) => setAttributes( { revealDirection: value } ) }
						help={ __( 'Direction in which the top image reveals the bottom image', 'image-scroll-reveal' ) }
					/>
					
					<RangeControl
						label={ __( 'Transition Fade Width (px)', 'image-scroll-reveal' ) }
						value={ transitionFadeWidth }
						onChange={ ( value ) => setAttributes( { transitionFadeWidth: value } ) }
						min={ 0 }
						max={ 300 }
						help={ __( 'Width of the fade transition effect', 'image-scroll-reveal' ) }
					/>
					
					<SelectControl
						label={ __( 'Object Fit', 'image-scroll-reveal' ) }
						value={ objectFit }
						options={ [
							{ label: __( 'Cover', 'image-scroll-reveal' ), value: 'cover' },
							{ label: __( 'Contain', 'image-scroll-reveal' ), value: 'contain' },
							{ label: __( 'Fill', 'image-scroll-reveal' ), value: 'fill' },
							{ label: __( 'None', 'image-scroll-reveal' ), value: 'none' }
						] }
						onChange={ ( value ) => setAttributes( { objectFit: value } ) }
						help={ __( 'How images should be resized to fit their container', 'image-scroll-reveal' ) }
					/>
				</PanelBody>

				{ hasBottomImage && bottomImageId && imageSizeOptions.length > 0 && (
					<PanelBody title={ __( 'Bottom Image Settings', 'image-scroll-reveal' ) }>
						<SelectControl
							label={ __( 'Resolution', 'image-scroll-reveal' ) }
							value={ bottomImageSizeSlug }
							options={ imageSizeOptions }
							onChange={ ( value ) => setAttributes( { bottomImageSizeSlug: value } ) }
							help={ __( 'Select the image resolution to display', 'image-scroll-reveal' ) }
						/>
						<TextControl
							label={ __( 'Alternative Text', 'image-scroll-reveal' ) }
							value={ bottomImageAlt }
							onChange={ ( value ) => setAttributes( { bottomImageAlt: value } ) }
							help={ __( 'Describe the purpose of the image for screen readers', 'image-scroll-reveal' ) }
						/>
					</PanelBody>
				) }

				{ hasBottomImage && ! bottomImageId && (
					<PanelBody title={ __( 'Bottom Image Settings', 'image-scroll-reveal' ) }>
						<TextControl
							label={ __( 'Alternative Text', 'image-scroll-reveal' ) }
							value={ bottomImageAlt }
							onChange={ ( value ) => setAttributes( { bottomImageAlt: value } ) }
							help={ __( 'Describe the purpose of the image for screen readers', 'image-scroll-reveal' ) }
						/>
					</PanelBody>
				) }

				{ hasTopImage && topImageId && imageSizeOptions.length > 0 && (
					<PanelBody title={ __( 'Top Image Settings', 'image-scroll-reveal' ) }>
						<SelectControl
							label={ __( 'Resolution', 'image-scroll-reveal' ) }
							value={ topImageSizeSlug }
							options={ imageSizeOptions }
							onChange={ ( value ) => setAttributes( { topImageSizeSlug: value } ) }
							help={ __( 'Select the image resolution to display', 'image-scroll-reveal' ) }
						/>
						<TextControl
							label={ __( 'Alternative Text', 'image-scroll-reveal' ) }
							value={ topImageAlt }
							onChange={ ( value ) => setAttributes( { topImageAlt: value } ) }
							help={ __( 'Describe the purpose of the image for screen readers', 'image-scroll-reveal' ) }
						/>
					</PanelBody>
				) }

				{ hasTopImage && ! topImageId && (
					<PanelBody title={ __( 'Top Image Settings', 'image-scroll-reveal' ) }>
						<TextControl
							label={ __( 'Alternative Text', 'image-scroll-reveal' ) }
							value={ topImageAlt }
							onChange={ ( value ) => setAttributes( { topImageAlt: value } ) }
							help={ __( 'Describe the purpose of the image for screen readers', 'image-scroll-reveal' ) }
						/>
					</PanelBody>
				) }

				{ hasBothImages && (
					<PanelBody title={ __( 'Preview', 'image-scroll-reveal' ) } initialOpen={ true }>
						<RangeControl
							label={ __( 'Reveal Progress (%)', 'image-scroll-reveal' ) }
							value={ revealProgress }
							onChange={ ( value ) => setRevealProgress( value ) }
							min={ 0 }
							max={ 100 }
							help={ __( 'Adjust to preview the reveal effect', 'image-scroll-reveal' ) }
						/>
						
						<div className="sidebar-preview-container">
							<div className="sidebar-images-container">
								<img 
									src={ bottomImageDisplayUrl } 
									alt={ bottomImageAlt }
									className="sidebar-bottom-image"
									style={ { objectFit: objectFit } }
								/>
								<img 
									src={ topImageDisplayUrl } 
									alt={ topImageAlt }
									className="sidebar-top-image"
									style={ {
										clipPath: getClipPathStyle( revealProgress ),
										objectFit: objectFit
									} }
								/>
							</div>
						</div>
					</PanelBody>
				) }
			</InspectorControls>

			<div { ...blockProps }>
				<div className="image-upload-section">
					<div className="upload-label">{ __( 'Bottom Image', 'image-scroll-reveal' ) }</div>
					{ ! hasBottomImage ? (
						<MediaPlaceholder
							icon="format-image"
							labels={ {
								title: __( 'Bottom Image', 'image-scroll-reveal' ),
								instructions: __( 'Upload an image or pick one from your media library.', 'image-scroll-reveal' )
							} }
							onSelect={ onSelectBottomImage }
							onSelectURL={ onSelectBottomImageURL }
							accept="image/*"
							allowedTypes={ [ 'image' ] }
						/>
					) : (
						<div className="image-preview">
							<img src={ bottomImageDisplayUrl } alt={ bottomImageAlt } />
						</div>
					) }
				</div>

				<div className="image-upload-section">
					<div className="upload-label">{ __( 'Top Image', 'image-scroll-reveal' ) }</div>
					{ ! hasTopImage ? (
						<MediaPlaceholder
							icon="format-image"
							labels={ {
								title: __( 'Top Image', 'image-scroll-reveal' ),
								instructions: __( 'Upload an image or pick one from your media library.', 'image-scroll-reveal' )
							} }
							onSelect={ onSelectTopImage }
							onSelectURL={ onSelectTopImageURL }
							accept="image/*"
							allowedTypes={ [ 'image' ] }
						/>
					) : (
						<div className="image-preview">
							<img src={ topImageDisplayUrl } alt={ topImageAlt } />
						</div>
					) }
				</div>

				{ hasBothImages && showCaption && (
					<RichText
						tagName="figcaption"
						className="image-scroll-reveal-caption"
						placeholder={ __( 'Add caption…', 'image-scroll-reveal' ) }
						value={ caption }
						onChange={ ( value ) => setAttributes( { caption: value } ) }
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
						inlineToolbar
					/>
				) }
			</div>
		</>
	);
}