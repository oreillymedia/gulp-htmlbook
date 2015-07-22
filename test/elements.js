var htmlbook = require('../');
var should = require('should');
var assert = require("assert");

var File = require('vinyl');
var cheerio = require("cheerio");

require('mocha');

// From Elements in Xspec

describe('When encountering a section without an id', function() {
  var content = '\
    <section/>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.ids();
  stream.write(file);
  stream.end();

  it('Add an id', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      $doc("section").length.should.equal(1);

      id = $doc("section").first().attr("id");

      id.should.be.ok;

      id.should.equal("id-yBpfL");

      done();

    });

  });

});

describe('When encountering a section with an id', function() {
  var content = '\
    <section id="cookies"/>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.ids();
  stream.write(file);
  stream.end();

  it('Preserve the id', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      id = $doc("section[id='cookies']").attr("id");

      id.should.be.ok;

      id.should.equal("cookies");

      done();

    });

  });


});

describe('When encountering a Part div without an id', function() {
  var content = '\
     <div data-type="part"/>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.ids();
  stream.write(file);
  stream.end();

  it('Add an id', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      id = $doc("div[data-type='part']").attr("id");

      id.should.be.ok;

      id.should.equal("id-yxvfX");

      done();

    });

  });

});


describe('When encountering a Part div with an id', function() {
  var content = '\
    <div data-type="part" id="pizza"/>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.ids();
  stream.write(file);
  stream.end();

  it('Preserve the id', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      id = $doc("div[id='pizza']").attr("id");

      id.should.be.ok;

      id.should.equal("pizza");

      done();

    });

  });

});

describe('When encountering an aside without an id', function() {
  var content = '\
     <aside/>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.ids();
  stream.write(file);
  stream.end();

  it('Add an id', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      id = $doc("aside").attr("id");
      id.should.be.ok;

      id.should.equal("id-gd2fN");

      done();

    });

  });

});


describe('When encountering an aside with an id', function() {
  var content = '\
    <aside id="watermelon"/>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.ids();
  stream.write(file);
  stream.end();

  it('Preserve the id', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      id = $doc("aside[id='watermelon']").attr("id");

      id.should.be.ok;

      id.should.equal("watermelon");

      done();

    });

  });

});

describe('When encountering an indexterm without an id', function() {
  var content = '\
     <a data-type="indexterm" data-primary="rubygems"/>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.ids();
  stream.write(file);
  stream.end();

  it('Add an id', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      id = $doc("a[data-type='indexterm']").attr("id");

      id.should.be.ok;

      id.should.equal("id-gXwfO");

      done();

    });

  });

});


describe('When encountering an indexterm with an id', function() {
  var content = '\
    <a data-type="indexterm" data-primary="rubygems" id="avocado"/>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.ids();
  stream.write(file);
  stream.end();

  it('Preserve the id', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      id = $doc("a[data-type='indexterm']").attr("id");

      id.should.be.ok;

      id.should.equal("avocado");

      done();

    });

  });

});

describe('When encountering an indexterm that contains only whitespace', function() {
  var content = '\
    <a data-type="indexterm" data-primary="xslt" data-secondary="xml and">   </a>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.indexterms();
  stream.write(file);
  stream.end();

  it('Strip the whitespace', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      // <a data-type="indexterm" data-primary="xslt" data-secondary="xml and" id="..."/>
      $link = $doc("a[data-type='indexterm']");

      $link.text().should.equal('');

      done();

    });

  });

});

describe('When encountering an indexterm that contains only whitespace (including nbsp)', function() {
  var content = '\
    <a data-type="indexterm" data-primary="xslt" data-secondary="xml and">&#xa0; &#xa0;</a>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.indexterms();
  stream.write(file);
  stream.end();

  it('Strip the whitespace', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      // <a data-type="indexterm" data-primary="xslt" data-secondary="xml and" id="..."/>
      $link = $doc("a[data-type='indexterm']");

      $link.text().should.equal('');

      done();

    });

  });

});

