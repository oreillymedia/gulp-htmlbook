function Counter(counts) {
  this.counts = counts || {};
};

Counter.prototype.add = function(what) {
  if(what in this.counts) {
    this.counts[what] = this.counts[what] + 1;
  } else {
    this.counts[what] = 1;
  }

  return this.counts[what];
};

Counter.prototype.total = function(what) {
  if(what in this.counts) {
    return this.counts[what];
  } else {
    return 0;
  }
};


function gulpCounter(options) {

  var counter = new Counter();

  // creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, done) {

    if (file.isNull()) { return; }
    if (file.isStream()) { return this.emit('error', new PluginError('gulp-replace-labels',  'Streaming not supported')); }

    var $ = file.$ || cheerio.load(file.contents.toString(), { xmlMode: false, decodeEntities: false });
    var filePath = file.relative;

    var replaced = false;

    // Find elements without id's
    var $elements = $("section[data-type], div[data-type]");

    $elements.each(function(index, element){
      var $element = $(element);
      var label = replaceLabel($element, $, counter);
      if(!replaced) replaced = true;
    });

    if(replaced) {
      file.contents = new Buffer($.html());
      file.$ = $;
    }

    this.push(file);

    return done();
    
  });

  // returning the file stream
  return stream;
};

module.exports = Counter;