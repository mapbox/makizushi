var fs = require('fs'),
    path = require('path');

// Loads up all default markers at require time.
module.exports = [
    ['markers-src/base', 'base'],
    ['markers-src/mask', 'mask'],
    ['markers-src/alphanum', 'symbol'],
    ['renders', 'symbol']
].reduce(function(memo, destsrc) {
    const [src, dest] = destsrc;
    const basePath = path.resolve(__dirname, '..', src);

    memo[dest] = fs.readdirSync(basePath)
        .filter((file) => path.extname(file) === '.png')
        .reduce(function(memo, file) {
            const key = path.basename(file, '.png')
                .replace('-11', '-s')
                .replace('-15', '-m')
                .replace('-20', '-l');
            memo[key] = fs.readFileSync(path.resolve(basePath, file));
            return memo;
        }, memo[dest] || {});
    return memo;
}, { url: {} });
