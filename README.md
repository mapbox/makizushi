[![Build Status](https://travis-ci.org/mapbox/makizushi.svg)](https://travis-ci.org/mapbox/makizushi)

# makizushi

Professional [Maki](https://www.mapbox.com/maki/) chef.

## install

    npm install --save makizushi

## api

### `makizushi(options, callback)`

Options:

* `tint`: a color in rgb or rrggbb
* `symbol`: a maki symbol name, or a single char of `[a-z0-9]`
* `size`: one of `s`, `m`, or `l`
* `base`: `"pin"`

Callback: `(err, data)` in which err is an error if any, and data is a
buffer of image data.

## usage

```js
var makizushi = require('makizushi');

makizushi({
    tint: '333',
    label: 'a'
}, function(err, buf) {
    if (err) throw err;
    fs.writeFileSync('marker.png', buf);
});
```
