var maki = require('maki');
var fs = require('fs');
var mapnik = require('mapnik');
var makiRenders = maki.dirname + '/icons/';
var scaleSizes = {
    's': 0.75,
    'm': 0.85,
    'l': 1,
    's@2x': 1.5,
    'm@2x': 1.7,
    'l@2x': 2
};

module.exports = {};

function createScaledSVGBuffer(scale) {
    return fs.readdirSync(makiRenders).reduce(function(mem, file) {
        var img = new mapnik.Image.fromSVGSync(makiRenders + file, {
            scale: scale
        });
        img.premultiplySync();
        mem[file.replace('.svg', '')] = img;
        return mem;
    }, {});
}

for (var size in scaleSizes) {
    if (scaleSizes.hasOwnProperty(size)) {
        module.exports[size] = createScaledSVGBuffer(scaleSizes[size]);
    }
}
