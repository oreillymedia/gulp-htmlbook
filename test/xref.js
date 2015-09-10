var htmlbook = require('../');
var should = require('should');
var cheerio = require("cheerio");
var assert = require("assert");

var File = require('vinyl');

require('mocha');

// from xrefgen.xspec

// Tests around text nodes for formal XREF elements (those with data-type='xref')
describe('When *empty* XREF element is matched', function() {
  var content = '\
  <section id="chapter1" data-type="chapter">\
      <p>Here comes a cross-reference: see <a data-type="xref" href="#chapter1"/></p>\
  </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, 'test.html');
  var idMap = {
      titles: {},
      ids: mapped
    };

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.xrefs(mapped);
  stream.write(file);
  stream.end();

  // section//h:a[@data-type='xref'])[1]

  /*
  describe('And autogenerate-xrefs param is disabled', function() {
    it('No XREF text node should be generated', function(done) {

      //  <a data-type="xref" href="..."/>
      htmlbook.xref.replace(content, idMap);

      done();
    });
  });
  */

  describe('And autogenerate-xrefs param is enabled', function() {

    it('XREF text node should be generated with proper content', function(done) {

      // <a data-type="xref" href="...">Chapter 1</a>
      // var $doc = htmlbook.xref.replace(content, idMap);

      stream.once('data', function(file) {
        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });
        var text = $doc("a[data-type='xref']").text();

        text.should.equal("Chapter 1");

        done();

      });

    });

  });

});



describe('When *nonempty* XREF element is matched', function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
      <p>Here comes a cross-reference: see <a data-type="xref" href="#chapter1">PLACEHOLDER</a></p>\
    </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, 'test.html');
  var idMap = {
      titles: {},
      ids: mapped
    };

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.xrefs(mapped);
  stream.write(file);
  stream.end();

  //(//h:section//h:a[@data-type='xref'])[1]

  /*
  describe('And autogenerate-xrefs param is disabled', function() {
    it('No XREF text node should be generated', function(done) {

      //  <a data-type="xref" href="...">PLACEHOLDER</a>
      assert(false, "Unwritten");
      done();
    });
  });
  */

  describe('And autogenerate-xrefs param is enabled', function() {
    it('XREF text node should be generated with proper content', function(done) {

      //  <a data-type="xref" href="...">Chapter 1</a>

      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });
        var text = $doc("a[data-type='xref']").text();

        text.should.equal("Chapter 1");

        done();

      });

    });
  });


});

describe('When an XREF points to an id in another location:', function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
  <p>Here comes an XREF with an href pointing to another file: <a data-type="xref" id="empty_another_file" href="ch01.html#chapter1"/></p>\
  <p>Another XREF with an href pointing to another file: <a data-type="xref" id="nonempty_another_file" href="ch01.html#chapter1">PLACEHOLDER</a></p>\
  <p>XREF pointing to a URL <a data-type="xref" id="empty_web_url" href="http://oreilly.com/index.html#chapter1"/></p>\
  <p>Another XREF with an href pointing to another file: <a data-type="xref" id="nonempty_web_url" href="http://oreilly.com/index.html#chapter1">PLACEHOLDER</a></p>\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, 'ch01.html');
  var idMap = {
      titles: {},
      ids: mapped
    };

  describe('Which is another local file (text node of XREF empty)', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    //  //h:a[@id='empty_another_file']
    it('XREF text node should be generated with proper content', function(done) {

      //  <a data-type="xref" id="empty_another_file" href="...">Chapter 1</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        var $ref = $doc("a[id='empty_another_file']");
        var id = $ref.attr("id");
        var text = $ref.text();
        var link = $ref.attr("href");

        id.should.equal("empty_another_file");
        text.should.equal("Chapter 1");
        link.should.equal("ch01.html#chapter1");

        done();

      });


    });
  });


  describe('Which is another local file (text node of XREF nonempty)', function() {
    // //h:a[@id='nonempty_another_file']

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('XREF text node should be generated with proper content', function(done) {

      //    <a data-type="xref" id="nonempty_another_file" href="...">Chapter 1</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        var $ref = $doc("a[id='nonempty_another_file']");

        $ref.attr("id").should.equal("nonempty_another_file");
        $ref.text().should.equal("Chapter 1");
        $ref.attr("href").should.equal("ch01.html#chapter1");

        done();

      });
    });
  });

  // For now, we're arguing that if the @href value is not a legit XREF, that should override the fact that data-type="xref" is on the <a>
  describe('Which is a Web URL instead of a valid XREF (text node empty)', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    // //h:a[@id='empty_web_url']
    it('XREF text node should be left untouched', function(done) {

      //  <a data-type="xref" id="empty_web_url" href="..."/>

      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        var $ref = $doc("a[id='empty_web_url']");

        $ref.attr("id").should.equal("empty_web_url");
        $ref.text().should.equal('');
        $ref.attr("href").should.equal("http://oreilly.com/index.html#chapter1");

        done();

      });
    });
  });


  describe('Which is a Web URL instead of a valid XREF (text node nonempty)', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    // //h:a[@id='nonempty_web_url']
    it('XREF text node should be left untouched', function(done) {

      //  <a data-type="xref" id="nonempty_web_url" href="...">PLACEHOLDER</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        var $ref = $doc("a[id='nonempty_web_url']");

        $ref.attr("id").should.equal("nonempty_web_url");
        $ref.text().should.equal('PLACEHOLDER');
        $ref.attr("href").should.equal("http://oreilly.com/index.html#chapter1");

        done();

      });
    });
  });


});

