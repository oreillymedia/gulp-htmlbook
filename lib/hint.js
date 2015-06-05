var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var HTMLHint  = require("htmlhint").HTMLHint;
var path = require('path');
var chalk = require('chalk');

module.exports = function() {

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, cb) {
    var contents = file.contents.toString("utf-8");
    var messages = HTMLHint.verify(contents, {
      'tag-pair': true,
      'attr-no-duplication': true,
      'spec-char-escape': false, // Gives bad errors with missing tags
      'id-unique': true,
      'src-not-empty': true
    });
    var filename = path.basename(file.path);

    messages.forEach(function(msg) {
      var msgString;
      
      if(msg.type === "error") {
        
        gutil.log("Invalid:", 
                  chalk.red(msg.message), 
                  "at" ,
                  chalk.red(msg.evidence),
                  "in",
                  chalk.red(filename),
                  "(line:", chalk.red(msg.line),
                  "col:", chalk.red(msg.col) + ")");
        
        msgString = ["Invalid:", msg.message, 
                    "at", msg.evidence, "in", "'"+filename+"'", 
                    "(line:", msg.line, "col:", msg.col + ")"].join(' ');
                    
        _settings.log.error.push(msgString);
                                  
      }
      
      
      if(msg.type === "warn") {
        gutil.log("Warning:", 
                  chalk.yellow(msg.message), 
                  "at" ,
                  chalk.yellow(msg.evidence),
                  "in",
                  chalk.yellow(filename),
                  "(line:", chalk.yellow(msg.line),
                  "col:", chalk.yellow(msg.col) + ")");
                  
       _settings.log.error.push(["Warning:", msg.message, 
                                 "at", msg.evidence, "in", "\""+filename+"\"", 
                                 "(line:", msg.line, "col:", msg.col + ")"].join(' '));
      }
      
    });
    
    cb(null, file);

  });

  // returning the file stream
  return stream;
};