import { render, fireEvent } from '@testing-library/react';

import QueryStringRouter, { Route } from '../query-string-router';
import { updateRouteURL } from '../query-string-router/url-functions';
import Features from './index';

// Mock features data.
jest.mock( '../data/use-setup-wizard-step', () => {
	const stepData = {
		selected: [ 'installed' ],
		options: [
			{ slug: 'test-1', title: 'Test 1' },
			{ slug: 'test-2', title: 'Test 2' },
			{ slug: 'installed', title: 'Test 2', status: 'installed' },
		],
	};

	return {
		useSetupWizardStep: () => ( {
			stepData,
			submitStep: ( data, { onSuccess } ) => {
				// Simulate success selecting only one item.
				if ( data.selected.length === 1 ) {
					onSuccess();
				}
			},
		} ),
	};
} );

// Mock features polling.
jest.mock( './use-features-polling', () => () => ( {
	selected: [ 'test-1' ],
	options: [ { slug: 'test-1', title: 'Test 1' } ],
} ) );

describe( '<Features />', () => {
	afterEach( () => {
		// Clear URL param.
		updateRouteURL( 'step', '' );
	} );

	it( 'Should not check installed features', () => {
		const { container } = render(
			<QueryStringRouter paramName="step">
				<Features />
			</QueryStringRouter>
		);

		expect( container.querySelector( 'input:checked' ) ).toBeFalsy();
	} );

	it( 'Should continue to the ready step when nothing is selected', () => {
		const { container, queryByText } = render(
			<QueryStringRouter paramName="step">
				<Route route="features" defaultRoute>
					<Features />
				</Route>
				<Route route="ready">Ready</Route>
			</QueryStringRouter>
		);

		fireEvent.click( queryByText( 'Continue' ) );

		expect( container.firstChild ).toMatchInlineSnapshot( 'Ready' );
	} );

	it( 'Should continue to the ready step when the user chooses to install later', () => {
		const { container, queryByText } = render(
			<QueryStringRouter paramName="step">
				<Route route="features" defaultRoute>
					<Features />
				</Route>
				<Route route="ready">Ready</Route>
			</QueryStringRouter>
		);

		// Check the first feature.
		fireEvent.click( container.querySelector( 'input[type="checkbox"]' ) );

		// Continue to confirmation.
		fireEvent.click( queryByText( 'Continue' ) );

		// Choose to install later.
		fireEvent.click( queryByText( "I'll do it later" ) );

		expect( container.firstChild ).toMatchInlineSnapshot( 'Ready' );
	} );

	it( 'Should continue to the confirmation and then installation feedback when some feature is selected', () => {
		const { container, queryByText } = render(
			<QueryStringRouter>
				<Features />
			</QueryStringRouter>
		);

		// Check the first feature.
		fireEvent.click( container.querySelector( 'input[type="checkbox"]' ) );

		// Continue to confirmation.
		fireEvent.click( queryByText( 'Continue' ) );

		// Start the installation.
		fireEvent.click( queryByText( 'Install now' ) );

		expect(
			container.querySelector( '.sensei-onboarding__icon-status' )
		).toBeTruthy();
	} );

	it( 'Should continue to the confirmation and then simulate an error installing 2 items', () => {
		const { container, queryByText } = render(
			<QueryStringRouter>
				<Features />
			</QueryStringRouter>
		);

		// Check the 2 features.
		const checkboxes = container.querySelectorAll(
			'input[type="checkbox"]'
		);
		fireEvent.click( checkboxes[ 0 ] );
		fireEvent.click( checkboxes[ 1 ] );

		// Submit data.
		fireEvent.click( queryByText( 'Continue' ) );

		// Should not open the modal because the error.
		expect( queryByText( 'Install now' ) ).toBeFalsy();
	} );
} );
