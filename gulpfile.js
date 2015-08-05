var fs = require('fs');
var gulp = require('gulp');
var gulpIstanbul = require('gulp-istanbul');
var jscs = require('gulp-jscs');
var mocha = require('gulp-mocha');
var path = require('path');
var reporter = require('istanbul-text-full-reporter');

var libFiles = ['index.js'];
var testFiles = ['test/**/*.js'];
var otherFiles = ['gulpfile.js'];

gulp.task('standards', function() {
  return gulp.src(libFiles.concat(testFiles).concat(otherFiles)).pipe(jscs());
});

gulp.task('coverage', function(cb) {
  return (gulp.src(libFiles)
    .pipe(gulpIstanbul({ includeUntested: true }))
    .pipe(gulpIstanbul.hookRequire())
    .on('end', function() {
      (gulp.src(testFiles)
        .pipe(mocha())
        .on('error', cb)
        .pipe(gulpIstanbul.writeReports({ reporters: [reporter] }))
        .pipe(gulpIstanbul.enforceThresholds({ thresholds: { global: 1 }}))
        .on('error', cb)
      );
    })
  );
});

gulp.task('test', ['standards', 'coverage']);