describe('When an XREF has a bogus href:', function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
  <p>Here comes a bogus cross-reference: see <a data-type="xref" id="empty_bogus" href="#bogusbogus"/></p>\
  <p>Another bogus cross-referece: see <a data-type="xref" id="empty_file_bogus" href="ch01.html#bogus"/></p>\
  <p>Third bogus cross-reference: see <a data-type="xref" id="nonempty_bogus" href="#bogusbogus">I do believe this is bogus</a></p>\
  <p>Fourth bogus cross-reference: See <a data-type="xref" id="nonempty_file_bogus" href="ch01.html#bogus">I do believe this is bogus</a></p>\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, 'ch01.html');
  var idMap = {
      titles: {},
      ids: mapped
    };

  describe('And an empty text node', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Three question marks should be used for text node', function(done) {

      // <a data-type="xref" id="empty_bogus" href="...">???</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='empty_bogus']
        var $ref = $doc("a[id='empty_bogus']");

        $ref.attr("id").should.equal("empty_bogus");
        $ref.text().should.equal('???');
        $ref.attr("href").should.equal("#bogusbogus");

        done();

      });
    });
  });


  describe('Referencing another file and has an empty text node', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Three question marks should be used for text node', function(done) {

      // <a data-type="xref" id="empty_file_bogus" href="...">???</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='empty_file_bogus']
        var $ref = $doc("a[id='empty_file_bogus']");

        $ref.attr("id").should.equal("empty_file_bogus");
        $ref.text().should.equal('???');
        $ref.attr("href").should.equal("ch01.html#bogus");

        done();

      });

    });
  });

  describe('And a nonempty text node', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Three question marks should be used for text node', function(done) {

      // <a data-type="xref" id="nonempty_bogus" href="...">???</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='nonempty_bogus']
        var $ref = $doc("a[id='nonempty_bogus']");

        $ref.attr("id").should.equal("nonempty_bogus");
        $ref.text().should.equal('???');
        $ref.attr("href").should.equal("#bogusbogus");
        done();

      });

    });
  });


  describe('Referencing another file and has a nonempty text node', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Three question marks should be used for text node', function(done) {

      //  <a data-type="xref" id="nonempty_file_bogus" href="...">???</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='nonempty_file_bogus']
        var $ref = $doc("a[id='nonempty_file_bogus']");

        $ref.attr("id").should.equal("nonempty_file_bogus");
        $ref.text().should.equal('???');
        $ref.attr("href").should.equal("ch01.html#bogus");
        done();

      });

    });
  });


});

