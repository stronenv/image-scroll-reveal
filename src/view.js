(function() {
	'use strict';

	function initScrollReveal() {
		const blocks = document.querySelectorAll('.wp-block-telex-block-image-scroll-reveal');
		
		if (blocks.length === 0) {
			return;
		}

		let ticking = false;

		function getClipPath(direction, progress) {
			const percent = Math.max(0, Math.min(100, progress));
			
			switch (direction) {
				case 'left':
					return 'inset(0 ' + (100 - percent) + '% 0 0)';
				case 'right':
					return 'inset(0 0 0 ' + (100 - percent) + '%)';
				case 'top':
					return 'inset(0 0 ' + (100 - percent) + '% 0)';
				case 'bottom':
					return 'inset(' + (100 - percent) + '% 0 0 0)';
				default:
					return 'inset(0 ' + (100 - percent) + '% 0 0)';
			}
		}

		function calculateRevealProgress(block, fadeWidth) {
			const rect = block.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const blockHeight = rect.height;
			
			// Check if the block is taller than 95% of the viewport
			const isTallBlock = blockHeight > (viewportHeight * 0.95);
			
			if (isTallBlock) {
				// Tall block behavior: start when top hits viewport top, end when bottom is visible
				
				// Phase 1: Block top hasn't reached viewport top yet
				if (rect.top > 0) {
					return 0;
				}
				
				// Calculate the extended end point to account for fade width
				const fadePixels = parseFloat(fadeWidth) || 0;
				const fadePercent = (fadePixels / blockHeight) * 100;
				const extendedTarget = viewportHeight + fadePixels;
				
				// Phase 3: Block bottom has scrolled past the extended target (animation complete)
				if (rect.bottom <= viewportHeight - fadePixels) {
					return 100 + fadePercent;
				}
				
				// Phase 2: Animation in progress (from top hitting viewport top to bottom becoming visible)
				const scrolledDistance = Math.abs(rect.top);
				const totalScrollDistance = blockHeight - viewportHeight + fadePixels;
				const progress = (scrolledDistance / totalScrollDistance) * (100 + fadePercent);
				
				return Math.max(0, Math.min(100 + fadePercent, progress));
			} else {
				// Normal block behavior (existing functionality)
				
				// Phase 1: Block bottom hasn't reached viewport bottom yet (not fully visible)
				if (rect.bottom > viewportHeight) {
					return 0;
				}
				
				// Calculate the extended end point to account for fade width
				const fadePixels = parseFloat(fadeWidth) || 0;
				const fadePercent = (fadePixels / blockHeight) * 100;
				const extendedTarget = -fadePercent;
				
				// Phase 3: Block has scrolled past the extended target (animation complete)
				if (rect.top <= extendedTarget) {
					return 100 + fadePercent;
				}
				
				// Phase 2: Animation in progress
				const startTop = viewportHeight - blockHeight;
				const currentDistanceFromStart = startTop - rect.top;
				const totalScrollDistance = startTop - extendedTarget;
				const progress = (currentDistanceFromStart / totalScrollDistance) * (100 + fadePercent);
				
				return Math.max(0, Math.min(100 + fadePercent, progress));
			}
		}

		function applyFadeEffect(element, direction, fadeWidth, progress) {
			if (!fadeWidth || fadeWidth === 0) {
				element.style.maskImage = 'none';
				element.style.webkitMaskImage = 'none';
				return;
			}

			// Calculate the position of the transition edge based on progress
			const percent = Math.max(0, progress);
			let gradient;
			
			switch (direction) {
				case 'left':
					// Fade moves from left to right - revealed area on left, fade at edge, hidden on right
					gradient = 'linear-gradient(to right, ' +
						'black 0%, ' +
						'black calc(' + percent + '% - ' + fadeWidth + 'px), ' +
						'transparent ' + percent + '%, ' +
						'transparent 100%)';
					break;
				case 'right':
					// Fade moves from right to left - revealed area on right, fade at edge, hidden on left
					gradient = 'linear-gradient(to left, ' +
						'black 0%, ' +
						'black calc(' + percent + '% - ' + fadeWidth + 'px), ' +
						'transparent ' + percent + '%, ' +
						'transparent 100%)';
					break;
				case 'top':
					// Fade moves from top to bottom - revealed area on top, fade at edge, hidden on bottom
					gradient = 'linear-gradient(to bottom, ' +
						'black 0%, ' +
						'black calc(' + percent + '% - ' + fadeWidth + 'px), ' +
						'transparent ' + percent + '%, ' +
						'transparent 100%)';
					break;
				case 'bottom':
					// Fade moves from bottom to top - revealed area on bottom, fade at edge, hidden on top
					gradient = 'linear-gradient(to top, ' +
						'black 0%, ' +
						'black calc(' + percent + '% - ' + fadeWidth + 'px), ' +
						'transparent ' + percent + '%, ' +
						'transparent 100%)';
					break;
				default:
					gradient = 'linear-gradient(to right, ' +
						'black 0%, ' +
						'black calc(' + percent + '% - ' + fadeWidth + 'px), ' +
						'transparent ' + percent + '%, ' +
						'transparent 100%)';
			}
			
			element.style.maskImage = gradient;
			element.style.webkitMaskImage = gradient;
		}

		function updateBlocks() {
			blocks.forEach(function(block) {
				const topImage = block.querySelector('.top-image');
				if (!topImage) {
					return;
				}

				const direction = block.dataset.revealDirection || 'left';
				const fadeWidth = parseInt(block.dataset.transitionFadeWidth) || 100;
				const progress = calculateRevealProgress(block, fadeWidth);
				
				const clipPath = getClipPath(direction, Math.min(100, progress));
				topImage.style.clipPath = clipPath;
				topImage.style.webkitClipPath = clipPath;
				
				// Apply fade effect at the transition edge
				applyFadeEffect(topImage, direction, fadeWidth, progress);
			});
			
			ticking = false;
		}

		function onScroll() {
			if (!ticking) {
				window.requestAnimationFrame(updateBlocks);
				ticking = true;
			}
		}

		function setupImageContainers() {
			blocks.forEach(function(block) {
				const wrapper = block.querySelector('.images-wrapper');
				const bottomImage = block.querySelector('.bottom-image');
				
				if (wrapper && bottomImage) {
					function setAspectRatio() {
						if (bottomImage.naturalWidth && bottomImage.naturalHeight) {
							const aspectRatio = (bottomImage.naturalHeight / bottomImage.naturalWidth) * 100;
							wrapper.style.paddingBottom = aspectRatio + '%';
							wrapper.setAttribute('data-aspect-ratio', 'true');
						}
					}
					
					if (bottomImage.complete) {
						setAspectRatio();
					} else {
						bottomImage.addEventListener('load', setAspectRatio);
					}
				}
			});
		}

		// Initialize
		setupImageContainers();
		
		// Wait for all images to load before first update
		const allImages = [];
		blocks.forEach(function(block) {
			const images = block.querySelectorAll('img');
			images.forEach(function(img) {
				allImages.push(img);
			});
		});
		
		let loadedCount = 0;
		const totalCount = allImages.length;
		
		function checkAllLoaded() {
			loadedCount++;
			if (loadedCount === totalCount) {
				setTimeout(updateBlocks, 100);
			}
		}
		
		allImages.forEach(function(img) {
			if (img.complete) {
				checkAllLoaded();
			} else {
				img.addEventListener('load', checkAllLoaded);
			}
		});
		
		if (totalCount === 0 || loadedCount === totalCount) {
			setTimeout(updateBlocks, 100);
		}

		window.addEventListener('scroll', onScroll, { passive: true });

		let resizeTimeout;
		window.addEventListener('resize', function() {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(function() {
				setupImageContainers();
				updateBlocks();
			}, 150);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initScrollReveal);
	} else {
		initScrollReveal();
	}
})();