// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');

var prefixes = {
  'root': 'index',
  'appendix': 'app',
  'chapter': 'ch',
  'index': 'ix',
  'part': 'part',
  'sect1': 's',
  'sect2': 's',
  'sect3': 's',
  'sect4': 's',
  'sect5': 's'
}

function chunk($, $el, chunks, split) {
  // Find chunks
  // h:section|h:div[@data-type='part']|h:nav[@data-type='toc']
  var $chunks = $el.children("section, div[data-type='part'], nav[data-type='toc']");

  $chunks.each(function(index, element){
      var $chunk = $(element);
      var dtype = $chunk.attr('data-type');
      
      // Spliting on sections -- needs cleanup
      if(dtype.indexOf("sect") === 0) {
        
        if(!split) {
          return;
        }

        if(parseInt(dtype.replace("sect")) > split) {
          return;
        }
      }

      chunks.push($chunk);

      $chunk.remove();

      chunk($, $chunk, chunks, split);
  });
}

function gulpChunk(options) {
  
  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true,
    split: 0
  });

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-hashids',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    var $body = $("body");
    var chunks = [];
    var counter = {};

    // Recursively add elements as chunks of the document
    chunk($, $body, chunks, settings.split);

    chunks.forEach(function($el){
      var path;
      var newFile;
      var contents = $.html($el);
      var index;
      var dtype = $el.attr('data-type');
      var prefix = prefixes[dtype];

      if(dtype in counter){
        counter[dtype]++;
        index = counter[dtype];
      } else {
        counter[dtype] = 1;
        index = 1;
      }

      if(prefix) {
        path = prefixes[dtype] + "_" + index + ".html";
      } else {
        path = dtype + ".html";
      }

      newFile = new gutil.File({path: path});

      newFile.contents = new Buffer(contents);

      stream.push(newFile);

    });

    return done();
    
  });

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = gulpChunk;