// Tests for text nodes of <a> elements that do not have data-type="xref"
describe("If an 'a' element does not contain data-type='xref'", function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
  <a id="no_data_type" href="#chapter1">DO NOT TOUCH ME</a> <!-- Don\'t update this one -->\
  <a id="link" data-type="link" href="#chapter1">DO NOT TOUCH ME</a> <!-- Don\'t update this one -->\
  <a id="no_data_type_no_text" href="#chapter1"/> <!-- Update this one -->\
  <a id="link_no_text" data-type="link" href="#chapter1"/> <!-- Don\'t update this one -->\
  <a id="no_data_type_no_text_bogus_href" href="#bogus"/> <!-- Update this one -->\
  <a id="link_no_text_bogus_href" data-type="link" href="#bogus"/> <!-- Don\'t update this one -->\
  <a id="no_data_type_no_text_href_not_xref" href="http://oreilly.com"/> <!-- Don\'t update this one -->\
  <a id="link_no_text_href_not_xref" data-type="link" href="http://oreilly.com"/> <!-- Don\'t update this one -->\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, '');
  var idMap = {
      titles: {},
      ids: mapped
    };
  describe('And an empty text node', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Text node should not be modified', function(done) {

      // <a id="no_data_type" href="...">DO NOT TOUCH ME</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='no_data_type']
        var $ref = $doc("a[id='no_data_type']");

        $ref.attr("id").should.equal("no_data_type");
        $ref.text().should.equal('DO NOT TOUCH ME');
        $ref.attr("href").should.equal("#chapter1");

        done();

      });

    });
  });

  describe('And has a text node already (link)', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Text node should not be modified', function(done) {

      // <a id="link" data-type="link" href="...">DO NOT TOUCH ME</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='link']
        var $ref = $doc("a[id='link']");

        $ref.attr("id").should.equal("link");
        $ref.text().should.equal('DO NOT TOUCH ME');
        $ref.attr("href").should.equal("#chapter1");

        done();

      });

    });
  });

  describe('And does not have a text node already, and has a valid XREF link', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    xit('Text node should be updated with proper gentext', function(done) {

      //  <a id="no_data_type_no_text" href="...">Chapter 1</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='no_data_type_no_text']
        var $ref = $doc("a[id='no_data_type_no_text']");

        $ref.attr("id").should.equal("no_data_type_no_text");
        $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("#chapter1");

        done();

      });

    });
  });

  describe('And does not have a text node already, but is a link with a valid XREF link', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Text node should be updated with proper gentext', function(done) {

      // <a id="link_no_text" data-type="link" href="..."/>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='link_no_text']
        var $ref = $doc("a[id='link_no_text']");

        $ref.attr("id").should.equal("link_no_text");
        $ref.text().should.equal('');
        $ref.attr("href").should.equal("#chapter1");

        done();

      });

    });
  });

  describe('And does not have a text node already, and has a bogus XREF link', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    xit('Text node should be updated with question marks', function(done) {

      // <a id="no_data_type_no_text_bogus_href" href="...">???</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='no_data_type_no_text_bogus_href']
        var $ref = $doc("a[id='no_data_type_no_text_bogus_href']");

        $ref.attr("id").should.equal("no_data_type_no_text_bogus_href");
        $ref.text().should.equal('???');
        $ref.attr("href").should.equal("#bogus");

        done();

      });

    });
  });

  describe('And does not have a text node already, and is a link with a bogus XREF link', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Text node should not be modified', function(done) {

      // <a id="link_no_text_bogus_href" data-type="link" href="..."/>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='link_no_text_bogus_href']
        var $ref = $doc("a[id='link_no_text_bogus_href']");

        $ref.attr("id").should.equal("link_no_text_bogus_href");
        $ref.text().should.equal('');
        $ref.attr("href").should.equal("#bogus");

        done();

      });

    });
  });

  describe('And does not have a text node already, and has an href that is not an XREF', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Text node should not be modified', function(done) {

      // <a id="no_data_type_no_text_href_not_xref" href="..."/>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='no_data_type_no_text_href_not_xref']
        var $ref = $doc("a[id='no_data_type_no_text_href_not_xref']");

        $ref.attr("id").should.equal("no_data_type_no_text_href_not_xref");
        $ref.text().should.equal('');
        $ref.attr("href").should.equal("http://oreilly.com");

        done();

      });

    });
  });

  describe('And does not have a text node already, and is a link with an href that is not an XREF', function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it('Text node should not be modified', function(done) {

      // <a id="link_no_text_href_not_xref" data-type="link" href="..."/>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='link_no_text_href_not_xref']
        var $ref = $doc("a[id='link_no_text_href_not_xref']");

        $ref.attr("id").should.equal("link_no_text_href_not_xref");
        $ref.text().should.equal('');
        $ref.attr("href").should.equal("http://oreilly.com");

        done();

      });

    });
  });

});

