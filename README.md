# makizushi

Professional [Maki](https://www.mapbox.com/maki/) chef.

## install

    npm install --save makizushi

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
