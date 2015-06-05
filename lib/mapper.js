var generateID = require('./generateid');
var Counter = require('./counter');
var $ = require('cheerio');

var sectionalElements = [
  'acknowledgments',
  'afterword',
  'appendix',
  'bibliography',
  'chapter',
  'colophon',
  'conclusion',
  'copyright-page',
  'dedication',
  'foreword',
  'glossary',
  'halftitlepage',
  'index',
  'introduction',
  'preface',
  'titlepage',
  'toc'
];

var sectionQuery = sectionalElements.map(function(element) {
  return "section[data-type='"+element+"']";
}).join(", ");

function Mapper(map) {
  this.map = map || {};
  this.counter = new Counter();
};

Mapper.prototype.parse = function(contents, filePath, xmlMode) {
  
  var $doc = (typeof(contents) === 'string') ? $.load(contents, { xmlMode: xmlMode || false, decodeEntities: false }) : contents;

  var query = "section[data-type], div[data-type], figure, table";

  // Find elements without id's
  var $elements = $doc(query);

  $elements.each(function(index, element){
    
    var item;
    var $el = $(element);
    var id = $el.attr('id');
    var data = $el.data("type");
    var name = data || $el[0].name;
    var $parent = $el.parents(sectionQuery + ", div[data-type]" ).first();
    var children;
    var indexInElement;
    var $title = $el.find("h1, h2, h3, h4, h5");
    var elQuery;

    if(!id) {
      id = generateID($el, filePath);
      $el.attr("id", id);
    }

    item = {
      'id' : id,
      'name' : name,
      'path' : filePath,
      'position': this.counter.add(name),
      'index' : 0,
      'parent' : $parent.attr('id'),
      'title' : $title.length ? $title.first().text() : ''
    };

    elQuery = $el[0].name;
    
    if(data) {
      elQuery += "[data-type='" + data + "']";
    }

    if($parent.length) {
      children = $parent.find(elQuery).toArray();
      indexInElement = children.indexOf($el[0]);
      if(indexInElement > -1){
        item.index = indexInElement + 1;
      }
    }

    this.add(item);

  }.bind(this));
  
  return this.map;
  
};

Mapper.prototype.add = function(item) {
  var id = item.id;

  if(id in this.map) {
    console.error("duplicate ID", id);
    console.log(item)
    // this.map[id] = item;
  } else {
    this.map[id] = item;
  }

  return this.map[id];
};

Mapper.prototype.find = function(element, filePath) {
  var $el = $(element);
  var id = $el.attr('id');

  if(!element){
    console.error("No Element Provided");
    return null;
  }

  if(!id) {
    id = generateID($el, filePath || '');
  }

  if(id in this.map) {
    return this.map[id];
  } else {
    console.error("Element not in Map:", id);
    return null;
  }

};

Mapper.prototype.get = function(id) {

  if(id in this.map) {
    return this.map[id];
  } else {
    console.error("Element not in Map:", id);
    return null;
  }

};

module.exports = Mapper;