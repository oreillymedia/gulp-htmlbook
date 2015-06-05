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
const PLUGIN_NAME = 'gulp-nav';

//h:section[not(@data-type = 'dedication' or @data-type = 'titlepage' or @data-type = 'toc' or @data-type = 'colophon' or @data-type = 'copyright-page' or @data-type = 'halftitlepage')]|h:div[@data-type='part']"

var elements = {
  "chapter" : 0,
  "appendix" : 0,
  "afterword" : 0,
  "bibliography" : 0,
  "glossary" : 0,
  "preface" : 0,
  "foreword" : 0,
  "introduction" : 0,
  // "halftitlepage" : 0,
  // "titlepage" : 0,
  // "copyright-page" : 0,
  // "dedication" : 0,
  // "colophon" : 0,
  "acknowledgments" : 0,
  "afterword" : 0,
  "conclusion" : 0,
  "part" : 0,
  // "toc" : 0,
  "index" : 0,
  "sect1": 1,
  "sect2": 2,
  "sect3": 3,
  "sect4": 4,
  "sect5": 5
};

var depthLimit = 1;

var getSections = function($, $root, baseHref){

    // var $sections = $root.children("section:not([data-type='dedication']):not([data-type='titlepage']):not([data-type='toc']):not([data-type='colophon']):not([data-type='copyright-page']):not([data-type='halftitlepage']), div[data-type='part']");
    var $sections = $root.children("section[data-type], div[data-type='part']");
    var list = [];

    $sections.each(function(index, section){
      var $section = $(section);
      var $title = $section.find("h1, h2, h3, h4, h5");
      var item = {
        id: $section.attr("id"),
        type: $section.attr("data-type")
      };
      var level;

      if(item.type in elements) {
        level = elements[item.type];
      } else {
        return;
      }

      // Add Fragment if not at top level document

      if(item.id && section.parent != null) {
        item.href = baseHref + "#" + item.id;
      } else {
        item.href = baseHref;
      }

      if($title.length) {
        item.label = $title.first().text();
      }

      // Check if not sectX or sectX is < the limit
      // if(item.type.indexOf("sect") != 0 || parseInt(item.type.replace("sect", "")) <= depthLimit) {
      if(level <= depthLimit) {
        item.children = getSections($, $section, baseHref);
      }
      list.push(item);
    });

    return list;
  };

var extractSections = function($, baseHref) {
  
  var $root = $.root();
  var $body = $("body");
  if($body.length){
    $root = $body;
  }
  return getSections($, $root, baseHref);
}

var toHtml = function(nav){
  
  var $ = cheerio.load('<nav data-type="toc">');
  var generate = function($root, items) {
    var $ul = $("<ul>");
    items.forEach(function(item){
      var $li = $("<li>");
      var $a = $("<a>");
      
      $a.text(item.label);
      $a.attr("href", item.href);

      $li.append($a);
      $ul.append($li);
      
      if(item.children){
        generate($li, item.children)
      }
    });

    $root.append($ul);
  };

  var output = generate($.root().children("nav"), nav);
  return $.html();
}

module.exports = function(options) {

  var nav = {"navigation": []};
  var needReplacements = [];  
  var settings = _.defaults(options || {}, {
     inputMode: { xmlMode: true, decodeEntities: false },
     path: 'nav.json'
   });
   
  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {
    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-epub',  'Streaming not supported')); }
    
    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var baseHref = file.relative;

    var list = extractSections($, baseHref);

    // if(list.length === 0){
    //   nav.push({
    //     href: baseHref
    //   });
    // } else {
    //   nav = nav.concat(list);
    // }
    if(list.length > 0){
      nav.navigation = nav.navigation.concat(list);
    }
    
    
    // var $nav = $("nav[data-type='toc']");
    // this.push(file);
    return done();
    
  }, function(done){
    var navFile = new gutil.File({path: settings.path});
    navFile.contents = new Buffer(JSON.stringify(nav, null, '  '));
    
    this.push(navFile);

    if(settings.finished) settings.finished(nav);

    return done();
  });

  
  // returning the file stream
  return stream;
};