// Tests for hrefs on a elems with data-type="XREF"
describe("When an XREF element is matched that contains an href pointing to an id", function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
  <p>Here comes a cross-reference: see <a id="no_text_node" data-type="xref" href="#chapter1"/></p>\
  <p>Here comes an XREF with a text node: see <a id="text_node" data-type="xref" href="#chapter1">PLACEHOLDER TEXT</a></p>\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, '');
  var idMap = {
      titles: {},
      ids: mapped
    };
  describe("And the XREF contains no text node", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be processed as expected", function(done) {

      // <a data-type="xref" id="no_text_node" href="#chapter1">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='no_text_node']
        var $ref = $doc("a[id='no_text_node']");

        $ref.attr("id").should.equal("no_text_node");
        $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("#chapter1");

        done();

      });

    });
  });

  describe("And the XREF contains a text node", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be processed as expected", function(done) {

      // <a id="text_node" data-type="xref" href="#chapter1">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='text_node']
        var $ref = $doc("a[id='text_node']");

        $ref.attr("id").should.equal("text_node");
        $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("#chapter1");

        done();

      });

    });
  });

});

describe("When an XREF element is matched that contains an href pointing to an id (no initial #)", function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
  <p>Here comes a cross-reference: see <a id="no_text_node" data-type="xref" href="chapter1"/></p>\
  <p>Here comes an XREF with a text node: see <a id="text_node" data-type="xref" href="chapter1">PLACEHOLDER TEXT</a></p>\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, 'chapter1.html');
  var idMap = {
      titles: {},
      ids: mapped
    };
  describe("And the XREF contains no text node", function() {
    //  //h:a[@id='no_text_node']

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be processed as expected", function(done) {

      // <a data-type="xref" id="no_text_node" href="#chapter1">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='text_node']
        var $ref = $doc("a[id='no_text_node']");

        $ref.attr("id").should.equal("no_text_node");
        $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("chapter1.html#chapter1");

        done();

      });

    });
  });

  describe("And the XREF contains a text node", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be processed as expected", function(done) {

      // <a id="text_node" data-type="xref" href="#chapter1">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='text_node']
        var $ref = $doc("a[id='text_node']");

        $ref.attr("id").should.equal("text_node");
        $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("chapter1.html#chapter1");

        done();


      });
    });
  });

});

describe("When an XREF element is matched that contains an href pointing to a file/id", function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
  <p>Here comes a cross-reference: see <a id="no_text_node" data-type="xref" href="ch01.html#chapter1"/></p>\
  <p>Here comes an XREF with a text node: see <a id="text_node" data-type="xref" href="ch01.html#chapter1">PLACEHOLDER TEXT</a></p>\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, '');
  var idMap = {
      titles: {},
      ids: mapped
    };

  describe("And the XREF contains no text node", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be processed as expected", function(done) {

      // <a data-type="xref" id="no_text_node" href="#chapter1">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='no_text_node']
        var $ref = $doc("a[id='no_text_node']");

        $ref.attr("id").should.equal("no_text_node");
        $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("ch01.html#chapter1");

        done();

      });

    });
  });

  describe("And the XREF contains a text node", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be processed as expected", function(done) {

      // <a id="text_node" data-type="xref" href="#chapter1">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='text_node']
        var $ref = $doc("a[id='text_node']");

        $ref.attr("id").should.equal("text_node");
        $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("ch01.html#chapter1");

        done();

      });

    });
  });

});


