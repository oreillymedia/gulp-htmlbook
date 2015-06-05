var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");
var path = require("path");

function gulpPosition(spine, nav) {
  return new Position(spine, nav);
}

function Position(spine, nav) {

  var position = this;

  this.byHref = {};

  for (var i = 0; i < nav.length; i++) {
    this.byHref[nav[i].href] = i;
  };

  this.spine = spine.map(function(item) { return path.basename(item) });
  this.nav = nav;


  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, next) {

    // Get current chunks filename
    var filename = file.relative;
    var positions = position.get(filename);

    file.locals = _.extend(file.locals || {}, positions);

    this.push(file);
    
    return next();
  });

  // returning the file stream
  return stream;
};

Position.prototype.get = function(filename){
    
  var result = {};

  // Find index of current chunk
  var index = this.spine.indexOf(filename);
  
  var total = this.spine.length;
  var next = index + 1;
  var prev = index - 1;

  var nextItem, nextNavItem, prevNavItem, prevItem;

  var label;

  if(index != -1) {

    if(index in this.nav) {
      label = this.nav[index].label;
    }
    
    result.current_url = this.spine[index];
    result.current_link = '<a href="'+ result.current_url +'">Current</a>';

    if(label) {
      result.label = label;
    }
  }

  if(index != -1 && next < total) {
    result.next_url = this.spine[next];
    // nextNavItem = this.byHref[result.next_url];

    if(nextNavItem) {
      nextItem = this.nav[nextNavItem];
      result.next_link = '<a href="'+ result.next_url +'" title="' + nextItem.label + '">Next</a>';
    } else {
      result.next_link = '<a href="'+ result.next_url +'">Next</a>';
    }
  }

  if(index != -1 && prev > 0) {
    result.prev_url = this.spine[prev];
    // prevNavItem = this.byHref[result.next_url];
    if(prevNavItem) {
      prevItem = this.nav[prevNavItem];
      result.prev_link = '<a href="'+ result.prev_url +'" title="' + prevItem.label + '">Previous</a>';
    } else {
      result.prev_link = '<a href="'+ result.prev_url +'">Previous</a>';
    }
  }

  return result;
}

module.exports = gulpPosition;