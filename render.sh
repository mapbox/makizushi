#!/bin/bash
# Adapted from https://github.com/mapbox/maki/ render.sh, at v0.5.0
set -e -u

# Config
svgdir="node_modules/@mapbox/maki/icons"  # SVGs should already be here
pngdir="renders"  # PNGs will be created, possibly overwritten, here

function build_pngs {
    # Takes a list of SVG files and renders both 1x and 2x scale PNGs

    for svg in $@; do

        icon=$(basename $svg .svg)
        echo
        echo "Rendering ${icon}..."

        for size in 11 15 20; do
            inkscape \
                -w ${size} \
                --export-area-page \
                -o ${pngdir}/${icon}-${size}.png \
                $svg > /dev/null

            retina=$((size * 2))
            inkscape \
                -w ${retina} \
                --export-area-page \
                -o ${pngdir}/${icon}-${size}@2x.png \
                $svg > /dev/null
        done
    done
}

svgs=$(ls $svgdir/*.svg)

build_pngs $svgs