describe("When an XREF element is matched that contains an href pointing to a Web URL (not a valid XREF)", function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
  <p>Here comes a cross-reference: see <a id="no_text_node" data-type="xref" href="http://oreilly.com/whatever.html#chapter1"/></p>\
  <p>Here comes an XREF with a text node: see <a id="text_node" data-type="xref" href="http://oreilly.com/whatever.html#chapter1">PLACEHOLDER TEXT</a></p>\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, '');
  var idMap = {
      titles: {},
      ids: mapped
    };

  describe("And the XREF contains no text node", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be left untouched", function(done) {

      // <a data-type="xref" id="no_text_node" href="http://oreilly.com/whatever.html#chapter1">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='no_text_node']
        var $ref = $doc("a[id='no_text_node']");

        $ref.attr("id").should.equal("no_text_node");
        // $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("http://oreilly.com/whatever.html#chapter1");

        done();

      });

    });
  });

  describe("And the XREF contains a text node", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be left untouched", function(done) {

      // <a id="text_node" data-type="xref" href="http://oreilly.com/whatever.html#chapter1">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='no_text_node']
        var $ref = $doc("a[id='text_node']");

        $ref.attr("id").should.equal("text_node");
        // $ref.text().should.equal('Chapter 1');
        $ref.attr("href").should.equal("http://oreilly.com/whatever.html#chapter1");

        done();

      });

    });
  });

});

describe("When an XREF element is matched that contains an href pointing to a mailto URL (not a valid XREF)", function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
  <p>Here comes a cross-reference: see <a id="no_text_node" data-type="xref" href="mailto:tools@oreilly.com"/></p>\
  <p>Here comes an XREF with a text node: see <a id="text_node" data-type="xref" href="mailto:tools@oreilly.com">PLACEHOLDER TEXT</a></p>\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, '');
  var idMap = {
      titles: {},
      ids: mapped
    };

  describe("And the XREF contains no text node", function() {
    //  //h:a[@id='no_text_node']

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be left untouched", function(done) {

      // <a data-type="xref" id="no_text_node" href="mailto:tools@oreilly.com">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='text_node']
        var $ref = $doc("a[id='no_text_node']");

        $ref.attr("id").should.equal("no_text_node");
        $ref.text().should.equal('');
        $ref.attr("href").should.equal("mailto:tools@oreilly.com");

        done();

      });

    });
  });

  describe("And the XREF contains a text node", function() {
    //  //h:a[@id='text_node']

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href attribute should be left untouched", function(done) {

      // <a id="text_node" data-type="xref" href="mailto:tools@oreilly.com">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id='text_node']
        var $ref = $doc("a[id='text_node']");

        $ref.attr("id").should.equal("text_node");
        $ref.text().should.equal('PLACEHOLDER TEXT');
        $ref.attr("href").should.equal("mailto:tools@oreilly.com");

        done();

      });

    });
  });

});

