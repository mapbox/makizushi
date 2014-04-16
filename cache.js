var fs = require('fs'),
    path = require('path');

// Loads up all default markers at require time.
module.exports = [
    ['base', 'base'],
    ['mask', 'mask'],
    ['alphanum', 'symbol']
].reduce(function(memo, destsrc) {
    var dest = destsrc[1],
        src = destsrc[0],
        basepath = path.resolve(__dirname + '/markers-src/' + src);

    memo[dest] = fs.readdirSync(basepath)
        .sort()
        .reduce(function(memo, file) {
            if (path.extname(file) !== '.png') return memo;
            var key = path.basename(file, '.png')
                .replace('-12', '-s')
                .replace('-18', '-m')
                .replace('-24', '-l');
            memo[key] = fs.readFileSync(basepath + '/' + file);
            return memo;
        }, memo[dest] || {});
    return memo;
}, { url: {} });
