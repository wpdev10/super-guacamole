'use strict';

const gulp = require( 'gulp' ),
  minify = require( 'gulp-minify' ),
  header = require( 'gulp-header' ),
  rename = require( 'gulp-rename' ),
  fs = require( 'fs' ),
  path = require( 'path' ),
  pkg = JSON.parse( fs.readFileSync( './package.json' ) );

const DIST = path.join( process.env.WWW_ROOT,
'wordpress.local', 'www', 'wp-content', 'themes',
'blank', 'assets', 'js' );

function unlink( filepath ) {
  return ( done ) => {
    try {
      fs.unlinkSync( filepath );
    } catch( error ) {
      // swallow the error
    }
    done();
  };
};

function unlinkDir( dirpath ) {
  return ( done ) => {
    try {
      fs.rmdirSync( filepath );
    } catch( error ) {
      // swallow the error
    }
    done();
  };
};

gulp.task( 'unlink.published', unlink( path.join( DIST, 'super-guacamole.js' ) ) );
gulp.task( 'unlink.dist', unlinkDir( './dist/' ) );
gulp.task( 'unlink', [ 'unlink.published', 'unlink.dist' ] );

gulp.task( 'dist', [ 'unlink' ], () => {
  gulp.src( './src/*.js' )
    .pipe( minify( {
      mangle: true
    } ) )
    .pipe( header( `/**\n * ${ pkg.name } - ${ pkg.description }\n * @version v${ pkg.version }\n * @link ${ pkg.homepage }\n * @license ${ pkg.license }\n*/\n` ) )
    .pipe( rename( ( filepath ) => {
      if ( filepath.basename.indexOf( '-min' ) > -1 ) {
        filepath.basename = filepath.basename.replace( /\-min/, '' );
        filepath.extname = '.min.js';
      }
    } ) )
    .pipe( gulp.dest( './dist/' ) );
} );

gulp.task( 'default', [ 'dist' ], () => {
  gulp.src( './dist/super-guacamole.js' )
    .pipe( gulp.dest( DIST ) );
} );

gulp.task( 'watch', () => {
  gulp.watch( './src/*.js', [ 'default' ] );
} );
