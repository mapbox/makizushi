[![Build Status](https://travis-ci.org/mapbox/makizushi.svg)](https://travis-ci.org/mapbox/makizushi)

# makizushi

Professional [Maki](https://www.mapbox.com/maki/) chef. This module produces custom markers based
on the Maki icon set, in custom sizes and colors. To do this, it chooses, tints, and flattens parts
of the image, using [node-blend](https://github.com/mapbox/node-blend).

## install

    npm install --save @mapbox/makizushi

## api

### `makizushi(options, callback)`

Options:

* `tint`: a color in rgb or rrggbb
* `symbol`: a Maki symbol name, or a number from 0 to 99
* `size`: one of `s`, `m`, or `l`
* `base`: `"pin"`
* `retina`: `true` or `false`, `true` will return a 2x resolution image

Callback: `(err, data)` in which err is an error if any, and data is a
buffer of image data.

## usage

```js
var makizushi = require('makizushi');

makizushi({
    base: 'pin',
    size: 'l',
    tint: '333',
    symbol: 'car',
    retina: true
}, function(err, buf) {
    if (err) throw err;
    fs.writeFileSync('marker.png', buf);
});
```
