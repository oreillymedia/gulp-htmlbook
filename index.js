const PLUGIN_NAME = 'gulp-htmlbook';

// Gulp HTMLBook Modules

module.exports = {
  // Layout content in templates, and replace variables in the content
  layout: {
    template: require('./lib/template'),
    ordering: require('./lib/position'),
    navigation: require('./lib/toc'),
    index: require('./lib/ix'),
    chunk: require('./lib/chunk')
  },
  // Run through all content and generate reference objects
  generate: {
    map: require('./lib/map'),
    titles: require('./lib/titles'),
    index: require('./lib/indexer'),
    nav: require('./lib/nav')
  },
  // processes parts of the content, most require content to have been mapped
  process: {
    ids: require('./lib/ids'),
    indexterms: require('./lib/indexterms'),
    labels: require('./lib/labels'),
    admonitions: require('./lib/admonitions'),
    comments: require('./lib/comments'),
    xrefs: require('./lib/xref'),
  },
  // Not stream based
  tools: {
    helpers: require('./lib/helpers'),
    mapper: require('./lib/mapper'),
    generateid: require('./lib/generateid'),
    markdown: require('./lib/markdown')
  }

}
