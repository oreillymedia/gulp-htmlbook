// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');
var formating = require('../localizations/en.json');
var util = require("util");

var admonitionElements = {
  'note' : formating["gentext"]['note'],
  'tip' : formating["gentext"]['tip'],
  'warning' : formating["gentext"]['warning'],
  'caution' : formating["gentext"]['caution'],
  'important' : formating["gentext"]['important']
};

var admonitionQuery = _.keys(admonitionElements).map(function(element) {
  return "div[data-type='"+element+"']";
}).join(", ");

function addHeader($element, $) {
  var $header = $element.find("h6");
  var $h6 = cheerio("<h6>");

  var dataType = $element.data("type");

  var label = admonitionElements[dataType];
  
  if(!$header.length) {
    $h6.text(label);
    $element.prepend($h6);
  } else {
    label = $header.first().text();
  }

  return label;
}

function gulpReplaceAdmonitions(options) {
  
  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true
  });
  
  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-replace-admonitions',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    var $elements = $(admonitionQuery);

    $elements.each(function(index, element){
      var $element = $(element);
      var label = addHeader($element);
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
module.exports = gulpReplaceAdmonitions;