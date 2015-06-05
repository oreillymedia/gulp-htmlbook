var htmlbook = require('../');
var should = require('should');
var assert = require("assert");

var File = require('vinyl');
var cheerio = require("cheerio");

require('mocha');

// From Common in Xspec

// Label markup tests
describe('When generating a label for a section (chapter)', function() {
  var content = '\
    <body>\
      <section data-type="chapter">\
        <h1>First one!</h1>\
        <p>Yup!</p>\
      </section>\
      <section data-type="chapter">\
        <h1>Second one!</h1>\
        <p>Yeah!</p>\
      </section>\
      <section data-type="appendix">\
        <h1>Appendix, yo!</h1>\
        <p>You betcha!</p>\
      </section>\
    </body>\
  ';

  var mapper = new htmlbook.tools.mapper();
  mapper.parse(content, 'test.html');

  it('The appropriate numeration value should be generated', function(done) {
      
      var $doc = cheerio.load(content, { xmlMode: false, decodeEntities: false });
      var $element = $doc("section[data-type='chapter']").get(1);
      var mapped = mapper.find($element, 'test.html');
      
      mapped.position.should.equal(2);

      done();

  });

});

describe('When generating a label for a part div', function() {
  var content = '\
    <body>\
      <div data-type="part">\
        <h1>Prefaces!</h1>\
        <section data-type="preface">\
          <h1>First one!</h1>\
          <p>Yup!</p>\
        </section>\
      </div>\
      <div data-type="part">\
        <h1>Chapters!</h1>\
        <section data-type="chapter">\
          <h1>Love this sample markup!</h1>\
          <p>Oh yeah!</p>\
        </section>\
      </div>\
      <div data-type="part">\
        <h1>Appendixes</h1>\
        <section data-type="appendix">\
          <h1>Why plural? There\'s only one here!</h1>\
          <p>D\'oh!</p>\
        </section>\
      </div>\
    </body>\
  ';

  var mapper = new htmlbook.tools.mapper();
  mapper.parse(content, 'test.html');

  it('The appropriate numeration value should be generated', function(done) {
      
      var $doc = cheerio.load(content, { xmlMode: false, decodeEntities: false });
      var $element = $doc("div[data-type='part']").get(2);

      var mapped = mapper.find($element, 'test.html');
      var position = htmlbook.tools.helpers.romanize(mapped.position);
      
      // Position should be 3
      mapped.position.should.equal(3);
      // Which should romanize to III
      position.should.equal("III");
      
      done();

  });

});

describe('When generating a label for a section (chapter) in a part', function() {
  var content = '\
    <body>\
      <div data-type="part">\
        <h1>First set o chapters!</h1>\
        <section data-type="chapter">\
          <h1>First one!</h1>\
          <p>Yup!</p>\
        </section>\
        <section data-type="chapter">\
          <h1>Second one!</h1>\
          <p>Oh yeah!</p>\
        </section>\
      </div>\
      <div data-type="part">\
        <h1>Second set o chapters</h1>\
        <section data-type="chapter">\
          <h1>Third one!</h1>\
          <p>Hooray!</p>\
        </section>\
      </div>\
    </body>\
  ';

  var mapper = new htmlbook.tools.mapper();
  mapper.parse(content, 'test.html');

  it('The appropriate numeration value should be generated (absolute, not relative to part)', function(done) {
      
      var $doc = cheerio.load(content, { xmlMode: false, decodeEntities: false });
      var $element = $doc("div[data-type='part']:nth-child(2)").find("section[data-type='chapter']");
      var mapped = mapper.find($element, 'test.html');
      
      mapped.position.should.equal(3);

      done();

  });

});

