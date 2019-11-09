/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */


 workbox.precaching.precacheAndRoute([
  {
    "url": "static/ajax-loader.gif",
    "revision": "c5cd7f5300576ab4c88202b42f6ded62"
  },
  {
    "url": "static/custom.css",
    "revision": "85e3cb710e0d6ab98c7d16b0132fd998"
  },
  {
    "url": "static/dialog.js",
    "revision": "7e05f151a1136f3ac8189de1deb1239d"
  },
  {
    "url": "static/favicon.ico",
    "revision": "f161900ce881a9c697d6b28d25191b81"
  },
  {
    "url": "static/functions.js",
    "revision": "c996bb1a98fac16c9821739b455168f9"
  },
  {
    "url": "static/gmap_functions.js",
    "revision": "93ad99813ae29380720d86fe097d6edb"
  },
  {
    "url": "static/manifest.json",
    "revision": "be9ff3f9fd79d14336986e6e38211eee"
  },
  {
    "url": "static/markerclusterer.js",
    "revision": "989f389a149425abc806a433f955eb8d"
  },
  {
    "url": "static/slick-theme.css",
    "revision": "c7918b16167fb65fab834e1d8d037f1c"
  },
  {
    "url": "static/slick.css",
    "revision": "f38b2db10e01b1572732a3191d538707"
  },
  {
    "url": "static/style.css",
    "revision": "49035c157177391800931fff2478f40c"
  },
  {
    "url": "static/sweetalert.min.js",
    "revision": "fe0f18cd4d5f1d03dd247211c5667669"
  },
  {
    "url": "static/swtemplate.js",
    "revision": "6c2a47e0eed3df2271dc965d9d9fb2bc"
  },
  {
    "url": "static/yii.activeForm.js",
    "revision": "9cdc8d698e728c0dc6c4aa4d89622931"
  },
  {
    "url": "static/yii.js",
    "revision": "43abc1f0d941b2dbed47eedd48ca64fe"
  }
]);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200],
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 31,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  '/database',
  new workbox.strategies.NetworkFirst({
    cacheName: 'static-resources',
  })
);

workbox.routing.registerRoute(
  '/',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

workbox.routing.registerRoute(
  /http.*\.(?:js|css)$/,
  new workbox.strategies.CacheFirst(),
);

workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  }),
); 
