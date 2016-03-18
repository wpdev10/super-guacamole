'use strict';

const gulp = require( 'gulp' ),
  minify = require( 'gulp-minify' ),
  header = require( 'gulp-header' ),
  fs = require( 'fs' ),
  pkg = JSON.parse( fs.readFileSync( './package.json' ) );

gulp.task( 'default', () => {
  gulp.src( './src/*.js' )
    .pipe( minify( {
      mangle: true
    } ) )
    .pipe( header( `/**\n * ${ pkg.name } - ${ pkg.description }\n * @version v${ pkg.version }\n * @link ${ pkg.homepage }\n * @license ${ pkg.license }\n*/\n` ) )
    .pipe( gulp.dest( './dist/' ) );
} );
