'use strict';

const blend = require( '@mapbox/blend' ),
	errcode = require( 'err-code' );

const markerCache = require( './cache' );
const { contrastingFill } = require( './color' );

const offsets = {
	s: { x: 5, y: 4 },
	m: { x: 8, y: 6 },
	l: { x: 8, y: 9 },
	's@2x': { x: 10, y: 9 },
	'm@2x': { x: 16, y: 12 },
	'l@2x': { x: 15, y: 17 }
};

const aliases = {
	'america-football': 'american-football',
	chemist: 'pharmacy',
	camera: 'attraction',
	disability: 'wheelchair',
	'emergency-telephone': 'emergency-phone',
	industrial: 'industry',
	'land-use': 'landuse',
	'london-underground': 'rail-metro',
	minefield: 'danger',
	mobilephone: 'mobile-phone',
	'oil-well': 'industry',
	park2: 'park-alt1',
	'polling-place': 'post',
	'rail-above': 'rail',
	'rail-underground': 'rail-metro',
	toilets: 'toilet'
};

/**
 * Load & render a marker.
 *
 * @param {Object} options
 * @param {Function} callback
 */
function renderMaki( options, callback ) {
	const base = options.base + '-' + options.size + ( options.retina ? '@2x' : '' );
	const size = options.size;
	let symbol;

	if ( options.symbol ) {
		symbol = options.symbol + '-' + options.size + ( options.retina ? '@2x' : '' );
		if (!markerCache.symbol[symbol]) {
			// An unknown symbol might as well be a typo. No reason to fail hard. We can still
			// render something meaningful.
			symbol = undefined;
		}
	}

	if ( !base || !size ) {
		callback( errcode( 'Marker is invalid because it lacks base or size.', 'EINVALID' ) );
		return;
	}

	if ( !markerCache.base[ base ] ) {
		callback( errcode( 'Marker base "' + options.base + '" is invalid.', 'EINVALID' ) );
		return;
	}

	// Base marker gets tint applied.
	const parts = [ {
		buffer: markerCache.base[ base ],
		tint: options.parsedTint
	} ];

	// If symbol is present, find correct offset (varies by marker size).
	if ( symbol ) {
		parts.push( {
			buffer: markerCache.symbol[ symbol ],
			tint: options.symbolTint,
			...offsets[ size + ( options.retina ? '@2x' : '' ) ]
		} );
	}

	// Add mask layer.
	parts.push( { buffer: markerCache.mask[ base ] } );

	// Extract width and height from the IHDR. The IHDR chunk must appear
	// first, so the location is always fixed.
	const width = markerCache.base[ base ].readUInt32BE( 16 ),
		height = markerCache.base[ base ].readUInt32BE( 20 );

	// Combine base, (optional) symbol, to supply the final marker.
	blend( parts, {
		format: 'png',
		quality: 256,
		width: width,
		height: height
	}, function ( err, data ) {
		if ( err ) {
			return callback( err );
		}
		return callback( null, data );
	} );
}

/**
 * Given a marker object like
 *
 * { base, tint, symbol, name }
 *
 * Call callback with buffer.
 *
 * @param {Object} options
 * @param {Function} callback
 */
function getMarker( options, callback ) {
	// prevent .parsedTint from being attached to options
	options = { ...options };
	if ( options.tint ) {
		// Expand hex shorthand (3 chars) to 6, e.g. 333 => 333333.
		// This is not done upstream in `node-tint` as some such
		// shorthand cannot be disambiguated from other tintspec strings,
		// e.g. 123 (rgb shorthand) vs. 123 (hue).
		if ( options.tint.length === 3 ) {
			options.tint =
                options.tint[ 0 ] + options.tint[ 0 ] +
                options.tint[ 1 ] + options.tint[ 1 ] +
                options.tint[ 2 ] + options.tint[ 2 ];
		}
		options.parsedTint = blend.parseTintString( options.tint );
		options.symbolTint = contrastingFill( options.tint );
	}

	if ( options.symbol in aliases ) {
		options.symbol = aliases[ options.symbol ];
	}

	renderMaki( options, callback );
}

module.exports = getMarker;
