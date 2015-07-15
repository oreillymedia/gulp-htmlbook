// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var Promise = require("bluebird");
var _ = require("lodash");
var sorted = require('sorted');

//Plugin Specific
var cheerio = require('cheerio');
// var fs = require('fs');
// var traverse = require('traverse');

var generateID = require('./generateid');
var formating = require('../localizations/en.json');

var symbols = {
  '!' : true,
  '@' : true,
  '#' : true,
  '$' : true,
  '%' : true,
  '^' : true,
  '&' : true,
  '*' : true,
  '(' : true,
  ')' : true,
  '-' : true,
  '_' : true,
  '+' : true,
  '=' : true,
  '[' : true,
  '{' : true,
  ']' : true,
  '}' : true,
  '|' : true,
  '\\' : true,
  ':' : true,
  ';' : true,
  '"' : true,
  '\'' : true,
  '<' : true,
  '>' : true,
  ',' : true,
  '.' : true,
  '/' : true,
  '?' : true,
  '1' : true,
  '2' : true,
  '3' : true,
  '4' : true,
  '5' : true,
  '6' : true,
  '7' : true,
  '8' : true,
  '9' : true,
  '0' : true
};
// consts
const PLUGIN_NAME = 'gulp-indexer';


// plugin level function (dealing with files)
function gulpIndexer(options) {

  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    path: 'index.json'
  });

  var index = {title: "root", children: [] };
  var indexes = {};

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {
    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-indexer',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

    var elements = $('*').toArray();

    // <a contenteditable="false" data-primary="web servers" data-type="indexterm">&nbsp;</a>
    // <a contenteditable="false" data-primary="HTTP" data-secondary="defined" data-type="indexterm">
    var $links = $("a[data-type='indexterm']");
    $links.each(function(index, link){
      var item = {};
      var $link = $(link);
      //(ancestor-or-self::h:nav|ancestor-or-self::h:div[@data-type='part']|ancestor-or-self::h:section)
      var $section = $link.parents("nav, div[data-type='part'], section").first();
      var $title;

      var primary = $link.attr("data-primary");
      var secondary = $link.attr("data-secondary");
      var tertiary = $link.attr("data-tertiary");
      var id = $link.attr("id");
      var generatedId;

      if($section.length === 0){
        console.error("MISSING TITLE");
      }

      // Get the title from the parent section header
      if($section.length){
        $title = $section.find("> h1, > h2, > h3, > h4, > h5").first();
        if($title.length){
          item.title = $title.text();
        }
      }

      if(primary){
        item.primary = primary;
      }

      if(secondary){
        item.secondary = secondary;
      }

      if(tertiary){
        item.tertiary = tertiary;
      }

      item.link = filePath;
      if(id){
        item.link += ("#"+id);
      } else {
        // position = elements.indexOf(link);
        // item.link += "#" + idPrefix + count + "-" + position;
        generatedId = generateID($link, filePath);
        item.link += "#" + generatedId;
      }

      item.charecter = item.primary.substring(0,1).toUpperCase();

      if(item.charecter in symbols){
        item.charecter = '*';
      }

      addToIndex(item);

    });

    //this.push(file);

    return done();

  }, function(done){
    var sort = toSortedArray(index);
    var indexed = sort.children;
    var indexFile = new gutil.File({path: settings.path});

    // Overide to replace *
    if(indexed && indexed.length){
      indexed[0].title = formating.gentext["index symbols"];
    }

    indexFile.contents = new Buffer(JSON.stringify({ "indexed": indexed }, null, '  '));

    this.push(indexFile);

    if(settings.finished) {
      settings.finished(indexed);
    }

    done();
  });

  function addToIndex(item){
    var parts = { charecter : false,
                  primary : false,
                  secondary : false,
                  tertiary : false
                };

    var levels = ["charecter", "primary", "secondary", "tertiary"];

    levels.forEach(function(level, i){
      var selected = item[level];
      var parent = levels[i-1] && parts[levels[i-1]] ? parts[levels[i-1]] : index;
      var pos;
      var added = {title: selected, children: [] , terms: []};
      // var key = level+":"+selected+":"+item.charecter;
      var key = '';
      var current;

      if(!selected) {
        return;
      }

      for (var j = 0; j < i; j++) {
        current = parts[levels[j]]
        key += current.title + ":";
      };

      key += selected;

      if(key in indexes) {
        parts[level] = parent.children[indexes[key]];
      } else {
        pos = parent.children.push(added) - 1;
        indexes[key] = pos;
        parts[level] = parent.children[pos];
      }

    });
    // console.log(parts)
    // If tertiary exists, assign as item
    if(parts.tertiary) {
      parts.tertiary.terms.push(item);
      // console.log(parts.tertiary)
      // indexes[item.charecter][item.primary][item.secondary][item.tertiary] = item;
      // console.log(indexes[item.primary][item.secondary][item.tertiary])
      return parts.tertiary;
    }

    // If secondary exists, assign as item
    if(parts.secondary) {
      // indexes[item.charecter][item.primary][item.secondary] = item;
      parts.secondary.terms.push(item);
      return parts.secondary;
    }

    // If primary exists, assign as item
    if(parts.primary) {
      // indexes[item.charecter][item.primary] = item;
      parts.primary.terms.push(item);
      return parts.primary;
    }

  }

  // returning the file stream
  return stream;
};

function compareTitles(_a, _b) {
  var a = (_a && _a.title) ? _a.title.toLowerCase() : '';
  var b = (_b && _b.title) ? _b.title.toLowerCase() : '';
  if (a == b) return 0;
  else if (a > b) return 1;
  else if (a < b) return -1;
  else throw new RangeError('Unstable comparison: ' + _a + ' cmp ' + _b);
}

function toSortedArray(sort){
  // var stack = [];
  var sorting;

  if(sort && sort.children){

    sorting = sorted(sort.children, compareTitles);
    sort.children = sorting.toArray();


    sort.children.forEach(function(arr){
      // stack.push
      arr = toSortedArray(arr);
    });

  }

  if(sort && sort.terms){

    sorting = sorted(sort.terms, compareTitles);
    sort.terms = sorting.toArray();

    sort.terms.forEach(function(arr){
      // stack.push
      arr = toSortedArray(arr);
    });

  }

  return sort;
};
// exporting the plugin main function
module.exports = gulpIndexer;
