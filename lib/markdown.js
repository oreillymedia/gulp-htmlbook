var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");
var inputSettings = { xmlMode: true, decodeEntities: false };
var outputSettings = { xmlMode: false, decodeEntities: false };


var htmlbook = require('htmlbook');

function markdown() {

  var stream = through.obj(function(file, enc, next) {

    var result;
    var contents = file.contents.toString("utf-8");

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-markdown',  'Streaming not supported')); }

    result = htmlbook(contents).parse();

    file.contents = new Buffer(result, "utf-8");
    file.path = gutil.replaceExtension(file.path, '.html');

    this.push(file);

    return next();

  });

  // returning the file stream
  return stream;
};

module.exports = markdown;