describe('When encountering an indexterm that contains child nodes only', function() {
  var content = '\
    <a data-type="indexterm" data-primary="xslt" data-secondary="xml and"><em>Unicode</em></a>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.indexterms();
  stream.write(file);
  stream.end();

  it('Preserve content as is', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      // <a data-type="indexterm" data-primary="xslt" data-secondary="xml and" id="..."><em>Unicode</em></a>
      $link = $doc("a[data-type='indexterm']");

      $link.children().length.should.equal(1);

      done();

    });

  });

});

describe('When encountering an indexterm that contains child nodes only (2)', function() {
  var content = '\
    <a data-type="indexterm" data-primary="xslt" data-secondary="xml and"><br></a>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.indexterms();
  stream.write(file);
  stream.end();

  it('Preserve content as is', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      // <a data-type="indexterm" data-primary="xslt" data-secondary="xml and" id="..."><br/></a>
      $link = $doc("a[data-type='indexterm']");

      $link[0].children.length.should.equal(1);
      $link.children().length.should.equal(1);
      $link.html().should.equal("<br>"); // HTML ouput

      done();

    });

  });

});

describe('When encountering an indexterm that contains child nodes and text', function() {
  var content = '\
   <a data-type="indexterm" data-primary="xslt" data-secondary="xml and"><em>123</em>456</a>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.indexterms();
  stream.write(file);
  stream.end();

  it('Preserve content as is', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      // <a data-type="indexterm" data-primary="xslt" data-secondary="xml and" id="..."><em>123</em>456</a>
      $link = $doc("a[data-type='indexterm']");
      $link.html().should.equal("<em>123</em>456");

      done();

    });

  });

});

describe('When encountering an indexterm that contains child nodes, text, and whitespace', function() {
  var content = '\
    <a data-type="indexterm" data-primary="xslt" data-secondary="xml and"><em>Unicode</em>&#xa0; &#xa0;is fun</a>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.indexterms();
  stream.write(file);
  stream.end();

  it('Preserve content as is', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });

      //  <a data-type="indexterm" data-primary="xslt" data-secondary="xml and" id="..."><em>Unicode</em>&#xa0; &#xa0;is fun</a>
      $link = $doc("a[data-type='indexterm']");
      $link.html().should.equal("<em>Unicode</em>&#xa0; &#xa0;is fun");

      done();

    });

  });

});

// HEADING PROCESSING TESTS

