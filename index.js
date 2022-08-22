var fs = require('fs'),
    blend = require('@kartotherian/blend'),
    errcode = require('err-code');

var markerCache = require('./cache');

var offsets = {
        's': {x:5,y:4},
        'm': {x:8,y:6},
        'l': {x:8,y:9},
        's@2x': {x:10,y:9},
        'm@2x': {x:16,y:12},
        'l@2x': {x:15,y:17}
    };
var sizes = { s: 11, m: 15, l: 20 },
    makiRenders = __dirname + '/renders/';

var aliases = {
    'america-football': 'american-football',
    'chemist': 'pharmacy',
    'camera': 'attraction',
    'disability': 'wheelchair',
    'emergency-telephone': 'emergency-phone',
    'industrial': 'industry',
    'land-use': 'landuse',
    'london-underground': 'rail-metro',
    'minefield': 'danger',
    'mobilephone': 'mobile-phone',
    'oil-well': 'industry',
    'park2': 'park',
    'polling-place': 'post',
    'rail-above': 'rail',
    'rail-underground': 'rail-metro',
    'toilets': 'toilet'
};

var makiAvailable = fs.readdirSync(makiRenders)
    .reduce(function(mem, file) {
        mem[file.replace('.png', '')] = true;
        return mem;
    }, {});

module.exports = getMarker;

// White
const lightColor = 'ffffff';
// Base10
const darkColor = '202122';

/**
 * @param {string} color 6-digit hex color like '7e7e7e'
 * @returns {[integer, integer, integer]} sRGB color with 0-255 integer components.
 */
function hexToSrgb(color) {
    return color
        .match(/\w\w/g)
        .map((value) => parseInt(value, 16));
}

/**
 * Improve on blend.parseTintString, to pass through the lightness component
 * without the bad contrast math.
 *
 * @param {string} color 6-digit hex color
 * @returns {object} HSL with [0-1] float components.  Each term is a redundant
 *   pair because the mapnik library expects the second terms to be a contrasting
 *   color.  We simply repeat the color twice.
 */
function hexToTint(color) {
    const [r, g, b] = hexToSrgb(color);
    const hsl = blend.rgb2hsl(r, g, b);
    return {
        h: [hsl[0], hsl[0]],
        s: [hsl[1], hsl[1]],
        l: [hsl[2], hsl[2]],
    };
}

const lightTint = hexToTint(lightColor);
const darkTint = hexToTint(darkColor);

/**
 * Transform an sRGB component to the vector expected by the relative luminance formula.
 *
 * @param {integer} value [0-255] color component
 * @returns {number} [0-1] float with gamma compression reversed
 */
function sRgbToLinear(value) {
    const f = value / 255.0;
    return (f <= 0.03928) ?
        f / 12.92 :
        Math.pow((f + 0.055) / 1.055, 2.4);
}

/**
 * Calculate the relative luminance of a color
 *
 * @param {string} color as 6-digit hex
 * @returns {number} relative luminance, [0-1]
 */
