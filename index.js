const PLUGIN_NAME = 'gulp-htmlbook';

// Gulp HTMLBook Modules

module.exports = {
  // Content
  // transform: {
  //   markdown: require('./lib/markdown'),
  //   asciidoc: require('./lib/asciidoc'),
  //   docbook: require('./lib/docbook')
  // },
  // Layout content in templates, and replace variables in the content
  layout: {
    template: require('./lib/template'),
    liquify: require('./lib/liquify'),
    ordering: require('./lib/position'),
    navigation: require('./lib/toc'),
    index: require('./lib/ix')
  },
  // Run through all content and generate reference objects
  generate: {
    map: require('./lib/map'),
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
    hint: require('./lib/hint')
  },
  // Not stream based
  tools: {
    helpers: require('./lib/helpers'),
    liquify: require('./lib/liquify'),
    mapper: require('./lib/mapper'),
    generateid: require('./lib/generateid'),
  }

}
