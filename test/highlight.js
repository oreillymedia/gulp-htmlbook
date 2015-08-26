// <pre data-type="programlisting" data-code-language="shell">$ apm help install</pre>
var htmlbook = require('../');
var should = require('should');
var cheerio = require("cheerio");
var assert = require("assert");

var File = require('vinyl');

require('mocha');

describe('htmlbook.process.highlight()', function() {
  this.timeout(150000);
  it('should highlight all programlisting from a file', function(done) {

    var contents = '\
		<pre data-type="programlisting" data-code-language="coffeescript">MyPackageView = require "./my-package-view"\
			module.exports =\
			  myPackageView: null\
			  activate: (state) -&gt;\
			    @myPackageView = new MyPackageView(state.myPackageViewState)\
			  deactivate: -&gt;\
			    @myPackageView.destroy()\
			  serialize: -&gt;\
			    myPackageViewState: @myPackageView.serialize()\
		</pre>\
    ';

    // create the fake files
    var chapterOne = new File({
      contents: new Buffer(contents),
      path: "./chapterOne.html"
    });

    var stream = htmlbook.process.highlight();

    stream.on('data', function(file) {
      // make sure it came out the same way it went in
      assert(file.isBuffer());

      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      $heading = $doc("pre[data-type=programlisting]");
      $heading.html().should.equal('<code class="nv">MyPackageView = </code><code class="nx">require</code> <code class="s">&quot;./my-package-view&quot;</code>\t\t\t<code class="nv">module.exports =\t</code>\t\t  <code class="nv">myPackageView: </code><code class="kc">null</code>\t\t\t  <code class="nv">activate: </code><code class="nf">(state) -&gt;</code>\t\t\t    <code class="vi">@myPackageView = </code><code class="k">new</code> <code class="nx">MyPackageView</code><code class="p">(</code><code class="nx">state</code><code class="p">.</code><code class="nx">myPackageViewState</code><code class="p">)</code>\t\t\t  <code class="nv">deactivate: </code><code class="nf">-&gt;</code>\t\t\t    <code class="nx">@myPackageView</code><code class="p">.</code><code class="nx">destroy</code><code class="p">()</code>\t\t\t  <code class="nv">serialize: </code><code class="nf">-&gt;</code>\t\t\t    <code class="nv">myPackageViewState: </code><code class="nx">@myPackageView</code><code class="p">.</code><code class="nx">serialize</code><code class="p">()</code>\t\t\n');

      done();
    });

    stream.write(chapterOne);
    stream.end();

  });

  it('should encode unencoded elements', function(done) {

    var contents = '\
		<pre data-type="programlisting" data-code-language="html">\
      <html>\
        <head>\
        <title></title>\
        </head>\
        <body>\
        \
        </body>\
      </html>\
		</pre>\
    ';

    // create the fake files
    var chapterOne = new File({
      contents: new Buffer(contents),
      path: "./chapterOne.html"
    });

    var stream = htmlbook.process.highlight();

    stream.on('data', function(file) {
      // make sure it came out the same way it went in
      assert(file.isBuffer());

      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      $heading = $doc("pre[data-type=programlisting]");
      $heading.html().should.equal('      <code class="nt">&lt;html&gt;</code>        <code class="nt">&lt;head&gt;</code>        <code class="nt">&lt;title/&gt;</code>        <code class="nt">&lt;/head&gt;</code>        <code class="nt">&lt;body&gt;</code>                <code class="nt">&lt;/body&gt;</code>      <code class="nt">&lt;/html&gt;</code>\t\t\n');

      done();
    });

    stream.write(chapterOne);
    stream.end();

  });

  it('should handle already encoded elements', function(done) {
    var contents = '\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    ';

    // create the fake files
    var chapterOne = new File({
      contents: new Buffer(contents),
      path: "./chapterOne.html"
    });

    var stream = htmlbook.process.highlight();

    stream.on('data', function(file) {
      // make sure it came out the same way it went in
      assert(file.isBuffer());

      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      $heading = $doc("pre[data-type=programlisting]");
      $heading.html().should.equal('      <code class="cp">&lt;! &gt;</code>!    \n');

      done();
    });

    stream.write(chapterOne);
    stream.end();

  });

  it('should handle &lt;', function(done) {
    var contents = '<pre data-type="programlisting" data-code-language="haskell">&lt;-</pre><p>This report</p>';

    // create the fake files
    var chapterOne = new File({
      contents: new Buffer(contents),
      path: "./chapterOne.html"
    });

    var stream = htmlbook.process.highlight();

    stream.on('data', function(file) {
      // make sure it came out the same way it went in
      assert(file.isBuffer());

      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      $heading = $doc("pre[data-type=programlisting]");
      $heading.html().should.equal('<code class="ow">&lt;-</code>\n');

      done();
    });

    stream.write(chapterOne);
    stream.end();

  });

  it('should handle many many elements', function(done) {

    var contents = '\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    <pre data-type="programlisting" data-code-language="html">\
      &lt;! &gt;!\
    </pre>\
    ';

    // create the fake files
    var chapterOne = new File({
      contents: new Buffer(contents),
      path: "./chapterOne.html"
    });

    var stream = htmlbook.process.highlight();

    stream.on('data', function(file) {
      // make sure it came out the same way it went in
      assert(file.isBuffer());

      var $doc = cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
      $heading = $doc("pre[data-type=programlisting]");
      $heading.html().should.equal('      <code class="cp">&lt;! &gt;</code>!    \n');

      done();
    });

    stream.write(chapterOne);
    stream.end();

  });

});