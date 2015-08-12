// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");
var inputSettings = { xmlMode: true, decodeEntities: false };
var outputSettings = { xmlMode: false, decodeEntities: false };
var cheerio = require('cheerio');

var pygmentize = require('pygmentize-bundled')

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

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
		var $pres = $('pre[data-code-language]');
		var finished = 0;
		var errored;

		if ($pres.length == 0) {
			this.push(file);
			return next();
		}

		$pres.each(function (index, pre) {
			var $pre = $(pre);
			var lang = $pre.attr("data-code-language");

			pygmentize({ lang: lang, format: 'html', options: {} }, $pre.html(), function (err, result) {
				var $result;
				var $spans;

				if(err) {
					settings.log(err);
				} else {
					// Load the result into a cheerio doc
					$tempDoc = cheerio.load(result.toString());
					// Find all spans
					$spans = $tempDoc('span');
					// Switch spans -> code
					$spans.each(function (index, span) {
						var $span = $(span);
						var content = $span.text();
						var $c = $('<code>');
						var classes = $span.attr('class');
						$c.attr('class', classes);
						$c.text(content);
						// Append to root
						$tempDoc.root().append($c);
					});

					// Remove original wrapper
					$tempDoc('div.highlight').remove();

					// Add back to pre tag in main document
					$pre.html($tempDoc.root().html());
				}

				finished++;

				if(finished == $pres.length) {

					if(settings.output){
						file.contents = new Buffer($.html(settings.outputMode));
					}

					file.$ = $;

					this.push(file);
					next();
				}

			}.bind(this));

		}.bind(this));

  });

  // returning the file stream
  return stream;
};