describe('When generating a label for a figure in a chapter-level division', function() {
  var content = '\
    <section data-type="chapter">\
      <h1>This is a chapter heading</h1>\
      <p>Running out of amusing things to say</p>\
      <figure>\
        <img src="tokyo.png"/>\
        <figcaption>A picture of the Tokyo skyline</figcaption>\
      </figure>\
      <figure>\
        <img src="paris.png"/>\
        <figcaption>A picture of the Paris skyline</figcaption>\
      </figure>\
    </section>\
    <section data-type="chapter">\
      <h1>This is a first chapter heading</h1>\
      <p>Running out of amusing things to say</p>\
      <figure>\
        <img src="newyork.png"/>\
        <figcaption>A picture of the New York skyline</figcaption>\
      </figure>\
    </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  mapper.parse(content, 'test.html');

  it('The appropriate numeration value should be generated', function(done) {
      
      var $doc = cheerio.load(content, { xmlMode: false, decodeEntities: false });
      var $element = $doc("section").eq(0).find("figure").eq(1);
      var mapped = mapper.find($element, 'test.html');
      var formal = mapper.get(mapped.parent).position + "-" + mapped.index;

      mapped.position.should.equal(2);
      mapped.index.should.equal(2);
      formal.should.equal("1-2");

      done();

  });

});

describe('When generating a label for a figure in a Part', function() {
  var content = '\
    <div data-type="part">\
      <h1>This is a Part heading</h1>\
      <p>More text here</p>\
      <figure>\
        <img src="barcelona.png"/>\
        <figcaption>A picture of the Barcelona skyline</figcaption>\
      </figure>\
      <figure>\
        <img src="quito.png"/>\
        <figcaption>A picture of the Quito skyline</figcaption>\
      </figure>\
    </div>\
  ';

  var mapper = new htmlbook.tools.mapper();
  mapper.parse(content, 'test.html');

  it('The appropriate numeration value should be generated', function(done) {
      
      var $doc = cheerio.load(content, { xmlMode: false, decodeEntities: false });
      var $element = $doc("div[data-type='part']").find("figure").eq(1);
      var mapped = mapper.find($element, 'test.html');
      var position = mapper.get(mapped.parent).position;
      var formal = htmlbook.tools.helpers.romanize(position) + "-" + mapped.index;

      mapped.position.should.equal(2);
      mapped.index.should.equal(2);
      formal.should.equal("I-2");

      done();

  });

});

describe('When generating a label for a figure in a Part (preceding figs)', function() {
  var content = '\
    <section data-type="preface">\
      <h1>Preface Heading</h1>\
      <p>Here is a figure that precedes the part:</p>\
      <figure>\
        <img src="oslo.png"/>\
        <figcaption>A picture of the Oslo skyline</figcaption>\
      </figure>\
    </section>\
    <div data-type="part">\
      <h1>This is a Part heading</h1>\
      <p>More text here</p>\
      <figure>\
        <img src="barcelona.png"/>\
        <figcaption>A picture of the Barcelona skyline</figcaption>\
      </figure>\
      <figure>\
        <img src="quito.png"/>\
        <figcaption>A picture of the Quito skyline</figcaption>\
      </figure>\
    </div>\
  ';

  var mapper = new htmlbook.tools.mapper();
  mapper.parse(content, 'test.html');

  it('The appropriate numeration value should be generated', function(done) {
      
      var $doc = cheerio.load(content, { xmlMode: false, decodeEntities: false });
      var $element = $doc("div[data-type='part']").find("figure").eq(1);
      var mapped = mapper.find($element, 'test.html');
      var position = mapper.get(mapped.parent).position;
      var formal = htmlbook.tools.helpers.romanize(position) + "-" + mapped.index;

      mapped.position.should.equal(3);
      mapped.index.should.equal(2);
      formal.should.equal("I-2");

      done();

  });

});