describe('When encountering a heading element (h1-h5) in a Part (header block)', function() {
  var content = '\
    <div data-type="part">\
      <header>\
        <h1>This is the heading</h1>\
        <p data-type="subtitle">Subtitle should always be left untouched</p>\
      </header>\
      <p>Text Text Text!</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h1><span class="label">Part I. </span>This is the heading</h1>
      $heading = $doc("h1");
      $heading.html().should.equal('<span class="label">Part I. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a Part (header block)', function() {
  var content = '\
    <div data-type="part">\
      <header>\
        <h1>This is the heading</h1>\
        <p data-type="subtitle">Subtitle should always be left untouched</p>\
      </header>\
      <p>Text Text Text!</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h1><span class="label">Part I. </span>This is the heading</h1>
      $heading = $doc("h1");
      $heading.html().should.equal('<span class="label">Part I. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a top level-section (loose h1)', function() {
  var content = '\
    <section data-type="chapter">\
      <h1>This is the heading</h1>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h1><span class="label">Chapter 1. </span>This is the heading</h1>
      $heading = $doc("h1");
      $heading.html().should.equal('<span class="label">Chapter 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a top level-section (header block)', function() {
  var content = '\
    <section data-type="chapter">\
        <header>\
          <h1>This is the heading</h1>\
          <p data-type="subtitle">Subtitle should always be left untouched</p>\
        </header>\
        <p>Text Text Text!</p>\
      </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h1><span class="label">Chapter 1. </span>This is the heading</h1>
      $heading = $doc("h1");
      $heading.html().should.equal('<span class="label">Chapter 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a sect2 (loose h2)', function() {
  var content = '\
    <section data-type="sect2">\
      <h2>This is the heading</h2>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h2><span class="label">Section 1. </span>This is the heading</h2>
      $heading = $doc("h2");
      $heading.html().should.equal('<span class="label">Section 1. </span>This is the heading');

      done();

    });

  });

});


describe('When encountering a heading element (h1-h5) in a sect2 (header block)', function() {
  var content = '\
    <section data-type="sect2">\
      <header>\
        <h2>This is the heading</h2>\
        <p data-type="subtitle">Subtitle should always be left untouched</p>\
      </header>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h2><span class="label">Section 1. </span>This is the heading</h2>
      $heading = $doc("h2");
      $heading.html().should.equal('<span class="label">Section 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a sect2 (header block)', function() {
  var content = '\
    <section data-type="sect2">\
      <header>\
        <h2>This is the heading</h2>\
        <p data-type="subtitle">Subtitle should always be left untouched</p>\
      </header>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();


  it('Subtitle should be preserved as is', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h2><span class="label">Section 1. </span>This is the heading</h2>
      $heading = $doc("p[data-type='subtitle']");
      $heading.html().should.equal('Subtitle should always be left untouched');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a sect3 (loose h3)', function() {
  var content = '\
    <section data-type="sect3">\
      <h3>This is the heading</h3>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h3><span class="label">Section 1. </span>This is the heading</h3>
      $heading = $doc("h3");
      $heading.html().should.equal('<span class="label">Section 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a sect3 (header block)', function() {
  var content = '\
    <section data-type="sect3">\
      <header>\
        <h3>This is the heading</h3>\
        <p data-type="subtitle">Subtitle should always be left untouched</p>\
      </header>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h3><span class="label">Section 1. </span>This is the heading</h3>
      $heading = $doc("h3");
      $heading.html().should.equal('<span class="label">Section 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a sect4 (loose h4)', function() {
  var content = '\
    <section data-type="sect4">\
      <h4>This is the heading</h4>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h4><span class="label">Section 1. </span>This is the heading</h4>
      $heading = $doc("h4");
      $heading.html().should.equal('<span class="label">Section 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a sect4 (header block)', function() {
  var content = '\
    <section data-type="sect4">\
      <header>\
        <h4>This is the heading</h4>\
        <p data-type="subtitle">Subtitle should always be left untouched</p>\
      </header>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h4><span class="label">Section 1. </span>This is the heading</h4>
      $heading = $doc("h4");
      $heading.html().should.equal('<span class="label">Section 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a sect5 (loose h5)', function() {
  var content = '\
    <section data-type="sect5">\
      <h5>This is the heading</h5>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Section 1. </span>This is the heading</h5>
      $heading = $doc("h5");
      $heading.html().should.equal('<span class="label">Section 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a sect5 (header block)', function() {
  var content = '\
    <section data-type="sect5">\
      <header>\
        <h5>This is the heading</h5>\
        <p data-type="subtitle">Subtitle should always be left untouched</p>\
      </header>\
      <p>Text Text Text!</p>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Section 1. </span>This is the heading</h5>
      $heading = $doc("h5");
      $heading.html().should.equal('<span class="label">Section 1. </span>This is the heading');

      done();

    });

  });

});

describe('When encountering a heading element (h1-h5) in a div', function() {
  var content = '\
    <section data-type="chapter">\
      <h1>Chapter heading</h1>\
      <div data-type="example">\
        <h5>This is the example heading</h5>\
        <pre data-type="programlisting">print "I\'m an awesome Python coder"</pre>\
      </div>\
    </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Proper label should be prepended', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Example 1-1. </span>This is the example heading</h5>
      $heading = $doc("h5");
      $heading.html().should.equal('<span class="label">Example 1-1. </span>This is the example heading');

      done();

    });

  });

});

// When matching an titleless admonition (note)
describe('When matching an titleless admonition (note)', function() {
  var content = '\
    <div data-type="note">\
        <p>This is a note.</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.admonitions();
  stream.write(file);
  stream.end();

  it('An admonition heading should be added', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Example 1-1. </span>This is the example heading</h5>
      $element = $doc("div[data-type='note']");
      $element.children("h6").length.should.equal(1);
      $element.children("h6").text().should.equal("Note");

      done();

    });

  });

});

describe('When matching an titleless admonition (tip)', function() {
  var content = '\
    <div data-type="tip">\
        <p>This is a tip.</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.admonitions();
  stream.write(file);
  stream.end();

  it('An admonition heading should be added', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Example 1-1. </span>This is the example heading</h5>
      $element = $doc("div[data-type='tip']");
      $element.children("h6").length.should.equal(1);
      $element.children("h6").text().should.equal("Tip");

      done();

    });

  });

});

describe('When matching an titleless admonition (warning)', function() {
  var content = '\
    <div data-type="warning">\
      <p>This is a warning.</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.admonitions();
  stream.write(file);
  stream.end();

  it('An admonition heading should be added', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Example 1-1. </span>This is the example heading</h5>
      $element = $doc("div[data-type='warning']");
      $element.children("h6").length.should.equal(1);
      $element.children("h6").text().should.equal("Warning");

      done();

    });

  });

});

