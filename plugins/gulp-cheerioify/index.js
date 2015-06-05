// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var Promise = require("bluebird");
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');
// var fs = require('fs');

// consts
const PLUGIN_NAME = 'gulp-cheerioify';

// plugin level function (dealing with files)
function gulpCheerioify(options) {

  var settings = _.defaults(options || {}, {
    xmlMode: false,
    finished: false
  });

  var cache = [];

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {
    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-cheerioify',  'Streaming not supported')); }

    var contents;
    var $;

    // Document is already set
    // if(file.$) {
    //   return done();
    // }

    contents = file.contents.toString();
    $ = cheerio.load(contents, { xmlMode: settings.xmlMode, decodeEntities: false });
    
    file.$ = $;
    this.push(file);
    if(settings.finished){
      cache.push(file);
    }
    return done();
  });

  if(settings.finished){
    stream.on("finish", function(){
      settings.finished(cache);
    });
  }


  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = gulpCheerioify;