describe('When generating a label for a figure in a Part (preceding figs)', function() {
  var content = '\
    <section data-type="chapter">\
      <h1>This is a chapter heading</h1>\
      <p>Running out of amusing things to say</p>\
      <table>\
        <caption>Some programming languages</caption>\
        <tbody>\
          <tr>\
            <td>Python</td>\
            <td>Java</td>\
                </tr>\
                <tr>\
            <td>Ruby</td>\
            <td>Perl</td>\
                </tr>\
              </tbody>\
            </table>\
            <table>\
              <caption>Our favorite colors</caption>\
              <thead>\
                <tr>\
            <th>Name</th>\
            <th>Color</th>\
                </tr>\
              </thead>\
              <tbody>\
                <tr>\
            <td>Tom</td>\
            <td>vermilion</td>\
                </tr>\
                <tr>\
            <td>Richard</td>\
            <td>fuchsia</td>\
                </tr>\
                <tr>\
            <td>Harry</td>\
            <td>cerulean</td>\
          </tr>\
        </tbody>\
      </table>\
    </section>\
  ';

  var mapper = new htmlbook.tools.mapper();
  mapper.parse(content, 'test.html');

  it('The appropriate numeration value should be generated', function(done) {
      
      var $doc = cheerio.load(content, { xmlMode: false, decodeEntities: false });
      var $element = $doc("section").first().find("table").eq(1);
      var mapped = mapper.find($element, 'test.html');
      var position = mapper.get(mapped.parent).position;
      var formal = position + "-" + mapped.index;

      mapped.position.should.equal(2);
      mapped.index.should.equal(2);
      formal.should.equal("1-2");

      done();

  });

});

describe('When generating a label for a table in a Part', function() {
  var content = '\
    <div data-type="part">\
      <h1>This is a Part heading</h1>\
      <p>More text here</p>\
      <table>\
        <caption>Some programming languages</caption>\
        <tbody>\
          <tr>\
      <td>Python</td>\
      <td>Java</td>\
          </tr>\
          <tr>\
      <td>Ruby</td>\
      <td>Perl</td>\
          </tr>\
        </tbody>\
      </table>\
      <table>\
        <caption>Our favorite colors</caption>\
        <thead>\
          <tr>\
      <th>Name</th>\
      <th>Color</th>\
          </tr>\
        </thead>\
        <tbody>\
          <tr>\
      <td>Tom</td>\
      <td>vermilion</td>\
          </tr>\
          <tr>\
      <td>Richard</td>\
      <td>fuchsia</td>\
          </tr>\
          <tr>\
      <td>Harry</td>\
      <td>cerulean</td>\
          </tr>\
        </tbody>\
      </table>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('The appropriate numeration value should be generated', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      var $element = $doc("div[data-type='part']").first().find("table").eq(1).find("caption");
      var $span = $element.find("span");
      
      $span.length.should.be.ok;

      $span.text().should.equal("Table I-2. ");

      done();
    
    });

  });

});

describe('When generating a label for a table in a Part (preceding tables)', function() {
  var content = '\
    <section data-type="preface">\
      <h1>Preface Heading</h1>\
      <p>Here is a table that precedes the part:</p>\
      <table>\
        <caption>Some beverages</caption>\
        <tbody>\
          <tr>\
      <td>tea</td>\
      <td>coffee</td>\
          </tr>\
          <tr>\
      <td>lemonade</td>\
      <td>beer</td>\
          </tr>\
        </tbody>\
      </table>\
    </section>\
    <div data-type="part">\
      <h1>This is a Part heading</h1>\
      <p>More text here</p>\
      <table>\
        <caption>Some programming languages</caption>\
        <tbody>\
          <tr>\
      <td>Python</td>\
      <td>Java</td>\
          </tr>\
          <tr>\
      <td>Ruby</td>\
      <td>Perl</td>\
          </tr>\
        </tbody>\
      <table>\
        <caption>Our favorite colors</caption>\
        <thead>\
          <tr>\
      <th>Name</th>\
      <th>Color</th>\
          </tr>\
        </thead>\
        <tbody>\
          <tr>\
      <td>Tom</td>\
      <td>vermilion</td>\
          </tr>\
          <tr>\
      <td>Richard</td>\
      <td>fuchsia</td>\
          </tr>\
          <tr>\
      <td>Harry</td>\
      <td>cerulean</td>\
          </tr>\
        </tbody>\
      </table>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('The appropriate numeration value should be generated', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      var $element = $doc("div[data-type='part']").first().find("table").eq(1).find("caption");
      var $span = $element.find("span");
      
      $span.length.should.be.ok;

      $span.text().should.equal("Table I-2. ");

      done();
    
    });

  });

});

