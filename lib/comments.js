// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');

// var generateID = require('./generateid');


function gulpComments(options) {

  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true
  });

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-comments',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    // Find comments
    var $elements = $("div[data-type='comment'], span[data-type='comment']");

    $elements.each(function(index, element){
      var $element = $(element);

      $element.remove();

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
module.exports = gulpComments;