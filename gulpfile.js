var gulp=require('gulp'),
    fs = require('fs-extra'),
    concat=require('gulp-concat'),
    uglify = require('gulp-uglify'),
    REPO_NAME='elliptical-behaviors',
    WEB_COMPONENTS='./dist/webcomponents-lite.js',
    BOOTSTRAP='./dist/elliptical.boot.js',
    BOWER='./bower_components',
    BOWER_EB='./bower_components/elliptical-behaviors',
    BOWER_EB_DIST='./bower_components/elliptical-behaviors/dist';


gulp.task('default',function(){
    console.log(REPO_NAME + ' ..."tasks: gulp build|demo"');
});

gulp.task('build',function(){
   console.log('build not enabled...')
});

gulp.task('demo',function(){
    fileStream('./demo/hello-world/**/*.*',BOWER + '/hello-world');
    fileStream('./demo/profile-template/**/*.*',BOWER + '/profile-template');
    fileStream('./demo/observable-list/**/*.*',BOWER + '/observable-list');
    fileStream('./component-behavior.html',BOWER_EB);
    fileStream('./observable-behavior.html',BOWER_EB);
    fileStream(BOOTSTRAP,BOWER_EB_DIST);
    fileStream(WEB_COMPONENTS,BOWER_EB_DIST);
});




function fileStream(src,dest){
    gulp.src(src)
        .pipe(gulp.dest(dest));
}

