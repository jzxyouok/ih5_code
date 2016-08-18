var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('styles', function() {
	// todo:
	gulp.src('./src/styles/index.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest('./dist/assets'));
});

gulp.task('default', function() {
	gulp.watch('./src/styles/*.scss', ['styles']);
});