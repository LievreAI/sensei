/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import { useSetupWizardStep } from '../data/use-setup-wizard-step';
import useActionsNavigator, {
	actionMinimumTimer,
} from './use-actions-navigator';

const featureLabels = {
	woocommerce: __( 'Adding WooCommerce', 'sensei-lms' ),
	'sensei-certificates': __( 'Adding certificates', 'sensei-lms' ),
};

const senseiHomePath = '/wp-admin/admin.php?page=sensei-home';

/**
 * Get actions for the features to be installed.
 *
 * @param {Object}   stepData          The features step data.
 * @param {string[]} stepData.selected Selected features to be installed.
 * @param {Object[]} stepData.options  Features available to install.
 *
 * @return {Object} Actions to install the selected features.
 */
const getFeatureActions = ( { selected, options } ) => {
	// Filter not activated features.
	const featuresToInstall = selected.filter( ( slug ) =>
		options.some(
			( option ) => option.product_slug === slug && ! option.is_activated
		)
	);

	return featuresToInstall.map( ( slug ) => ( {
		label: featureLabels[ slug ],
		action: () =>
			new Promise( ( resolve ) => {
				apiFetch( {
					path: '/sensei-internal/v1/sensei-extensions/install',
					method: 'POST',
					data: {
						plugin: slug,
					},
				} ).then( () => {
					resolve();
				} );
			} ),
	} ) );
};

/**
 * Features step for Setup Wizard.
 */
const Features = () => {
	const { stepData } = useSetupWizardStep( 'features' );

	// Create list of actions.
	const actions = useMemo(
		() => [
			{
				label: __( 'Preparing your tailored experience', 'sensei-lms' ),
			},
			...getFeatureActions( stepData ),
			{
				label: __( 'Taking you to your new Sensei Home', 'sensei-lms' ),
				action: () =>
					new Promise( ( resolve ) => {
						setTimeout( () => {
							window.location.href = senseiHomePath;
							resolve();
						}, actionMinimumTimer );
					} ),
			},
		],
		[ stepData ]
	);

	const { percentage, label } = useActionsNavigator( actions );

	return (
		<div className="sensei-setup-wizard__features-step">
			<div
				className="sensei-setup-wizard__features-status"
				role="status"
				aria-live="polite"
			>
				<div className="sensei-setup-wizard__fade-in" key={ label }>
					{ label }
				</div>
			</div>

			<div className="sensei-setup-wizard__features-progress-bar">
				<div
					role="progressbar"
					aria-label={ __(
						'Sensei Onboarding Progress',
						'sensei-lms'
					) }
					aria-valuenow={ percentage }
					className="sensei-setup-wizard__features-progress-bar-filled"
					style={ { width: `${ percentage }%` } }
				/>
			</div>
		</div>
	);
};

export default Features;
