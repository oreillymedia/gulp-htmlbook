// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');
var entities = require("entities");

function gulpEscape(options) {

  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true
  });

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-escape',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    // Find elements that might contain cdata
    // only pre's for now
    var $elements = $("pre");

    $elements.each(function(index, element){

      // Get all the children
      element.children.forEach(function(child) {
        // Look for CDATA children
        // Make sure CDATA has a child (it always should have 1)
        if(child.type === 'cdata' && child.children.length) {
          // Get that child's data
          text = child.children[0].data;
          // Escape the text
          escapedText = entities.encodeHTML(text);
          // Remove children
          delete child.children
          // Replace the CDATA elemetn with a text node
          child.type = "text";
          // Add Escaped Text to that node
          child.data = escapedText;
        }
      });

    });

    if(settings.output){
      file.contents = new Buffer($.html(settings.outputMode));
    }

    file.$ = $;

    this.push(file);

    return done();

  });

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = gulpEscape;