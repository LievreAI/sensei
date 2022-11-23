/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';
import {
	PluginDocumentSettingPanel,
	PluginSidebar,
	PluginSidebarMoreMenuItem,
} from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { dispatch, useSelect } from '@wordpress/data';
import { Slot } from '@wordpress/components';
import domReady from '@wordpress/dom-ready';

/**
 * Internal dependencies
 */
import CoursePricingPromoSidebar from './course-pricing-promo-sidebar';
import CourseAccessPeriodPromoSidebar from './course-access-period-promo-sidebar';
import CourseThemeSidebar from './course-theme/course-theme-sidebar';
import CourseVideoSidebar from './course-video-sidebar';
import CourseGeneralSidebar from './course-general-sidebar';
import SenseiIcon from '../../icons/logo-tree.svg';

export const pluginSidebarHandle = 'sensei-lms-course-settings-sidebar';
export const pluginDocumentHandle = 'sensei-lms-document-settings-sidebar';

export const CourseSidebar = () => {
	/**
	 * Filter to show or hide course pricing upsell component.
	 *
	 * @since $$next-version$$
	 *
	 * @hook  senseiCoursePricingHide This hook allows to pass a boolean value for hiding course pricing upsell.
	 * @return {boolean} 			  Hide the component.
	 */
	const hideCoursePricing = applyFilters( 'senseiCoursePricingHide', false );

	/**
	 * Filter to show or hide course expiration upsell component.
	 *
	 * @since $$next-version$$
	 *
	 * @hook  senseiCourseAccessPeriodHide This hook allows to pass a boolean value for hiding course expiration (access period) upsell.
	 * @return {boolean} 				   Hide the component.
	 */
	const hideAccessPeriod = applyFilters(
		'senseiCourseAccessPeriodHide',
		false
	);
	return (
		<>
			<PluginSidebarMoreMenuItem
				target={ pluginSidebarHandle }
				icon={ <SenseiIcon height="20" width="20" color="#43AF99" /> }
			>
				{ __( 'Sensei Settings', 'sensei-lms' ) }
			</PluginSidebarMoreMenuItem>
			<PluginSidebar
				name={ pluginSidebarHandle }
				title={ __( 'Sensei Settings', 'sensei-lms' ) }
				icon={ <SenseiIcon height="20" width="20" color="#43AF99" /> }
			>
				{ ! hideCoursePricing && <CoursePricingPromoSidebar /> }
				{ ! hideAccessPeriod && <CourseAccessPeriodPromoSidebar /> }
				<Slot name="SenseiCourseSidebar" />
				<CourseThemeSidebar />
				<CourseVideoSidebar />
				<CourseGeneralSidebar />
			</PluginSidebar>
		</>
	);
};

export const SenseiSettingsDocumentSidebar = () => {
	const isSenseiEditorPanelOpen = useSelect( ( select ) => {
		return select( 'core/edit-post' ).isEditorPanelOpened(
			`${ pluginDocumentHandle }/${ pluginDocumentHandle }`
		);
	} );
	if ( isSenseiEditorPanelOpen ) {
		// when 'Sensei Settings' is clicked, isSenseiEditorPanelOpen returns true, so we open the 'Sensei Settings'
		// plugin sidebar and then close the 'Sensei Settings' panel which sets isSenseiEditorPanelOpen back to false.
		dispatch( 'core/edit-post' ).openGeneralSidebar(
			`${ pluginSidebarHandle }/${ pluginSidebarHandle }`
		);
		dispatch( 'core/edit-post' ).toggleEditorPanelOpened(
			`${ pluginDocumentHandle }/${ pluginDocumentHandle }`
		);
	}
	return (
		<PluginDocumentSettingPanel
			name={ pluginDocumentHandle }
			title={ __( 'Sensei Settings', 'sensei-lms' ) }
			className="sensei-plugin-document-setting-panel"
		></PluginDocumentSettingPanel>
	);
};
