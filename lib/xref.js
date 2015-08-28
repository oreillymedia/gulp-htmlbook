// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var Promise = require("bluebird");
var _ = require("lodash");
var util = require("util");
var cheerio = require('cheerio');
var Mapper = require("./mapper.js");
// var formating = require('../localizations/en.json');
var settings;

var fs = require("fs");
var localizations = fs.readFileSync(__dirname + "/../localizations/en.json", "utf-8");
var formating =  JSON.parse(localizations);

var CrossRef = {};
/*
<xsl:param name="xref.type.for.section.by.data-type">
appendix:xref-number
chapter:xref-number
part:xref-number
sect1:xref
sect2:xref
sect3:xref
sect4:xref
sect5:xref
</xsl:param>
*/
var xref_template = {
  appendix : "xref-number",
  chapter  : "xref-number",
  part     : "xref-number",
  sect1    : "xref",
  sect2    : "xref",
  sect3    : "xref",
  sect4    : "xref",
  sect5    : "xref"
};


CrossRef.replace = function(contents, idMap, currentFilePath) {
  var $ = (typeof(contents) === 'string') ? cheerio.load(contents, { xmlMode: true, decodeEntities: false }) : contents;
  // var $a = $("a[data-type='xref'], a:not([data-type])"); // This returned far to many results
  var $a = $("a[data-type='xref']");
  var replaced = false;

  $a.each(function(index, link){
      var $link = $(link);
      var href = $link.attr("href") || '';
      var fragment;
      var ref;
      var text = $link.text();
      var template;
      var hashPosition = href.indexOf("#");
      var absolute = href.indexOf("://") > -1 ? true : false;
      var mailto = href.indexOf("mailto:") > -1 ? true : false;

      // For now, we're arguing that if the @href value is not a legit XREF, that should override the fact that data-type="xref" is on the <a>
      if(!href || absolute || mailto) {
        return;
      }

      // Test dictate that if there is not a data-type=xref, only empty links should be replaced
      if(text && !$link.attr("data-type")){
        return;
      }

      if(hashPosition > -1) {
        fragment = href.substring(hashPosition + 1)
      } else if ($link.attr("data-type")) {
        fragment = href;
      } else {
        return;
      }

      if(fragment in idMap) {
        var ref = idMap[fragment];
        var parent;

        if(ref.path && ref.path != currentFilePath) {
          $link.attr("href",  ref.path + "#" + fragment);
        }

        if(ref.title) {
          text = ref.title;
        } else {
          template = formating["xref-number"][ref.name];
          if(ref.parent){
            parent = idMap[ref.parent];
            text = util.format(template, parent.position + "-" + ref.index);
          } else {
            text = util.format(template, ref.position);
          }
        }


        $link.text(text);

        if(!replaced) replaced = true;


      } else {

        settings.log("warn", "Unable to locate target for XREF with @href value:", href);
        $link.text("???");

        if(hashPosition == -1 && !(absolute && mailto)) {
          $link.attr("href", "#" + fragment);
        }

        if(!replaced) replaced = true;
      }
  });

  // if(replaced) {
  //   return $;
  // } else {
  //   return false;
  // }

  // Always return document, for test conformance
  return $;

};

function gulpCrossRef(idMap, options) {

  settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true,
    log: gutil.log
  });

  var stream = through.obj(function(file, enc, next) {
    var $doc = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var currentFilePath = file.relative;
    var $replaced = CrossRef.replace($doc, idMap, currentFilePath);


    if($replaced && settings.output) {
      file.contents = new Buffer($doc.html(settings.outputMode), "utf-8");
    }

    file.$ = $doc;

    this.push(file);
    next();

  });

  return stream;
}

module.exports = gulpCrossRef;

// module.exports = {
//   map: CrossRef.map,
//   replace: CrossRef.replace,
//   reduce: CrossRef.reduce
// }