'use strict';

const test = require( 'tap' ).test;
const color = require( '../lib/color' );

test( 'hexToLuminance', function ( t ) {
	t.ok( Math.abs( color.private.hexToLuminance( 'fa7014' ) - 0.3196 ) < 0.0001 );
	t.end();
} );

test( 'hexToSrgb', function ( t ) {
	t.same( color.private.hexToSrgb( '0077ff' ), [ 0, 119, 255 ] );
	t.end();
} );

test( 'hexToTint', function ( t ) {
	t.same( { h: [ 0, 0 ], s: [ 0, 0 ], l: [ 1, 1 ] }, color.private.hexToTint( 'ffffff' ) );
	t.end();
} );

test( 'sRgbToLinear', function ( t ) {
	t.ok( Math.abs( color.private.sRgbToLinear( 127 ) - 0.2122 ) < 0.0001 );
	t.end();
} );

test( 'contrastingFill', function ( t ) {
	t.same( { h: [ 0, 0 ], s: [ 0, 0 ], l: [ 1, 1 ] }, color.contrastingFill( '000000' ) );
	t.notSame( { h: [ 0, 0 ], s: [ 0, 0 ], l: [ 0, 0 ] }, color.contrastingFill( 'ffffff' ) );
	t.end();
} );
