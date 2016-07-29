const gulp = require("gulp"),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    critical = require('critical').stream,
    replace = require('replace'),
    htmlreplace = require("gulp-html-replace"),
    inlinesource = require("gulp-inline-source"),
    inline = require('gulp-inline'),
    rename = require("gulp-rename");

gulp.task('css-minify', function() {
    return gulp.src(["./src/public/bower_components/materialize/dist/css/materialize.css",
            "src/public/css/styles.css"
        ])
        .pipe(concat('all.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./dist/public/css'));
});

gulp.task('js-minify', function() {
    return gulp.src(["./src/public/bower_components/localforage/dist/localforage.min.js",
            "./src/public/bower_components/knockout/dist/knockout.js",
            "./src/public/bower_components/jquery-2.2.4.min/index.js",
            "./src/public/bower_components/materialize/dist/js/materialize.min.js",
            "./src/public/js/main.js"
        ])
        .pipe(concat("all.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest("./dist/public/js"));
});

gulp.task("html-minify", ['css-minify', 'js-minify'], function() {
    return gulp.src(['./src/public/index.html'])
        .pipe(htmlreplace({
            'cssfiles': {
                src: [['css/all.min.css', 'inline']],
                tpl: '<link rel="stylesheet" href="%s" %s>'
            },
            'jsfiles': {
                src: [['js/all.min.js', 'defer']],
                tpl: '<script src="%s" %s></script>'
            },
        }))
        .pipe(gulp.dest('./dist/public'));
});

gulp.task("indexjs", function() {
    return gulp.src(['./src/index.js'])
        .pipe(gulp.dest('./dist'));
});

gulp.task("img", function() {
    return gulp.src(['./src/public/img/**'])
        .pipe(gulp.dest('./dist/public/img'));
});

gulp.task("fav", function() {
    return gulp.src(['./src/public/favicons/**'])
        .pipe(gulp.dest('./dist/public/favicons'));
});

gulp.task("fonts", function() {
    return gulp.src(['./src/public/bower_components/materialize/dist/fonts/**'])
        .pipe(gulp.dest('./dist/public/fonts'));
});

gulp.task("inlinecss", ["html-minify"],function() {
    return gulp.src('./dist/public/index.html')
        .pipe(inlinesource())
        .pipe(gulp.dest('./dist/public'));
});

gulp.task('default', ['css-minify', 'js-minify', 'html-minify', 'indexjs','img', 'fav', 'fonts', 'inlinecss']);
