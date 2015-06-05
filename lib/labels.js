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

var labeledElements = [
  "chapter",
  "sect1",
  "sect2",
  "sect3",
  "sect4",
  "sect5"
];

var sectionalElements = {
  'acknowledgments' : true,
  'afterword' : true,
  'appendix' : true,
  'bibliography' : true,
  'chapter' : true,
  'colophon' : true,
  'conclusion' : true,
  'copyright-page' : true,
  'dedication' : true,
  'foreword' : true,
  'glossary' : true,
  'halftitlepage': true,
  'index' : true,
  'introduction' : true,
  'preface' : true,
  'titlepage' : true,
  'toc' : true
};

var labeledElements = labeledElements.map(function(element) {
  return "section[data-type='"+element+"']";
}).join(", ");

function replaceLabel($element, $, _mapper) {
  var label;
  var map = _mapper.map;
  var template;
  var text;
  var name;
  var position;
  var parentPosition;
  var $title = $element.find("h1, h2, h3, h4, h5, h6, figcaption, caption");
  var $span = cheerio("<span class='label'></span>");
  var type = $element[0].name;
  var mapped;
  var mapper;

  var formal = {
    'example' : true,
    'figure' : true,
    'table' : true
  };

  var roman = {
    'part' : true
  };

  if(!map) {
    mapper = new Mapper();
    mapper.parse($.root());
    map = mapper.map;
  }

  name = $element.data("type") || $element[0].name;
  id = $element.attr('id'); // TODO: generate id if missing

  if(!id || !name || !$title.length){
    return;
  }

  // mapped = mapper.map[id];
  mapped = map[id];
  label = formating["gentext"][name];
  position = mapped ? mapped.position : 0;

  if(!label) {
    return '';
  }

  if(name in roman) {
    position = romanize(position);
  }

  if(name in formal || type in formal){
// console.log(mapped)
    parent = map[mapped.parent];

    if(parent.name == "part"){
      parentPosition = romanize(parent.position);
    } else {
      parentPosition = parent.position;
    }

    text = label + " " + parentPosition + "-" + mapped.index + ". ";

  } else {

    // label = util.format(template, position);
    text = label + " " + position + ". ";

  }

  $span.text(text);
  $title.first().prepend($span);

  return label;
}

function gulpReplaceLabels(map, options) {

  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true
  });

  var mapper;
  var stream;

  // Allows for counting elements and retriving with ids
  if(!map){
    mapper = new Mapper();
  } else {
    mapper = settings.map;
  }

  // creating a stream through which each file will pass
  stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-replace-labels',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    var replaced = false;

    var $elements = $(labeledElements + ", div[data-type='part'], div[data-type='example'], figure, table");

    if(!settings.map){
      mapper.parse($, filePath);
    }

    $elements.each(function(index, element){
      var $element = $(element);
      var label = replaceLabel($element, $, mapper);
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
