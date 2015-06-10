var gulp = require('gulp');
var util = require('gulp-util');
var order = require('gulp-order');

var htmlbook = require("./index.js");

var cheerioify = require('./plugins/gulp-cheerioify/index.js');
var liquify = require("./plugins/gulp-liquid/index.js");

var inputPath = "test/alice/";
var outputPath = inputPath + "compiled/";
var files = require("./test/alice/files.json");

gulp.task('transform', [], function() {

  return gulp.src(inputPath+"*.html")
    //.pipe(markdownToHtmlbook()) // or transform from asciidoc ect.
    //.pipe(htmlbook.layout.chunk('sect1')) // Split on x
    //.pipe(gulp.dest(outputPath));
});

gulp.task('compile', [], function() {

  return gulp.src(inputPath+"*.html")
    .pipe(liquify()) // or transform from markdown, asciidoc ect.
    // .pipe(htmlbook.layout.chunk('sect1')) // Split on x
    .pipe(cheerioify({
      xmlMode: false
    }))
    .pipe(htmlbook.process.ids({output: false}))
    .pipe(htmlbook.process.indexterms({output: false}))
    .pipe(htmlbook.process.admonitions({output: false}))
    .pipe(htmlbook.process.comments({output: true}))
    .pipe(gulp.dest(outputPath));

});

gulp.task('template', ['compile', "navigation", "index"], function() {
  var map = require("./"+outputPath+"map.json"); // Load the map

  return gulp.src(outputPath+"*.html")
    .pipe(htmlbook.layout.ordering(files, map))
    .pipe(htmlbook.layout.template({
      templatePath : "./layouts/default_layout.html",
      wrapper: 'content'
    }))
    .pipe(gulp.dest(outputPath));

});


gulp.task('map', ['compile'], function() {
  return gulp.src(outputPath+"*.html")
    .pipe(order(files))
    .pipe(cheerioify({
      xmlMode: false
    }))
    .pipe(htmlbook.generate.map())
    .pipe(gulp.dest(outputPath));
});


gulp.task('navigation', ['compile'], function() {
  return gulp.src(outputPath+"*.html")
    .pipe(order(files))
    .pipe(cheerioify({
      xmlMode: false
    }))
    .pipe(htmlbook.generate.nav())
    //.pipe(gulp.dest(outputPath))
    // Create html
    .pipe(htmlbook.layout.navigation({
      templatePath : "./layouts/default_nav.html"
    }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('index', ['compile'], function() {
  return gulp.src(outputPath+"*.html")
    .pipe(order(files))
    .pipe(cheerioify({
      xmlMode: false
    }))
    .pipe(order(files))
    .pipe(htmlbook.generate.index())
    // .pipe(gulp.dest(outputPath))
    // Create html
    .pipe(htmlbook.layout.index({
      templatePath : "./layouts/default_index.html"
    }))
    .pipe(gulp.dest(outputPath));
});

gulp.task('xrefs', ['compile','map', 'template'], function() {
  var map = require("./"+outputPath+"map.json"); // Load the map
  return gulp.src(outputPath+"*.html")
    .pipe(cheerioify({
      xmlMode: false
    }))
    .pipe(htmlbook.process.xrefs(map, {output: true}))
    .pipe(gulp.dest(outputPath));
});

gulp.task('labels', ['compile','map','template','xrefs'], function() {
  var map = require("./"+outputPath+"map.json"); // Load the map
  return gulp.src(outputPath+"*.html")
    .pipe(cheerioify({
      xmlMode: false
    }))
    .pipe(htmlbook.process.labels(map, {output: true}))
    .pipe(gulp.dest(outputPath));
});

gulp.task('chunk', [], function() {

  return gulp.src("test/samples/htmlbook.html")
    .pipe(htmlbook.layout.chunk()) // Splits on chapters. {split: 1} will split on 'sect1'
    .pipe(gulp.dest("test/samples/compiled/"));
});

gulp.task('default', ['compile', 'template', 'map', 'navigation', 'index', 'xrefs'], function(){

});
