watchify --full-path=false -v -o js/bundle.js -t [ babelify --presets [ es2015 ] ] js/index.js
