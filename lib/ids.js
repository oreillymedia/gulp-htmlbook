// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');

var generateID = require('./generateid');


function gulpReplaceIDs(options) {
  
  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true
  });

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-hashids',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    // Find elements without id's
    var $elements = $("chapter:not([id]), section:not([id]), a[data-type='indexterm']:not([id]), div[data-type]:not([id]), aside:not([id]), figure:not([id])");

    $elements.each(function(index, element){
      var $element = $(element);
      generatedId = generateID($element, filePath);

      $element.attr('id', generatedId);

    });

    if(settings.output) {
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
module.exports = gulpReplaceIDs;