var babel = require('gulp-babel');
var gulp = require('gulp');<% if(injectTemplate == 'Yes') { %>
var injectTemplate = require('gulp-inject-template');<% } %>
var streamify = require('gulp-streamify');

var dist = '<%= buildFolder %>';

var babelOptions = {
  optional: ['runtime']
};

gulp.task('build', function() {
  return gulp.src('src/**/*.js', {buffer: false})
    .pipe(streamify(babel(babelOptions)))<% if(injectTemplate == 'Yes') { %>
    .pipe(injectTemplate({variable: 'data'}))<% } %>
    .pipe(gulp.dest(dist))
  ;
});