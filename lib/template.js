var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var fs = require('fs');
var Promise = require("bluebird");
var _ = require("lodash");

var liquify = require("../plugins/gulp-liquid/liquify.js");
var tinyliquid = require("tinyliquid");

// Promisify to use readFileAsync
Promise.promisifyAll(fs);

// plugin level function (dealing with files)
function template(options) {

  var templatePath = options.templatePath;
  var wrapper = options.wrapper || "content";
  var locals = options.locals || {};
  var template;
  var compiled = fs.readFileAsync(templatePath)
    .then(function(contents) {
      return tinyliquid.compile(contents.toString());
    });

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {

    // Clone a fresh copy, so as not to affect others
    var tempLocals = _.clone(locals);

    // Apply file specific locals
    if(file.locals) {
      tempLocals = _.defaults(file.locals, tempLocals);
    }

    compiled
      .then(function(template) {

        return liquify(file.contents.toString("utf-8"), tempLocals)
          .then(function(contents) {
            // Replace content with section
            tempLocals[wrapper] = contents;

            return liquify(template, tempLocals);

          }.bind(this));
      })
      .then(function(result) {
        file.contents = new Buffer(result, "utf-8");
        this.push(file);
        return cb();
      }.bind(this));
  });

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = template;
