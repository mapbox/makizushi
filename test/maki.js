var test = require('tap').test,
    makizushi = require('../');

test('makizushi', function(t) {
    makizushi({
        size: 'l',
        base: 'pin',
        symbol: 'a'
    }, function(err, res) {
        t.equal(err, null, 'no error returned');
        t.end();
    });
});

test('makizushi-symbol', function(t) {
    makizushi({
        base: 'pin',
        size: 'l',
        symbol: 'bus',
        tint: 'f0f'
    }, function(err, res) {
        t.equal(err, null, 'no error returned');
        t.end();
    });
});

test('makizushi-tint', function(t) {
    makizushi({
        base: 'pin',
        size: 'l',
        symbol: 'bus',
        tint: 'ace'
    }, function(err, res) {
        t.equal(err, null, 'no error returned');
        t.end();
    });
});
