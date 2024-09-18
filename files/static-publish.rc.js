/*
 * Copyright Fastly, Inc.
 * Licensed under the MIT license. See LICENSE file for details.
 */

// Commented items are defaults, feel free to modify and experiment!
// See README for a detailed explanation of the configuration options.

/** @type {import('@fastly/compute-js-static-publish').StaticPublisherConfig} */
const config = {
  rootDir: "./static",
  staticContentRootDir: "./static-publisher",
  // kvStoreName: false,
  excludeDirs: [ './node_modules' ],
  // excludeDotFiles: true,
  // includeWellKnown: true,
  contentAssetInclusionTest: (filename) => true,
  // contentCompression: [ 'br', 'gzip' ], // For this config value, default is [] if kvStoreName is null. 
  // moduleAssetInclusionTest: (filename) => false,
  // contentTypes: [
  //   { test: /.custom$/, contentType: 'application/x-custom', text: false },
  // ],
  server: {
    publicDirPrefix: "",
    staticItems: ['/_app/immutable/**/*.js', '/_app/immutable/**/*.css', '/_app/immutable/**/*.woff', '/_app/immutable/**/*.woff2'],
    compression: [ 'br', 'gzip' ],
    spaFile: false,
    notFoundPageFile: false, 
    autoExt: [],
    autoIndex: ["index.html","index.htm"],
  },
};

export default config;
