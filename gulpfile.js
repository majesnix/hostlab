const gulp = require('gulp');
const concat = require('gulp-concat');


gulp.task('css', function() {
    return gulp.src([
        './node_modules/bootstrap/dist/css/bootstrap.css',
        './node_modules/bootstrap/dist/css/bootstrap-grid.css',
        './node_modules/bootstrap/dist/css/bootstrap-reboot.css',
        './node_modules/admin-lte/dist/css/AdminLTE.css',
        './node_modules/admin-lte/dist/css/skins/skin-black.css'
    ]).pipe(concat('bundle.css')).pipe(gulp.dest('./public/vendor/'));
});

gulp.task('js', function() {
    return gulp.src([
        './node_modules/jquery/dist/jquery.js',
        './node_modules/bootstrap/dist/js/bootstrap.js',
        './node_modules/icheck/icheck.js',
        './node_modules/admin-lte/dist/js/adminlte.js',
    ]).pipe(concat('bundle.js')).pipe(gulp.dest('./public/vendor/'));
});


gulp.task('static', function() {
    return gulp.src([
        './node_modules/admin-lte/dist/img/**/*',
    ]).pipe(gulp.dest('./public/vendor/assets/'));
});

gulp.task('default', ['css', 'js', 'static']);