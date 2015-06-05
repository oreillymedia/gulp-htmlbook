var cheerio = require('cheerio');
var slug = require('slug');
var _ = require("lodash");
var Hashids = require("hashids");

var htmlElements = [ 'html', 'head', 'title', 'base', 'link', 'meta', 'style', 'script', 'noscript', 'template', 'body', 'section', 'nav', 'article', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'footer', 'address', 'main', 'p', 'hr', 'pre', 'blockqoute', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'div', 'a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr', 'table' ];

// Generate ID
function generateID($element, filename, _prefix){
  var element;
  var $title;
  var generatedId;
  var prefix = _prefix || "id-";
  var hashids;
  var root;
  var elements;
  var id;
  var name = 'fred'; 
  var combo = [];
  var title = '';
  var position = 0;
  var elPosition;
  var encoded;
  var $parents;
  var hashids = new Hashids(filename || null, 5);

  if(!$element) {
    console.log("No Element Provided");
    return null;
  }

  element = $element[0];

  // Don't replace id if present
  id = $element.attr("id");
  if(id){
    return id;
  }

  // Try to find a heading element to use as a title
  $title = $element.find("h1, h2, h3, h4, h5").first();
  
  // Get all parents
  $parents = $element.parents('*');
  
  if($parents.length){
    
    // Get the root element
    root = $parents.last();
    
    // Get current elements position in root's children array
    position = root.find("*").toArray().indexOf(element);    
  }
  
  elPosition = htmlElements.indexOf(element.name);

  // combo = [position, htmlElements.indexOf(element.name), element.children.length];
  combo = [position, elPosition];
  encoded = hashids.encode(combo);

  if(!encoded.length){
    console.error("Encoding Failed");
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