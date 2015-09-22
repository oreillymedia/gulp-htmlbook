# gulp HTMLBook

Contains gulp plugins to convert from HTMLBook to HTML.

## layout
### layout.template()
Layout content in a templates, and replace variables in the content
### layout.ordering()
Adds `prev_url`, `next_url`, `prev_label`, `next_label` variables to each file
### layout.navigation()
Create the navigation html by passing the nav json through a template
### layout.index()
Create the index html by passing the index json through a template
### layout.chunk()
Split the content from a single HTMLBook file into chunks, at the chapter or section level

## generate
### generate.map()
Run through a stream of documents and generate reference objects for each file and every id, returns json
### generate.index()
Find all index terms in a stream of documents and sort them, returns json
### generate.nav()
Find all the headers in a stream of documents and create the nav for the Table of Contents, returns json.

## process
processes parts of the content, most require content to have been mapped
### process.ids()
Adds ids for all `chapter`, `section`, `a[data-type='indexterm']`, `div[data-type]`, `aside`, `figure` elements that don't have one.
### process.indexterms()
Removes spaces from indexterm elements
### process.labels()
Replaces headers with nice labels, such as Section 1.2
### process.admonitions()
Adds translated header text to admonition elements (`en` only for now)
### process.comments()
Removes comments
### process.xrefs()
Replaces cross-refrenced link with the correct url and text
### process.escape()
Replaces cdata in pre elements, escapes their content

## tools
### tools.helpers()
Collection of helper functions
### tools.mapper()
Map a document
### tools.generateid()
Generates Id's based on hashed content, these will always be the same if the content is the same.

### Installation

```javascript
npm install gulp-htmlbook
```

```javascript
var htmlbook = require("gulp-htmlbook");
```

###Usage

See the example gulpfile.js for how to process a sample HTMLBook source.

A compile task should process the source content and output it for mapping and templating.
If the content is in markdown, asciidoc or docbook it must be transformed prior to this step.
```javascript
var outputPath = "compiled/";

gulp.task('compile', [], function() {
  return gulp.src("*.html")
    .pipe(htmlbook.process.ids())
    .pipe(htmlbook.process.indexterms())
    .pipe(htmlbook.process.admonitions())
    .pipe(htmlbook.process.comments())
    .pipe(gulp.dest(outputPath));
});
```
Next map the compiled content. This map is used with many other plugins.
```javascript
var order = require('gulp-order');
gulp.task('map', ['compile'], function() {
  return gulp.src(outputPath+"*.html")
    .pipe(order(['chap_1.html','chap_2.html'])) // Must be ordered
    .pipe(htmlbook.generate.map())
    .pipe(gulp.dest(outputPath));
});
```
Finaly, wrap each chunk in an html template.
```javascript
gulp.task('template', ['compile', 'map'], function() {
  var map = require("./map.json"); // Load the map

  return gulp.src(outputPath+"*.html")
    .pipe(htmlbook.layout.ordering(['chap_1.html','chap_2.html'], map))
    .pipe(htmlbook.layout.template())
    .pipe(gulp.dest(outputPath));
});
```