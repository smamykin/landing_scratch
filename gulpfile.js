const {src, dest, parallel, task, watch, series} = require('gulp'),
    browserSync = require('browser-sync').create(),//live reload
    rimraf = require('rimraf'),// clean up dist directory.
    twig = require('gulp-twig'),// template rendering.
    webpack = require('webpack-stream'),//prepare js and css
    named = require('vinyl-named'),// It helps to save given names of the files for their using in the dist directory.
    spritesmith = require('gulp.spritesmith');
/* !!!
Any styles should be included by webpack in js scripts.

We'll be use two kinds of twig templating:
 1. Use gulp-twig for rendering our base html markup;
 2. Use  twig-loader in webpack for getting of the simplest pieces of html, that is needed in the js.

 We just copy all images from image folder. So an image can be handled twice:
 the first time when we copy it by a special gulp task;
 the second time when webpack try resolve path.
 I don't think It is serious issue.

Sprites must be compile manually and then must be committed.
*/

const path = (function () {
    const baseDist = 'dist',
        baseSrc = './src';

    return {
        baseDist,
        baseSrc,
        fonts: {
            dest: baseDist + '/fonts',
            src: baseSrc + '/fonts/**/*.*',
        },
        images: {
            dest: baseDist + '/images',
            src: baseSrc + '/images/**/*.*',
        },
        templates: {
            dest: baseDist,
            src: baseSrc + '/*.twig'
        },
        js: {
            dest: baseDist + '/js',
            src: baseSrc + '/js/*.js'
        },
        watch: {
            dist: baseDist + '/**/*',
            src: baseSrc + '/**/*',
        }
    };
}());

//region twig extensions
const pathResolve = {
    images: '/images',
    asset: ''
};
let twigFunc = [
    {
        name: "path",//unlike webpack we cannot use auto-replacing of paths. So we'll define  the extension, that will help us control paths
        func: function (path) {
            'use strict';

            let namespace = '';
            let slashPosition = path.indexOf('/');
            if (path.charAt(0) === "@" && slashPosition > 0) {
                namespace = path.slice(1, slashPosition);
                path = path.slice(path.indexOf('/'))
            }

            if (namespace && pathResolve.hasOwnProperty(namespace)){
                return pathResolve[namespace] + path;
            }

            return path;
        }
    }
];
//endregion

task('server', function () {
    browserSync.init({
        server: {
            port: 9000,
            baseDir: path.baseDist
        }
    });
    // watch(path.watch.dist).on('change', browserSync.reload);
});

task('templates:compile', function buildHTML() {
    return src(path.templates.src)
        .pipe(twig({
            data: {
                title: 'Gulp and Twig',
                benefits: [
                    'Fast',
                    'Flexible',
                    'Secure'
                ]
            },
            functions: twigFunc
        }))
        .pipe(dest(path.templates.dest))
});

task('app:compile', function () {
    return src(path.js.src)
        .pipe(named())
        .pipe(webpack({
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.js$/,
                        exclude: /(node_modules|bower_components)/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                presets: ['@babel/preset-env'],
                                plugins: ['@babel/plugin-proposal-object-rest-spread']
                            }
                        }
                    },
                    {
                        test: /\.(scss|css)$/,
                        exclude: /(node_modules|bower_components)/,
                        use: [
                            {loader: "style-loader"},
                            {loader: "css-loader"},
                            {loader: "sass-loader"},
                        ],
                    },
                    {
                        test: /\.(jpeg|png|svg|jpg|gif)$/i,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: '[name].[ext]',
                                    outputPath: '../images',
                                    publicPath: 'images',
                                }
                            },
                        ],
                    },
                    {
                        test: /\.twig$/,
                        use: [
                            'twig-loader',
                            'extract-loader',
                            {
                                loader: 'html-loader',
                            },
                        ],
                    },
                    {
                        test: /\.(woff|woff2|eot|ttf|otf)$/,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: '[name].[ext]',
                                    outputPath: '../fonts',
                                    publicPath: 'fonts',
                                }
                            },
                        ],
                    },
                ],
            },
            devtool: 'source-map',
        }))
        .pipe(dest(path.js.dest));
});

task('clean', function del(cb) {
    return rimraf(path.baseDist, cb);
});

task('copy:fonts', function () {
    return src(path.fonts.src).pipe(dest(path.fonts.dest));
});

task('copy:images', function () {
    return src(path.images.src).pipe(dest(path.images.dest));
});

task('copy', parallel('copy:fonts', 'copy:images'));
task('reload', function(cb){
    browserSync.reload();
    cb();
});

task('watch', function () {
    watch(path.watch.src, series(
        parallel(
            'templates:compile',
            'app:compile'
        ),
        'reload'
));
});

task('default', series(
    'clean',
    parallel('templates:compile', 'app:compile', 'copy'),
    parallel('watch', 'server'),
));

task('sprite:compile', function(cb){
    const spriteData = src(path.baseSrc + '/images/icons/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            imgPath: '../images/icons/sprite.png',
            cssName: '_sprite.scss'
        }));

    spriteData.img.pipe(dest(path.baseSrc + '/images/icons/'));
    spriteData.css.pipe(dest(path.baseSrc + '/style/' ));
    cb();
});
