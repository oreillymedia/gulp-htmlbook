// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');


function gulpReplaceIndexTerms(options) {
  
  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true
  });

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-replace-index-terms',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    var replaced = false;

    var $elements = $("a[data-type='indexterm']");

    $elements.each(function(index, element){
      var $element = $(element);
      var text = $element.text();
      var re = /(\&#xa0;)||(\&nbsp;)/g;

      if($element.children().length === 0 && 
         text.replace(re, '').trim() === '') {

        $element.text('');
        if(!replaced) replaced = true;
      }
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
module.exports = gulpReplaceIndexTerms;