describe('When generating a label for an example in a Part', function() {
  var content = '\
    <div data-type="part">\
      <h1>This is a Part heading</h1>\
      <p>More text here</p>\
      <div data-type="example">\
        <h6>My first code listing</h6>\
        <pre data-type="programlisting" data-code-language="ruby">puts "Hello World!"</pre>\
      </div>\
      <div data-type="example">\
        <h6>My second code listing</h6>\
        <pre data-type="programlisting" data-code-language="ruby">10000.times { puts "Hello World" }</pre>\
      </div>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('The appropriate numeration value should be generated', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      var $element = $doc("div[data-type='part']").first().find("div[data-type='example']").eq(1).find("h6");
      var $span = $element.find("span");
      
      $span.length.should.be.ok;

      $span.text().should.equal("Example I-2. ");

      done();
    
    });

  });

});

describe('When generating a label for an example in a Part (preceding examples)', function() {
  var content = '\
    <section data-type="preface">\
      <h1>Preface Heading</h1>\
      <p>Here is an example that precedes the part:</p>\
      <div data-type="example">\
        <h6>Python listing</h6>\
        <pre data-type="programlisting" data-code-language="python">print "My first python listing"</pre>\
      </div>\
    </section>\
    <div data-type="part">\
      <h1>This is a Part heading</h1>\
      <p>More text here</p>\
      <div data-type="example">\
        <h6>My first code listing</h6>\
        <pre data-type="programlisting" data-code-language="ruby">puts "Hello World!"</pre>\
      </div>\
      <div data-type="example">\
        <h6>My second code listing</h6>\
        <pre data-type="programlisting" data-code-language="ruby">10000.times { puts "Hello World" }</pre>\
      </div>\
    </div>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('The appropriate numeration value should be generated', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      var $element = $doc("div[data-type='part']").first().find("div[data-type='example']").eq(1).find("h6");
      var $span = $element.find("span");
      
      $span.length.should.be.ok;

      $span.text().should.equal("Example I-2. ");

      done();
    
    });

  });

});

// Test Skipped for now, don't understand this behavior
/*
describe('When generating a label for a table', function() {
  var content = '\
    <section data-type="chapter">\
    <h1>This is a chapter heading</h1>\
    <p>Running out of amusing things to say</p>\
    <table>\
      <!-- No caption -->\
      <tbody>\
        <tr>\
    <td>Python</td>\
    <td>Java</td>\
        </tr>\
        <tr>\
    <td>Ruby</td>\
    <td>Perl</td>\
        </tr>\
      </tbody>\
    </table>\
    <table>\
      <!-- Empty caption -->\
      <caption/>\
      <tbody>\
        <tr>\
    <td>pencil</td>\
        </tr>\
        <tr>\
    <td>paper</td>\
        </tr>\
      </tbody>\
    </table>\
    <table>\
      <caption>Our favorite colors</caption>\
      <thead>\
        <tr>\
    <th>Name</th>\
    <th>Color</th>\
        </tr>\
      </thead>\
      <tbody>\
        <tr>\
    <td>Tom</td>\
    <td>vermilion</td>\
        </tr>\
        <tr>\
    <td>Richard</td>\
    <td>fuchsia</td>\
        </tr>\
        <tr>\
    <td>Harry</td>\
    <td>cerulean</td>\
        </tr>\
      </tbody>\
    </table>\
  </section>\
  ';

  var file = new File({
    contents: new Buffer(content),
    path: "./test.html"
  });

  var stream = htmlbook.process.labels();
  stream.write(file);
  stream.end();

  it('Ignore \'informal\' (uncaptioned or empty-captioned) tables in the count', function(done) {
    var id;

    stream.once('data', function(file) {
      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      var $element = $doc("section").first().find("table").eq(2).find("caption");
      var $span = $element.find("span");
      
      $span.length.should.be.ok;

      $span.text().should.equal("Table 1-1. ");

      done();
    
    });

  });

});
*/