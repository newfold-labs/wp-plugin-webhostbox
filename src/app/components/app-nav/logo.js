import { Title } from '@newfold/ui-component-library';

import { delay } from 'lodash';
import { ReactComponent as OBLogo } from '../../../../assets/svg/webhostbox.svg';

const Mark = () => {
	const defocus = () => {
		const button = document.querySelector( '.logo-mark' );
		delay( () => {
			if ( null !== button ) {
				button.blur();
			}
		}, 500 );
	};

	const brandLogo = () => {
		return <OBLogo className="wpwhb-logo" />
	}

	return (
		<a
			className="logo-mark"
			style={ { display: 'block', width: '160px', height: 'auto' } }
			onMouseUp={ defocus }
			href="#/home"
		>
			{brandLogo()}
		</a>
	);
};

const Logo = () => {
	return (
		<div className="wpwhb-logo-wrap" style={ { paddingTop: '12px', paddingBottom: '12px' } }>
			<Mark />
			<Title as="h2" className="screen-reader-text">
				{ __( 'Web WordPress Plugin', 'wp-plugin-webhostbox' ) }
			</Title>
		</div>
	);
};

export default Logo;
