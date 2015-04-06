#!/usr/bin/env bash

code=0

set -eu

if ! which file > /dev/null; then
    echo "Could not find command 'file'"
    exit 1
fi

for file in $(dirname $0)/../markers-src/alphanum/*.png; do
    base=$(basename $file)
    size=$(echo $base | cut -d '-' -f 2 | grep -oE '^[0-9]+')
    retina=$((echo $base | grep -o '@2x') || (echo ''))
    if [ "$retina" == "@2x" ]; then
        size=$(($size*2))
    fi
    dimensions="$(file $file | grep -oE '[0-9]+ x [0-9]+')"
    if [ "$dimensions" != "$size x $size" ]; then
        echo "not ok - $base expected $size x $size, got $dimensions"
        code=1
    fi
done

if [ "$code" == "0" ]; then
    echo "ok - all files match expected size"
fi

exit $code