describe("When an 'a' element is matched that contains an href pointing to a bogus id", function() {

  var content = '\
    <section id="chapter1" data-type="chapter">\
      <p>Here comes a bogus cross-reference: see <a id="bogus_no_text_node" href="#bogus"/></p>\
      <p>Here comes a bogus cross-reference with a text node: see <a id="bogus_text_node" href="#bogus">PLACEHOLDER TEXT</a></p>\
      <p>Here comes a bogus cross-reference (random text): see <a id="random_bogus_no_text_node" data-type="xref" href="random_bogus_text"/></p>\
      <p>Here comes a bogus cross-reference (random text) with a text node: see <a id="random_bogus_text_node" href="random_bogus_text">PLACEHOLDER TEXT</a></p>\
      <p>Here comes a bogus cross-reference (random text): see <a id="fileref_bogus_no_text_node" href="ch01.html#bogus"/></p>\
      <p>Here comes a bogus cross-reference (random text) with a text node: see <a id="fileref_bogus_text_node" href="ch01.html#bogus">PLACEHOLDER TEXT</a></p>\
      <p>Here comes a bogus cross-reference: see <a id="bogus_no_text_node_link" data-type="link" href="#bogus"/></p>\
      <p>Here comes a bogus cross-reference with a text node: see <a id="bogus_text_node_link" data-type="link" href="#bogus">PLACEHOLDER TEXT</a></p>\
      <p>Here comes a bogus cross-reference (random text): see <a id="random_bogus_no_text_node_link" data-type="link" href="random_bogus_text"/></p>\
      <p>Here comes a bogus cross-reference (random text) with a text node: see <a id="random_bogus_text_node_link" data-type="link" href="random_bogus_text">PLACEHOLDER TEXT</a></p>\
      <p>Here comes a bogus cross-reference (random text): see <a id="fileref_bogus_no_text_node_link" data-type="link" href="ch01.html#bogus"/></p>\
      <p>Here comes a bogus cross-reference (random text) with a text node: see <a id="fileref_bogus_text_node_link" data-type="link" href="ch01.html#bogus">PLACEHOLDER TEXT</a></p>\
      </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  var mapped = mapper.parse(content, '');
  var idMap = {
      titles: {},
      ids: mapped
    };

  describe("Where id doesn't exist (no text node)", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    xit("href should resolve to # sign and content that follows", function(done) {

      // <a id="bogus_no_text_node" href="#bogus">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'bogus_no_text_node']
        var $ref = $doc("a[id='bogus_no_text_node']");

        $ref.attr("id").should.equal("bogus_no_text_node");
        $ref.text().should.equal('???');
        $ref.attr("href").should.equal("#bogus");

        done();

      });

    });
  });

  describe("Where id doesn't exist (text node)", function() {
    //  //h:a[@id = 'bogus_text_node']

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    xit("href should resolve to # sign and content that follows", function(done) {

      // <a id="bogus_text_node" href="#bogus">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'bogus_no_text_node']
        var $ref = $doc("a[id='bogus_text_node']");

        $ref.attr("id").should.equal("bogus_text_node");
        $ref.text().should.equal('PLACEHOLDER TEXT');
        $ref.attr("href").should.equal("#bogus");

        done();

      });

    });
  });

  describe("Where id doesn't exist and no # sign (no text node)", function() {
    //  //h:a[@id = 'random_bogus_no_text_node']

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    xit("href should resolve to # sign and existing href value", function(done) {

      // <a id="random_bogus_no_text_node" href="#random_bogus_text">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'random_bogus_no_text_node']
        var $ref = $doc("a[id='random_bogus_no_text_node']");

        $ref.attr("id").should.equal("random_bogus_no_text_node");
        $ref.text().should.equal('???');
        $ref.attr("href").should.equal("#random_bogus_text");

        done();

      });

    });
  });

  describe("Where id doesn't exist and no # sign (text node)", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    xit("href should resolve to # sign and existing href value", function(done) {

      // <a id="random_bogus_no_text_node" href="#random_bogus_text">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'random_bogus_no_text_node']
        var $ref = $doc("a[id='random_bogus_no_text_node']");

        $ref.attr("id").should.equal("random_bogus_no_text_node");
        $ref.text().should.equal('???');
        $ref.attr("href").should.equal("#random_bogus_text");

        done();

      });

    });
  });

  describe("Where href is a bogus file/id pair (no text node)", function() {
    //  //h:a[@id = 'fileref_bogus_no_text_node']

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    xit("href should resolve to # sign and content that follows", function(done) {

      // <a id="fileref_bogus_no_text_node" href="#bogus">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'fileref_bogus_no_text_node']
        var $ref = $doc("a[id='fileref_bogus_no_text_node']");

        $ref.attr("id").should.equal("fileref_bogus_no_text_node");
        $ref.text().should.equal('???');
        // Test orginaly says it should resolve to fragment, but not touching these
        // $ref.attr("href").should.equal("#bogus");
        $ref.attr("href").should.equal("ch01.html#bogus");

        done();

      });

    });
  });

  describe("Where href is a bogus file/id pair (text node)", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    xit("href should resolve to # sign and content that follows", function(done) {

      // <a id="fileref_bogus_text_node" href="#bogus">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'fileref_bogus_text_node']
        var $ref = $doc("a[id='fileref_bogus_text_node']");

        $ref.attr("id").should.equal("fileref_bogus_text_node");
        $ref.text().should.equal('PLACEHOLDER TEXT');

        // Test orginaly says it should resolve to fragment, but not touching these
        // $ref.attr("href").should.equal("#bogus");
        $ref.attr("href").should.equal("ch01.html#bogus");
        done();

      });
    });
  });

  describe("Where id doesn't exist (link; no text node)", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href should resolve to # sign and content that follows", function(done) {

      // <a id="bogus_no_text_node_link" data-type="link" href="#bogus">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'bogus_no_text_node_link']
        var $ref = $doc("a[id='bogus_no_text_node_link']");

        $ref.attr("id").should.equal("bogus_no_text_node_link");
        $ref.text().should.equal('');
        $ref.attr("href").should.equal("#bogus");

        done();

      });

    });
  });

  describe("Where id doesn't exist (link; text node)", function() {
    //  //h:a[@id = 'bogus_text_node_link']

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href should resolve to # sign and content that follows", function(done) {

      // <a id="bogus_text_node_link" data-type="link" href="#bogus">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'fileref_bogus_text_node']
        var $ref = $doc("a[id='bogus_text_node_link']");

        $ref.attr("id").should.equal("bogus_text_node_link");
        $ref.text().should.equal('PLACEHOLDER TEXT');
        $ref.attr("href").should.equal("#bogus");

        done();

      });

    });
  });

  describe("Where id doesn't exist and no # sign (link; no text node)", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href should resolve to # sign and existing href value", function(done) {

      // <a id="random_bogus_no_text_node_link" data-type="link" href="#random_bogus_text">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'random_bogus_no_text_node_link']
        var $ref = $doc("a[id='random_bogus_no_text_node_link']");

        $ref.attr("id").should.equal("random_bogus_no_text_node_link");
        $ref.text().should.equal('');
        // Test says this should be changed but not touching data-type=links
        // $ref.attr("href").should.equal("#random_bogus_text");
        $ref.attr("href").should.equal("random_bogus_text");

        done();

      });

    });
  });

  describe("Where id doesn't exist and no # sign (link; text node)", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href should resolve to # sign and existing href value", function(done) {

      // <a id="random_bogus_text_node_link" data-type="link" href="#random_bogus_text">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'random_bogus_text_node_link']
        var $ref = $doc("a[id='random_bogus_text_node_link']");

        $ref.attr("id").should.equal("random_bogus_text_node_link");
        $ref.text().should.equal('PLACEHOLDER TEXT');

        // Test says this should be changed but not touching data-type=links
        // $ref.attr("href").should.equal("#random_bogus_text");
        $ref.attr("href").should.equal("random_bogus_text");

        done();

      });

    });
  });

  describe("Where href is a bogus file/id pair (link; no text node)", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href should resolve to # sign and content that follows", function(done) {

      // <a id="fileref_bogus_no_text_node_link" data-type="link" href="#bogus">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'fileref_bogus_no_text_node_link']
        var $ref = $doc("a[id='fileref_bogus_no_text_node_link']");

        $ref.attr("id").should.equal("fileref_bogus_no_text_node_link");
        $ref.text().should.equal('');
        // Test says this should be changed but not touching data-type=links
        // $ref.attr("href").should.equal("#bogus");
        $ref.attr("href").should.equal("ch01.html#bogus");

        done();

      });

    });
  });

  describe("Where href is a bogus file/id pair (link; text node)", function() {

    var file = new File({
      contents: new Buffer(content),
      path: "./test.html"
    });

    var stream = htmlbook.process.xrefs(mapped);
    stream.write(file);
    stream.end();

    it("href should resolve to # sign and content that follows", function(done) {

      // <a id="fileref_bogus_text_node_link" data-type="link" href="#bogus">...</a>
      stream.once('data', function(file) {

        var $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

        //h:a[@id = 'fileref_bogus_text_node_link']
        var $ref = $doc("a[id='fileref_bogus_text_node_link']");

        $ref.attr("id").should.equal("fileref_bogus_text_node_link");
        $ref.text().should.equal('PLACEHOLDER TEXT');
        // Test says this should be changed but not touching data-type=links
        // $ref.attr("href").should.equal("#bogus");
        $ref.attr("href").should.equal("ch01.html#bogus");

        done();

      });

    });
  });

});

