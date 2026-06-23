/**
 * Handle active state for WordPress admin submenu items
 * based on React Router hash-based navigation
 */

if (typeof window !== 'undefined') {
	window.addEventListener('DOMContentLoaded', () => {
		function updateActiveMenuItem() {
			const hash = window.location.hash.replace('#', '') || '/home';
			
			// Remove all current classes from submenu items
			const submenuItems = document.querySelectorAll('#toplevel_page_webhostbox .wp-submenu li');
			submenuItems.forEach(item => item.classList.remove('current'));
			
			// Map hash to menu item
			const menuMap = {
				'/home': 'webhostbox#/home',
				'/marketplace': 'webhostbox#/marketplace',
				'marketplace/services': 'webhostbox#/marketplace',
				'marketplace/featured': 'webhostbox#/marketplace',
				'marketplace/ecommerce': 'webhostbox#/marketplace',
				'marketplace/seo': 'webhostbox#/marketplace',
				'marketplace/themes': 'webhostbox#/marketplace',
				'marketplace/all': 'webhostbox#/marketplace',
				'/settings': 'webhostbox#/settings',
				'/settings/performance': 'webhostbox#/settings',
			};
			
			// Find the matching menu item and add current class
			const menuSlug = menuMap[hash] || menuMap['/home'];
			const targetLink = document.querySelector(`#toplevel_page_webhostbox .wp-submenu li a[href*="${menuSlug}"]`);
			
			if (targetLink && targetLink.parentElement) {
				targetLink.parentElement.classList.add('current');
			}
		}
		
		// Update on page load
		setTimeout(updateActiveMenuItem, 100);
		
		// Update on hash change (for React Router navigation)
		window.addEventListener('hashchange', updateActiveMenuItem);
		
		// Update when clicking submenu items
		const submenuLinks = document.querySelectorAll(`#toplevel_page_webhostbox .wp-submenu a`);
		submenuLinks.forEach(link => {
			link.addEventListener('click', () => {
				setTimeout(updateActiveMenuItem, 100);
			});
		});

		// Listen for clicks on React app navigation links
		document.addEventListener('click', (e) => {
			// Check if clicked element or its parent is a navigation link
			const target = e.target.closest('a[href^="#/"], .wpwhb-app-navitem');
			if (target) {
				setTimeout(updateActiveMenuItem, 50);
			}
		});
	});
}

