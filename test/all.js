var htmlbook = require('../');
var should = require('should');
var cheerio = require("cheerio");
var assert = require("assert");

var File = require('vinyl');

require('mocha');

describe('Remove CDATA', function() {

	it('Remove the CDATA Elements', function(done) {
		var contents = '\
    <pre data-code-language="scala" data-not-executable="true" data-type="programlisting">\
    <![CDATA[\
      <=\
    ]]>\
    </pre>\
		';

		// create the fake files
		var chapterOne = new File({
			contents: new Buffer(contents),
			path: "./chapterOne.html"
		});

		var stream = htmlbook.process.escape();


		stream.on('data', function(file) {
			// make sure it came out the same way it went in
			assert(file.isBuffer());

			var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
			$heading = $doc("pre");
			$heading.html().should.equal('          &lt;&equals;        ');
			done();
		});

		stream.write(chapterOne);
		stream.end();

	});
});