// Stream Tests

describe('htmlbook.generate.map()', function() {
  it('should map all hrefs from a file', function(done) {

    var chapterOneContents = '\
    <section id="chapter1" data-type="chapter">\
        <p>Here comes a cross-reference: see <a data-type="xref" href="#chapter2"/></p>\
    </section>\
    ';

    var chapterTwoContents = '\
    <section id="chapter2" data-type="chapter">\
        <h1><i>Chapter 1.</i> LOOMINGS.</h1>\
        <p>Here comes a cross-reference: see <a data-type="xref" href="#chapter1"/></p>\
    </section>\
    ';

    // create the fake files
    var chapterOne = new File({
      contents: new Buffer(chapterOneContents),
      path: "./chapterOne.html"
    });

    var chapterTwo = new File({
      contents: new Buffer(chapterTwoContents),
      path: "./chapterTwo.html"
    });

    // var idMap = htmlbook.mapper.parse(content, 'test.html');
    // var stream = htmlbook.xref.map(function(idMap){
    var stream = htmlbook.generate.map(function(idMap){

      idMap.should.be.ok;


      idMap["chapter1"].path.should.equal('chapterOne.html');
      idMap["chapter1"].name.should.equal('chapter');
      idMap["chapter1"].position.should.equal(1);
      idMap["chapter1"].title.should.equal('');

      idMap["chapter2"].path.should.equal('chapterTwo.html');
      idMap["chapter2"].name.should.equal('chapter');
      idMap["chapter2"].position.should.equal(2);
      idMap["chapter2"].title.should.equal('Chapter 1. LOOMINGS.');
      done();

    });

    stream.write(chapterOne);
    stream.write(chapterTwo);
    stream.end();

    stream.once('data', function(file) {
      // make sure it came out the same way it went in
      assert(file.isBuffer());
    });

  });

});