describe('When matching an titleless admonition (caution)', function() {
  var content = '\
    <div data-type="caution">\
      <p>This is a caution.</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.admonitions();
  stream.write(file);
  stream.end();

  it('An admonition heading should be added', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Example 1-1. </span>This is the example heading</h5>
      $element = $doc("div[data-type='caution']");
      $element.children("h6").length.should.equal(1);
      $element.children("h6").text().should.equal("Caution");

      done();

    });

  });

});

describe('When matching an titleless admonition (important)', function() {
  var content = '\
    <div data-type="important">\
      <p>This is a important.</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.admonitions();
  stream.write(file);
  stream.end();

  it('An admonition heading should be added', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Example 1-1. </span>This is the example heading</h5>
      $element = $doc("div[data-type='important']");
      $element.children("h6").length.should.equal(1);
      $element.children("h6").text().should.equal("Important");

      done();

    });

  });

});

describe('When matching an titled admonition (note)', function() {
  var content = '\
    <div data-type="note">\
      <h6>Note Heading</h6>\
      <p>This is a note.</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.admonitions();
  stream.write(file);
  stream.end();

  it('An admonition heading should be added', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      //  <h5><span class="label">Example 1-1. </span>This is the example heading</h5>
      $element = $doc("div[data-type='note']");
      $element.children("h6").length.should.equal(1);
      $element.children("h6").text().should.equal("Note Heading");

      done();

    });

  });

});

// html4.structural.elements skipped for now

// Comment-toggle tests
describe('When matching a block element with data-type=\'comment\'', function() {
  var content = '\
    <div data-type="comment">\
      <p>This is a comment. Or, actually, a meta-comment</p>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.comments();
  stream.write(file);
  stream.end();

  // With show-comments disabled
  it('Comment should be dropped from output', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      $doc.root().children().length.should.equal(0);

      done();

    });

  });

});

describe('When matching a inline element with data-type=\'comment\'', function() {
  var content = '\
    <p>This book was written in HTMLBook <span data-type="comment">Hooray!!!</span></p>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.comments();
  stream.write(file);
  stream.end();

  // With show-comments disabled
  it('Comment should be dropped from output', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      $doc("p").html().should.equal("This book was written in HTMLBook ");

      done();

    });

  });

});

// Skipping XML editorial comments


