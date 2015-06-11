// Basic requires
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var Promise = require("bluebird");
var _ = require("lodash");
var util = require("util");
var cheerio = require('cheerio');
var Mapper = require("./mapper.js");

var formating = require('../localizations/en.json');

var CrossRef = {};


CrossRef.replace = function(contents, idMap, currentFilePath) {
  var $ = (typeof(contents) === 'string') ? cheerio.load(contents, { xmlMode: true, decodeEntities: false }) : contents;
  var $a = $("a[data-type='xref'], a:not([data-type])");
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
      } else {
        fragment = href;
      }

      if(fragment in idMap) {
        var ref = idMap[fragment];

        if(ref.path != currentFilePath) {
          $link.attr("href",  ref.path + "#" + fragment);
        }

        template = formating["xref-number"][ref.name];
        text = util.format(template, ref.position);

        $link.text(text);

        if(!replaced) replaced = true;
        
        
      } else {

        console.warn("Unable to locate target for XREF with @href value:", href);
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

  var settings = _.defaults(options || {}, {
    inputMode: { xmlMode: true, decodeEntities: false },
    outputMode: { xmlMode: false, decodeEntities: false },
    output: true
  });
  
  var stream = through.obj(function(file, enc, next) {
    var $doc = file.$ || cheerio.load(file.contents.toString(), settings.inputMode);
    var currentFilePath = file.relative;
    var $replaced = CrossRef.replace($doc, idMap.ids, currentFilePath);
    

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