describe('htmlbook.process.xrefs()', function() {

  var idMap = { chapter1:
   { path: 'chapterA.html',
     name: 'chapter',
     position: 1,
     title: '' },
  chapter2:
   { path: 'chapterB.html',
     name: 'chapter',
     position: 2,
     title: 'LOOMINGS' } };


  it('should replace xref links and text', function(done) {

    var chapterOneContents = '\
    <section id="chapter1" data-type="chapter">\
        <p>Here comes a cross-reference: see <a data-type="xref" id="ref_a" href="#chapter2"/></p>\
    </section>\
    ';

    var chapterTwoContents = '\
    <section id="chapter2" data-type="chapter">\
        <h1>LOOMINGS</h1>\
        <p>Here comes a cross-reference: see <a data-type="xref" id="ref_b" href="#chapter1">HI</a></p>\
    </section>\
    ';

    // create the fake files
    var chapterOne = new File({
      contents: new Buffer(chapterOneContents),
      path: "./chapterA.html"
    });

    var chapterTwo = new File({
      contents: new Buffer(chapterTwoContents),
      path: "./chapterB.html"
    });

    // var idMap = htmlbook.mapper.parse(content, 'test.html');
    var stream = htmlbook.process.xrefs(idMap);

    stream.write(chapterOne);
    stream.write(chapterTwo);


    stream.once('data', function(file) {
      var $doc, $refA, $refB;

      // make sure it came out the same way it went in
      assert(file.isBuffer());

      // File should be cheerioified
      file.$.should.be.ok;

      $doc = cheerio.load(file.contents.toString(), { xmlMode: true, decodeEntities: false });

      // Stream A
      $refA = $doc("a[id='ref_a']");

      if($refA.length){
        $refA.attr("id").should.equal("ref_a");
        $refA.text().should.equal("LOOMINGS");
        $refA.attr("href").should.equal("chapterB.html#chapter2");
      }

      // Stream B
      $refB = $doc("a[id='ref_b']");

      if($refB.length){
        $refB.attr("id").should.equal("ref_b");
        $refB.text().should.equal("Chapter 1");
        $refB.attr("href").should.equal("chapterA.html#chapter1");
      }

      done();
    });

    stream.end();


  });

});
