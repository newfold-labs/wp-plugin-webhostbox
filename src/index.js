/* Use PHP-provided URL to current version's build directory instead of root */
import './webpack-public-path';

// Initialize portal registry before anything else
import './portalRegistry';

// Initialize menu active state handler
import './app/util/menuActiveState';

import App from './app';
import domReady from '@wordpress/dom-ready';
import { createRoot, render } from '@wordpress/element';

const WP_ADM_PAGE_ROOT_ELEMENT = 'wpwhb-app';
const W_ASCI = `Welcome to WebHostBox!`;
console.log( W_ASCI );

const WPPWRender = () => {
	const DOM_ELEMENT = document.getElementById( WP_ADM_PAGE_ROOT_ELEMENT );
	if (null !== DOM_ELEMENT) {
        console.log( `Rendering WebHostBox plugin into #${ WP_ADM_PAGE_ROOT_ELEMENT }` );
        if ('undefined' !== typeof createRoot) {
            // WP 6.2+ only
            createRoot(DOM_ELEMENT).render(<App/>);
        } else if ('undefined' !== typeof render) {
            render(<App/>, DOM_ELEMENT);
        }
    }
};

domReady( WPPWRender );
