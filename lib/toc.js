var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

var fs = require('fs');
var Promise = require("bluebird");

var liquify = require("../plugins/gulp-liquid/liquify.js");
var tinyliquid = require("tinyliquid");
var path = require("path");

// Promisify to use readFileAsync
Promise.promisifyAll(fs);

function gulpToc(options) {

  var settings = _.defaults(options || {}, {
     templatePath: './layouts/default_nav.html',
     path: 'nav.html'
   });

  var compiled = fs.readFileAsync(options.templatePath)
    .then(function(contents) {
      return tinyliquid.compile(contents.toString());
    });
  var includeBase = path.dirname(options.templatePath);
  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    
    var json = JSON.parse(file.contents.toString("utf-8"));

    compiled
      .then(function(template) {
        return liquify(template, json, includeBase);
      })
      .then(function(result) { 

        var navFile = new gutil.File({path: settings.path});
        navFile.contents = new Buffer(result, "utf-8");
    
        this.push(navFile);

        return cb();
      }.bind(this));

  });

  // returning the file stream
  return stream;
};

module.exports = gulpToc;