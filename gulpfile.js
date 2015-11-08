var gulp=require('gulp'),
    fs = require('fs-extra'),
    concat=require('gulp-concat'),
    uglify = require('gulp-uglify'),
    BUILD_JSON=require('./build.json'),
    REPO_NAME='elliptical-behaviors',
    BUNDLE='./bundle',
    DIST='./dist';


gulp.task('default',function(){
    console.log(REPO_NAME + ' ..."tasks: gulp build|demo"');
});

gulp.task('build',function(){
    fileStream(BUILD_JSON,BUNDLE)
});

gulp.task('demo',function(){
    fileStream('./bower_components/**/*.*','./demo/components');
    fileStream('./bundle/**/*.*','./demo/components/elliptical-behaviors/bundle');
    fileStream('./component-behavior.html','./demo/components/elliptical-behaviors');
    fileStream('./observable-behavior.html','./demo/components/elliptical-behaviors');
    fileStream('./dist/webcomponents-lite.js','./demo/scripts');
});

function srcStream(src){
    if(src===undefined) src=BUILD_JSON;
    return gulp.src(src);
}

function concatStream(name,src){
    if(src===undefined) src=BUILD_JSON;
    return srcStream(src)
        .pipe(concat(name))
}

function fileStream(src,dest){
    gulp.src(src)
        .pipe(gulp.dest(dest));
}

function concatFileStream(src,dest,name){
    gulp.src(src)
        .pipe(concat(name))
        .pipe(gulp.dest(dest));
}

function minFileStream(src,dest,name){
    gulp.src(src)
        .pipe(concat(name))
        .pipe(uglify())
        .pipe(gulp.dest(dest));
}