function hexToLuminance(color) {
    const [R, G, B] = hexToSrgb(color)
        .map(sRgbToLinear);

    // Factors from https://www.w3.org/TR/WCAG20/#relativeluminancedef
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// Threshold given by solving for L giving the same constrast ratio against the
// light and dark symbol colors , using this formula for contrast:
//   https://www.w3.org/TR/WCAG20/#contrast-ratiodef
//   (L1 + 0.05) / (L2 + 0.05)
// Using symbol fills of Base10 and white, the balance point is at about L = 0.211
const luminanceThreshold =
    Math.sqrt((hexToLuminance(lightColor) + 0.05) * (hexToLuminance(darkColor) + 0.05)) - 0.05;

/**
 * @param {string} backgroundColor as 6-digit hex
 * @returns {object} Tint object for the symbol color giving the best contrast
 *   with the background.
 */
function contrastingFill(backgroundColor) {
    return (hexToLuminance(backgroundColor) > luminanceThreshold) ?
        darkTint : lightTint;
}

/**
 * Given a marker object like
 *
 * { base, tint, symbol, name }
 *
 * Call callback with buffer.
 *
 * @param {object} options
 * @param {function} callback
 */
function getMarker(options, callback) {
    // prevent .parsedTint from being attached to options
    options = {...options};
    if (options.tint) {
        // Expand hex shorthand (3 chars) to 6, e.g. 333 => 333333.
        // This is not done upstream in `node-tint` as some such
        // shorthand cannot be disambiguated from other tintspec strings,
        // e.g. 123 (rgb shorthand) vs. 123 (hue).
        if (options.tint.length === 3) {
            options.tint =
                options.tint[0] + options.tint[0] +
                options.tint[1] + options.tint[1] +
                options.tint[2] + options.tint[2];
        }
        options.parsedTint = blend.parseTintString(options.tint);
        options.symbolTint = contrastingFill(options.tint)
    }

    if (options.symbol in aliases) {
        options.symbol = aliases[options.symbol];
    }

    if (!options.symbol ||
        (options.symbol && options.symbol.length === 1) ||
        (options.symbol.length === 2 && !isNaN(parseInt(options.symbol)))) {
        loadCached(options, callback);
    } else {
        loadMaki(options, callback);
    }
}

/**
 * Load & composite a marker from the maki icon set.
 *
 * @param {object} options
 * @param {function} callback
 */
function loadMaki(options, callback) {
    var base = options.base + '-' + options.size + (options.retina ? '@2x' : ''),
        size = options.size,
        symbol = options.symbol + '-' + sizes[size] + (options.retina ? '@2x' : '');

    if (!base || !size) {
        return callback(errcode('Marker is invalid because it lacks base or size.', 'EINVALID'));
    }

    if (!makiAvailable[symbol]) {
        return callback(errcode('Marker symbol "' + options.symbol + '" is invalid.', 'EINVALID'));
    }

    fs.readFile(makiRenders + symbol + '.png', function(err, data) {
        if (err) return callback(new Error('Marker "' + JSON.stringify(options) + '" is invalid because the symbol is not found.'));

        // Base marker gets tint applied.
        var parts = [{
            buffer: markerCache.base[base],
            tint: options.parsedTint
        }];

        // If symbol is present, find correct offset (varies by marker size).
        if (symbol) {
            parts.push({
                buffer: data,
                tint: options.symbolTint,
                ...offsets[size + (options.retina ? '@2x' : '')]
            });
        }

        // Add mask layer.
        parts.push({
            buffer: markerCache.mask[base]
        });

        // Extract width and height from the IHDR. The IHDR chunk must appear
        // first, so the location is always fixed.
        var width = markerCache.base[base].readUInt32BE(16),
            height = markerCache.base[base].readUInt32BE(20);

        // Combine base, (optional) symbol, to supply the final marker.
        blend(parts, {
            format: 'png',
            quality: 256,
            width: width,
            height: height
        }, function(err, data) {
            if (err) return callback(err);
            return callback(null, data);
        });
    });
}

/**
 * Load & generate a cached [a-z0-9] marker.
 *
 * @param {object} options
 * @param {function} callback
 */
function loadCached(options, callback) {
    var base = options.base + '-' + options.size + (options.retina ? '@2x' : ''),
        size = options.size,
        symbol;

    if (options.symbol) {
        symbol = options.symbol + '-' + options.size + (options.retina ? '@2x' : '');
    }

    if (!base || !size) {
        return callback(errcode('Marker is invalid because it lacks base or size.', 'EINVALID'));
    }

    if (!markerCache.base[base]) {
        return callback(errcode('Marker base "' + options.base + '" is invalid.', 'EINVALID'));
    }

    if (symbol && !markerCache.symbol[symbol]) {
        return callback(errcode('Marker symbol "' + options.symbol + '" is invalid.', 'EINVALID'));
    }

    // Base marker gets tint applied.
    var parts = [{
        buffer: markerCache.base[base],
        tint: options.parsedTint
    }];

    // If symbol is present, find correct offset (varies by marker size).
    if (symbol) {
        parts.push({
            buffer: markerCache.symbol[symbol],
            tint: options.symbolTint,
            ...offsets[size + (options.retina ? '@2x' : '')]
        });
    }

    // Add mask layer.
    parts.push({ buffer:markerCache.mask[base] });

    // Extract width and height from the IHDR. The IHDR chunk must appear
    // first, so the location is always fixed.
    var width = markerCache.base[base].readUInt32BE(16),
        height = markerCache.base[base].readUInt32BE(20);

    // Combine base, (optional) symbol, to supply the final marker.
    blend(parts, {
        format: 'png',
        quality: 256,
        width: width,
        height: height
    }, function(err, data) {
        if (err) return callback(err);
        return callback(null,  data);
    });
}
