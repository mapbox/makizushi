'use strict';

module.exports = {
	root: true,
	extends: 'wikimedia/server',
	parserOptions: {
		ecmaVersion: 2018
	},
	rules: {
		'no-underscore-dangle': 'off'
	}
};
