var cheerio = require('cheerio');
var slug = require('slug');
var _ = require("lodash");
var Hashids = require("hashids");
var gutil = require('gulp-util');
var htmlElements = [ 'html', 'head', 'title', 'base', 'link', 'meta', 'style', 'script', 'noscript', 'template', 'body', 'section', 'nav', 'article', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer', 'address', 'main', 'p', 'hr', 'pre', 'blockqoute', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'div', 'a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr', 'table' ];

// Generate ID
function generateID($element, filename, _prefix, _logger){
  var element;
  var $title;
  var generatedId;
  var prefix = _prefix || "id-";
  var hashids;
  var root;
  var elements;
  var id;
  var combo = [];
  var title = '';
  var elPosition = 0;
  var encoded;
  var $parents;
  var hashids = new Hashids(filename || null, 5);
  var log = _logger || gutil.log;
  var previous;

  if(!$element) {
    log("generateID: No Element Provided");
    return null;
  }

  element = $element[0];
  combo.push(htmlElements.indexOf(element.name));

  // Don't replace id if present
  id = $element.attr("id");
  if(id){
    return id;
  }

  // Try to find a heading element to use as a title
  $title = $element.find("h1, h2, h3, h4, h5").first();

  // Get all parents
  $parents = $element.parents();

  // Starting with current element, work backwards
  previous = element;

  if($parents.length){
    // Find the index of the current element in it's parent
    $parents.each(function(index, parent) {
      var position = $parents.eq(index).children().toArray().indexOf(previous);
      combo.push(position);
      previous = parent;
    });
  }

  // Position in the root
  while (previous.previousSibling) {
    previous = previous.previousSibling;

    if(previous.type != 'tag'){
      elPosition++;
    }
  }
  combo.push(elPosition);

  // Encoded the Positions to text string
  encoded = hashids.encode(combo);

  if(!encoded.length){
    log("generateID: Encoding Failed");
    return null;
  }

  if($title.length){
    title = $title.text().toLowerCase();
    generatedId = slug(title);

    if(_.isNumber(generatedId[0])) {
      generatedId = prefix + generatedId;
    }

    return generatedId + "-" + encoded;

  } else {

    return prefix + encoded;

  }


}

module.exports = generateID;