var test = require('tap').test,
    fs = require('fs'),
    pins = require('./pins.json'),
    imageEquals = require('@kartotherian/assert-http').imageEquals,
    makizushi = require('../');

var REGEN = false;

pins.forEach(function(pin) {
    test(JSON.stringify(pin), function(t) {
        makizushi(pin, function(err, res) {
            t.equal(err, null, 'no error returned');
            if (REGEN) {
                fs.writeFileSync(__dirname +'/data/' + slug(pin), res);
            }
            imageEquals(res, fs.readFileSync(__dirname +'/data/' + slug(pin)), { diffsize: 0.5 }, function(err) {
                t.ifError(err, 'image is correct');
                t.end();
            });
        });
    });
});

test('invalid-maki', function(t) {
    makizushi({}, function(err, res) {
        t.equal(err.message, 'Marker is invalid because it lacks base or size.');
        t.equal(err.code, 'EINVALID');
        t.end();
    });
});

test('invalid-maki', function(t) {
    makizushi({
        base: 'pin-l'
    }, function(err, res) {
        t.equal(err.message, 'Marker is invalid because it lacks base or size.');
        t.equal(err.code, 'EINVALID');
        t.end();
    });
});

test('invalid-maki', function(t) {
    makizushi({
        base: 'pin',
        size: 'm',
        symbol: 'foo'
    }, function(err, res) {
        t.equal(err.message, 'Marker symbol \"foo\" is invalid.');
        t.equal(err.code, 'EINVALID');
        t.end();
    });
});

test('invalid-char', function(t) {
    makizushi({
        symbol: '1'
    }, function(err, res) {
        t.equal(err.message, 'Marker is invalid because it lacks base or size.');
        t.equal(err.code, 'EINVALID');
        t.end();
    });
});

test('invalid-char', function(t) {
    makizushi({
        base: 'pin',
        size: 'm',
        symbol: '/'
    }, function(err, res) {
        t.equal(err.message, 'Marker symbol \"/\" is invalid.');
        t.equal(err.code, 'EINVALID');
        t.end();
    });
});

function slug(o) {
    return Object.keys(o).map(function(k) {
        return o[k];
    }).join('-') + '.png';
}
