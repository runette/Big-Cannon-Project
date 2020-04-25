module.exports = {
  globDirectory: "../../../dist",
  //Edit this list of file types to be cached, although this is a good start for ngx
  globPatterns: [
    "*.{png,svg,jpg,txt,gif,css,js,ico,eot,ttf,woff,json}",
    "assets/*.{png,svg,jpg,ico,gif}"
  ],
  globFollow: true, // follow symlinks
  globStrict: true, // fail the build if anything goes wrong while reading the files
  globIgnores: [
    // Ignore Angular's ES5 bundles
    // With this, we eagerly load the es2015
    // bundles and we only load/cache the es5 bundles when requested
    // i.e., on browsers that need them
    `**/*-es5.*.js`,
  ],
  // Allows to avoid using cache busting for Angular files because Angular already takes care of that!
  dontCacheBustURLsMatching: new RegExp(".+.[a-f0-9]{20}..+"),
  // Set large files to catch the angular vendor.js files. It is up to the developer to ensure the cache is not overwhelmed
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  swDest: "../../../dist/sw.js",
  swSrc: "./swtemplate.js",
};
