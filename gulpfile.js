/*
 * This file is part of The HostLab Software.
 *
 * Copyright 2018
 *     Adrian Beckmann, Denis Paris, Dominic Claßen,
 *     Jan Wystub, Manuel Eder, René Heinen, René Neißer.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const gulp = require('gulp');
const concat = require('gulp-concat');

gulp.task('css', function() {
  return gulp.src([
    './node_modules/bootstrap/dist/css/bootstrap.css',
    './node_modules/bootstrap/dist/css/bootstrap-grid.css',
    './node_modules/bootstrap/dist/css/bootstrap-reboot.css',
    './node_modules/admin-lte/dist/css/AdminLTE.css',
    './node_modules/admin-lte/dist/css/skins/skin-black.css',
  ]).pipe(concat('bundle.css')).pipe(gulp.dest('./public/css/'));
});

gulp.task('js', function() {
  return gulp.src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/bootstrap/dist/js/bootstrap.js',
    './node_modules/icheck/icheck.js',
    './node_modules/admin-lte/dist/js/adminlte.js',
  ]).pipe(concat('bundle.js')).pipe(gulp.dest('./public/js/'));
});

gulp.task('default', ['css', 'js']);
