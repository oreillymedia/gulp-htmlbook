// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");
var inputSettings = { xmlMode: true, decodeEntities: false };
var outputSettings = { xmlMode: false, decodeEntities: false };
var cheerio = require('cheerio');

module.exports = function(finished, options) {

  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    path: 'titles.json'
  });

  var titles = {};

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, next) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-titles',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

		// Grab first header in document
    var $title = $("h1, h2, h3, h4, h5");
		
    if($title.length){
      titles[filePath] = $title.first().text();
    } else {
      titles[filePath] = '';
    }

    return next();

  }, function(next){

    var titleFile = new gutil.File({path: settings.path});
    titleFile.contents = new Buffer(JSON.stringify(titles, null, '  '));

    this.push(titleFile);

    if(finished) finished(titles);
    next();
  });

  // returning the file stream
  return stream;
};