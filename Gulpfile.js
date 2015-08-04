var gulp = require('gulp');
var browserify = require('gulp-browserify');
 
// Basic usage 
gulp.task('scripts', function() {
    // Single entry point to browserify 
    gulp.src('views/scripts/main.js')
        .pipe(browserify({
          insertGlobals : true,
          debug : !gulp.env.production
        }))
        .pipe(gulp.dest('./views/'))
        console.log(">>>>>> Scripts Loaded");
});

gulp.task('watch', function() {
  gulp.watch('views/scripts/**/*.js', ['scripts']);
});


gulp.task('default', ['watch', 'scripts']);