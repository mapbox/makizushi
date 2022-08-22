const blend = require('@kartotherian/blend');

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

module.exports = { contrastingFill };
