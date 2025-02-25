/**
 * External dependencies
 */
import { render } from '@testing-library/react';

/**
 * WordPress dependencies
 */
import { Tooltip } from '@wordpress/components';

/**
 * Internal dependencies
 */
import TaskItem from './task-item';

jest.mock( '@wordpress/components' );

describe( '<TaskItem />', () => {
	it( 'Should render an anchor when item is not completed', () => {
		const { container } = render( <TaskItem url="#" /> );

		const renderedTag = container.querySelector(
			'.sensei-home-tasks__link'
		).tagName;

		expect( renderedTag ).toEqual( 'A' );
	} );

	it( 'Should render a span when item is completed', () => {
		const { container } = render( <TaskItem url="#" done /> );

		const renderedTag = container.querySelector(
			'.sensei-home-tasks__link'
		).tagName;

		expect( renderedTag ).toEqual( 'SPAN' );
	} );

	it( 'Should render an external icon when externalIcon is true', () => {
		const { container } = render(
			<TaskItem
				url="www.example.com/something?this=false&external=true"
				showExternalIcon
			/>
		);

		const externalIcon = container.querySelector(
			'.sensei-home-tasks__external-icon'
		);

		expect( externalIcon ).not.toBeNull();
	} );

	it( 'Should not render external icon when externalIcon prop is not set', () => {
		const { container } = render(
			<TaskItem url="www.example.com/something?this=false" />
		);

		const externalIcon = container.querySelector(
			'.sensei-home-tasks__external-icon'
		);

		expect( externalIcon ).toBeNull();
	} );

	it( 'Should not render external icon when task is not active', () => {
		const { container } = render(
			<TaskItem
				url="www.example.com/something?this=false&external=true"
				showExternalIcon
				disabled
			/>
		);

		const externalIcon = container.querySelector(
			'.sensei-home-tasks__external-icon'
		);

		expect( externalIcon ).toBeNull();
	} );

	it( 'Should render a span when item is disabled', () => {
		const { container } = render( <TaskItem url="#" disabled /> );

		const renderedTag = container.querySelector(
			'.sensei-home-tasks__link'
		).tagName;

		expect( renderedTag ).toEqual( 'SPAN' );
	} );

	it( 'Should render a task with the info', () => {
		Tooltip.mockImplementation( ( { text } ) => text );

		const { queryByText } = render( <TaskItem url="#" info="Info text" /> );

		expect( queryByText( 'Info text' ) ).toBeTruthy();
	} );
} );
