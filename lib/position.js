var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");
var path = require("path");

function gulpPosition(spine, nav) {
  return new Position(spine, nav);
}

function Position(spine, titles) {

  var position = this;

  // this.byHref = {};

  // for (var i = 0; i < nav.length; i++) {
  //   this.byHref[nav[i].href] = i;
  // };

  this.spine = spine.map(function(item) { return path.basename(item) });
  this.titles = titles;

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

  var label, nextLabel, prevLabel;

  if(index != -1) {

    label = this.titles[filename];

    result.current_url = this.spine[index];
    result.current_link = '<a href="'+ result.current_url +'">Current</a>';

    if(label) {
      result.label = label;
    }
  }

  if(index != -1 && next < total) {
    result.next_url = this.spine[next];
    nextLabel = this.titles[result.next_url];

    if(nextLabel) {
      result.next_link = '<a href="'+ result.next_url +'" title="' + nextLabel + '">Next</a>';
      result.next_label = nextLabel;
    } else {
      result.next_link = '<a href="'+ result.next_url +'">Next</a>';
      result.next_label = 'Next';
    }

  }

  if(index != -1 && prev >= 0) {
    result.prev_url = this.spine[prev];
    prevLabel = this.titles[result.prev_url];

    if(prevLabel) {
      result.prev_link = '<a href="'+ result.prev_url +'" title="' + prevLabel + '">Previous</a>';
      result.prev_label = prevLabel;
    } else {
      result.prev_link = '<a href="'+ result.prev_url +'">Previous</a>';
      result.prev_label = 'Previous';
    }
  }

  return result;
}

module.exports = gulpPosition;