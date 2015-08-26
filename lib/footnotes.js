// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var _ = require("lodash");

//Plugin Specific
var cheerio = require('cheerio');

var generateID = require('./generateid');

function gulpFootnotes(options) {

  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true,
		globalCount: false
  });

	var globalCount;

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {


    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-footnotes',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var filePath = file.relative;

		var counter = settings.globalCount ? globalCount : 1;

		// <span data-type="footnote"> to
    // <sup><a data-type="noteref" id="idp413360-marker" href="ch02.html#idp413360">1</a></sup>
		// <div data-type="footnotes"><p data-type="footnote" id="idp413360"><sup><a href="ch02.html#idp413360-marker">1</a></sup></p></div></div>

    var $footnotes = $("span[data-type='footnote']");

		if($footnotes.length > 0) {

			$footnotes_holder = $('<div data-type="footnotes">');
			$('section').first().append($footnotes_holder)
		}

    $footnotes.each(function(index, span){
      var $span = $(span);
			var $p = $('<p data-type="footnote">');
			var $noteref, $back;
      var generatedId = generateID($span, filePath);

			$noteref = $('<sup><a data-type="noteref" id="'+generatedId+'-marker" href="#'+generatedId+'">'+counter+'</a></sup>');
			$back = $('<sup><a href="#'+generatedId+'-marker">'+counter+'</a></sup>');

			// Add the note id to the new footnote
      $p.attr('id', generatedId);
			// Clone the content of the footnote into the new p
			$p.html($span.html());
			$p.prepend($back);
			// Add the p note to the footnote holder div at the bottom
			$footnotes_holder.append($p);

			$span.replaceWith($noteref);

			counter++;
    });

    if(settings.output) {
      file.contents = new Buffer($.html(settings.outputMode));
    }

    file.$ = $;

    this.push(file);

		if(settings.globalCount) {
			globalCount = counter;
		}
		
    return done();

  });

  // returning the file stream
  return stream;
};

// exporting the plugin main function
module.exports = gulpFootnotes;