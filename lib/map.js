// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");
var inputSettings = { xmlMode: true, decodeEntities: false };
var outputSettings = { xmlMode: false, decodeEntities: false };


var Mapper = require('./mapper');
var cheerio = require('cheerio');

module.exports = function(finished, options) {
  
  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    path: 'map.json'
  });
  
  var mapper = new Mapper();
  var titles = {};

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, next) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-mapper',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    mapper.parse($, filePath);

    var $title = $("h1, h2, h3, h4, h5").first();
    if($title.length){
      titles[filePath] = $title.text();
    } else {
      titles[filePath] = '';
    }
    
    //this.push(file);

    return next();
    
  }, function(next){
    var mapFile = new gutil.File({path: settings.path});
    mapFile.contents = new Buffer(JSON.stringify(
      {
        titles: titles,
        ids: mapper.map
      }, null, '  '));
    
    this.push(mapFile);

    if(finished) finished(mapper.map);
    next();
  });

  // returning the file stream
  return stream;
};