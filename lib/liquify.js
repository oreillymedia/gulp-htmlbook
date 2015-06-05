var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

var liquify = require("../plugins/gulp-liquid/index.js");

// plugin level function (dealing with files)
function gulpLiquify(locals) {

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {

    // Clone a fresh copy, so as not to affect others
    var tempLocals = locals ? _.clone(locals) : {};

    // Apply file specific locals
    if(file.locals) {
      tempLocals = _.defaults(file.locals, tempLocals);
    }
    
    liquify(file.contents.toString("utf-8"), tempLocals)
      .then(function(result) { 
        file.contents = new Buffer(result, "utf-8");
        this.push(file);
        return cb();
      }.bind(this));

  });

  // returning the file stream
  return stream;
};

module.exports = gulpLiquify;