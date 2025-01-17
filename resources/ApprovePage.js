const convertTimestamps = ( timestamp = null ) => {
	try {
		const moment = require( 'moment' );
		$( '.convert-timestamp' ).each( function () {
			const $element = $( this );
			const unixTimestamp = parseInt( timestamp || $element.attr( 'data-timestamp' ) );
			const momentDate = moment.unix( unixTimestamp ).utc();
			$element.text( momentDate.fromNow() );
		} );
	} catch ( error ) {
		console.error( 'Error converting timestamps:', error );
	}
};

const handleApprovalResponse = ( approve, data ) => {
	const elements = [
		'#unapproveButton',
		'#approveButton',
		'.approved-status-text',
		'.approval-status-tooltip',
		'.approver-details',
		'approval-dropdown'
	];
	const $badgeElement = $( '.approval-status-badge' );

	$badgeElement.toggleClass( 'approved-badge' );
	$badgeElement.toggleClass( 'unapproved-badge' );
	$( '.dropdown-icon' ).toggleClass( 'approved' );

	elements.forEach( ( selector ) => $( selector ).toggleClass( 'display-none' ) );

	if ( approve ) {
		const { approver, approvalTimestamp } = data;
		$( '.approver-name' ).text( approver );
		convertTimestamps( approvalTimestamp );
	}
};

const sendApprovalRequest = ( approve ) => {
	const restClient = new mw.Rest();
	const revisionId = mw.config.get( 'wgRevisionId' );
	const endpoint = `/page-approvals/v0/revision/${ revisionId }/${ approve ? 'approve' : 'unapprove' }`;

	restClient.post( endpoint )
		.then( ( data ) => {
			handleApprovalResponse( approve, data );
		} )
		.catch( ( error, data ) => {
			console.error( 'API request failed:', error );
			mw.notify( data.xhr.responseJSON.message || 'API request failed: ${ error }', { type: 'error' } );
		} );
};

$( '#approveButton, #unapproveButton' ).on( 'click', function () {
	sendApprovalRequest( $( this ).is( '#approveButton' ) );
} );

$( '.approval-status-badge:not(.approval-dropdown)' ).on( 'click', ( e ) => {
	e.stopPropagation();
	$( '.approval-dropdown' ).toggleClass( 'display-none' );
} );

$( document ).on( 'click', ( e ) => {
	if ( !$( e.target ).closest( '.approval-dropdown, .approval-status-badge' ).length ) {
		$( '.approval-dropdown' ).addClass( 'display-none' );
	}
} );

$( convertTimestamps() );
