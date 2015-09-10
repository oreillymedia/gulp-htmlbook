// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');
var Mapper = require("./mapper.js");
var formating = require('../localizations/en.json');
var util = require("util");
var romanize = require("./helpers").romanize;
var alphabetize = require("./helpers").alphabetize;
var formating = require('../localizations/en.json');
var generateID = require('./generateid');
var settings;
/*
<xsl:param name="label.numeration.by.data-type">
appendix:A
chapter:1
part:I
sect1:none
sect2:none
sect3:none
sect4:none
sect5:none
</xsl:param>
*/
var formal = {
  'example' : true,
  'figure' : true,
  'table' : true
};

var numeric = {
  'chapter' : true
};

var roman = {
  'part' : true
};

var alpha = {
  'appendix': true
}


function replaceLabel($element, $, map, filePath) {
  var label;
  var template;
  var text;
  var name;
  var position;
  var parentPosition;
  var $title = $element.find("h1, h2, h3, h4, h5, h6, figcaption, caption");
  var $span = cheerio("<span class='label'></span>");
  var type = $element[0].name;
  var intralabel =  ". ";

  name = $element.data("type") || $element[0].name;
  id = $element.attr('id');

  if(!id) {
    id = generateID($element, filePath);
  }

  if(!id || !name || !$title.length){
    return;
  }

  mapped = map[id];

  label = formating["gentext"][name];
  position = mapped ? mapped.position : 0;

  if(!label) {
    return '';
  }

  if(name in roman) {
    text = label + " " + romanize(position) + intralabel;
  }
  else if(name in alpha) {
    text = label + " " + alphabetize(position) + intralabel;
  }
  else if(name in numeric) {
    text = label + " " + (position) + intralabel;
  }
  else if(name in formal || type in formal){

    if(mapped && mapped.parent in map) {
      parent = map[mapped.parent];

      if(parent.name == "part"){
        parentPosition = romanize(parent.position);
      } else {
        parentPosition = parent.position;
      }

      text = label + " " + parentPosition + "-" + mapped.index + ". ";
    } else {
      text = label + " " + position + ". ";
    }

  } else {
    // label = util.format(template, position);
    text = label + " " + position + ". ";

  }

  $span.text(text);
  $title.first().prepend($span);

  return label;
}

function gulpReplaceLabels(map, options) {

  settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    types : [
      "chapter",
      "appendix",
      "sect1",
      "sect2",
      "sect3",
      "sect4",
      "sect5"
    ],
    elements : [
      "div[data-type='part']",
      "div[data-type='example']",
      "figure",
      "table"
    ],
    output: true,
    log : gutil.log
  });

  settings.types.forEach(function (name) {
    settings.elements.push("section[data-type='"+name+"']");
  });

  var stream;

  // Allows for counting elements and retriving with ids
  if(!map){
    settings.log("Labels: No map provided");
    return;
  }

  // creating a stream through which each file will pass
  stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-replace-labels',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    var replaced = false;

    var $elements = $(settings.elements.join(", "));

    $elements.each(function(index, element){
      var $element = $(element);
      var label = replaceLabel($element, $, map, filePath);
      if(!replaced) replaced = true;
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
module.exports = gulpReplaceLabels;
