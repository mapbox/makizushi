var test = require('tap').test,
    makizushi = require('../');

test('makizushi', function(t) {
    makizushi({
        name: 'pin-l',
        label: 'a'
    }, function(err, res) {
        t.equal(err, null, 'no error returned');
        t.end();
    });
});

test('makizushi-symbol', function(t) {
    makizushi({
        name: 'pin-l',
        label: 'bus'
    }, function(err, res) {
        t.equal(err, null, 'no error returned');
        t.end();
    });
});

test('makizushi-tint', function(t) {
    makizushi({
        name: 'pin-l',
        label: 'bus',
        tint: 'ace'
    }, function(err, res) {
        t.equal(err, null, 'no error returned');
        t.end();
    });
});
