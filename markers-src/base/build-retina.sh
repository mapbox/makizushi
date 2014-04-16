DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [ -z `which inkscape` ]; then
    echo "inkscape command is required."
    echo "Mac OS X users add /Applications/Inkscape.app/Contents/Resources/bin to your PATH."
    exit;
fi

for object in $(inkscape --without-gui -f $DIR/pin.svg --query-all |
    sed '/^rect[0-9]*/d; /^path[0-9]*/d; /^g[0-9]/d; /^layer[0-9]*/d; /^svg[0-9]*/d; /^text[0-9]*/d; /^tspan[0-9]*/d' |
    sed 's/-[sml].*//g' |
    sort |
    uniq)
do
    echo $object
    inkscape --without-gui -f $DIR/pin.svg --export-id=$object-s -e=$DIR/$object-s.png -w 20 -h 50
    inkscape --without-gui -f $DIR/pin.svg --export-id=$object-m -e=$DIR/$object-m.png -w 30 -h 70
    inkscape --without-gui -f $DIR/pin.svg --export-id=$object-l -e=$DIR/$object-l.png -w 35 -h 90
    inkscape --without-gui -f $DIR/pin.svg --export-id=$object-s -e=$DIR/$object-s@2x.png -w 40 -h 100
    inkscape --without-gui -f $DIR/pin.svg --export-id=$object-m -e=$DIR/$object-m@2x.png -w 60 -h 140
    inkscape --without-gui -f $DIR/pin.svg --export-id=$object-l -e=$DIR/$object-l@2x.png -w 70 -h 180
done
