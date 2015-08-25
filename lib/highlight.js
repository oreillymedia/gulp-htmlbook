// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");
var inputSettings = { xmlMode: true, decodeEntities: false };
var outputSettings = { xmlMode: false, decodeEntities: false };
var cheerio = require('cheerio');
var entities = require("entities");
var pygmentize = require('pygmentize-bundled')
var Promise = require("bluebird");

module.exports = function(finished, options) {

  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
		outputMode: { xmlMode: false, decodeEntities: false },
		output: true,
		log: gutil.log
  });

  var titles = {};

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, next) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-highlight',  'Streaming not supported')); }

    var $ = cheerio.load(file.contents.toString(), settings.inputMode);
		var $pres = $('pre[data-code-language]');
		var finished = 0;
		var errored;
    var parallel = 10;
    var async = require('async');
    var tasks = [];
    var task = function($pre, lang, code_contents){
      return function (callback) {
        pygmentize({ lang: lang, format: 'html', options: {} }, code_contents, function (err, result) {
          var $result;
  				var $spans;

  				if(err) {
  					settings.log(err);
            callback(err);
  				} else {
  					// Load the result into a cheerio doc
  					$tempDoc = cheerio.load(result.toString(), settings.outputMode);

  					// Find all spans
  					$spans = $tempDoc('span');
  					// Switch spans -> code
  					$spans.each(function (index, span) {
              span.name = "code";
  					});

  					// Add back to pre tag in main document
  					$pre.html($tempDoc('div.highlight > pre').html());
            callback(null, 1);
  				}
        });
      }
    };
		if ($pres.length == 0) {
			this.push(file);
			return next();
		}

		$pres.each(function (index, pre) {
			var $pre = $(pre);
			var lang = $pre.attr("data-code-language");
      var code_contents = entities.decodeHTML($pre.html()); // Decode entities before passing to pygmnetize

      tasks.push(task($pre, lang, code_contents));

		});

    async.parallelLimit(tasks, parallel, function () {
      if(settings.output){
        file.contents = new Buffer($.html(settings.outputMode));
      }

      file.$ = $;

      this.push(file);
      next();
    }.bind(this))

  });

  // returning the file stream
  return stream;
};