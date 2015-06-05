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
  var files = [];
  var compiled = fs.readFileAsync(templatePath)
    .then(function(contents) {
      return tinyliquid.compile(contents.toString());
    });
  
  // creating a stream through which each file will pass
  var stream = through.obj(
    function(file, enc, cb) {
      files.push(file);
      cb(null, file);
    },
    function(cb) {
      var promises = [];
      files.forEach(function(file){
        // Clone a fresh copy, so as not to affect others
        var tempLocals = _.clone(locals);

        // Apply file specific locals
        if(file.locals) {
          // console.log(file.locals)
          tempLocals = _.defaults(file.locals, tempLocals);
        }

        var promise = compiled
          .then(function(template) { 

            // Replace content with section
            tempLocals[wrapper] = file.contents.toString("utf-8");

            return liquify(template, tempLocals); 
          })
          .then(function(result) {
            console.log(result)

            file.contents = new Buffer(result, "utf-8");
            return this.push(file);
          }.bind(this));

        promises.push(promise);
      }.bind(this));
      
      Promise.all(promises).then(function(){
        cb();
      });
  });

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = template;