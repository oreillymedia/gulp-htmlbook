var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var fs = require('fs');
var Promise = require("bluebird");
var _ = require("lodash");

// consts
const PLUGIN_NAME = 'gulp-liquid-wrap';

// var Liquid = require("liquid-node");
// var engine = new Liquid.Engine;
var tinyliquid = require("tinyliquid");

// Promisify to use readFileAsync
Promise.promisifyAll(fs);

// plugin level function (dealing with files)
function gulpWrap(options) {

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

        // Replace content with section
        tempLocals[wrapper] = file.contents.toString("utf-8");

        return render(template, tempLocals); 
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

function render(template, locals){
  
  return new Promise(function (resolve, reject) {
    
    var context = tinyliquid.newContext({
      locals: locals
    });

    context.onInclude(function (name, callback, includeBase) {
      fs.readFile((includeBase || "./") + name, "utf-8", function (err, text) {
        if (err) return callback(err);
        var ast = tinyliquid.parse(text);
        callback(null, ast);
      });
    });
    
    template(context, function (err) {
      if (err) return reject(err);
      resolve(context.getBuffer());
    });
  });
}

// exporting the plugin main function
module.exports = gulpWrap;