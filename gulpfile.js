'use strict';

const gulp = require( 'gulp' ),
  minify = require( 'gulp-minify' ),
  header = require( 'gulp-header' ),
  fs = require( 'fs' ),
  path = require( 'path' ),
  pkg = JSON.parse( fs.readFileSync( './package.json' ) ),
  DIST = path.join(
    process.env.WWW_ROOT,
    'wordpress.local',
    'www',
    'wp-content',
    'themes',
    'blank',
    'assets',
    'js'
  );

gulp.task( 'dist', ( done ) => {

  let filepath = path.join( DIST, 'super-guacamole.js' );

  fs.unlink( filepath, ( error ) => {
    gulp.src( './src/*.js' )
      .pipe( minify( {
        mangle: true
      } ) )
      .pipe( header( `/**\n * ${ pkg.name } - ${ pkg.description }\n * @version v${ pkg.version }\n * @link ${ pkg.homepage }\n * @license ${ pkg.license }\n*/\n` ) )
      .pipe( gulp.dest( './dist/' ) );

    done();
  } );
} );

gulp.task( 'default', [ 'dist' ], () => {
  gulp.src( './dist/super-guacamole.js' )
    .pipe( gulp.dest( DIST ) );
} );

gulp.task( 'watch', () => {
  gulp.watch( './src/*.js', [ 'default' ] );
} );
