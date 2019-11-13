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

workbox.core.skipWaiting();
workbox.core.clientsClaim();

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
    "revision": "c73594b1fc878141cdb84c8ee7f6a241"
  },
  {
    "url": "static/gmap_functions.js",
    "revision": "d1404805b5aa4188c859750d07557db7"
  },
  {
    "url": "static/manifest.json",
    "revision": "7f7b8fe80771c88053eadf97a9835ca4"
  },
  {
    "url": "static/markerclusterer.js",
    "revision": "826eade5f67407a5b63dc6a750d58b3c"
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
    "url": "static/yii.activeForm.js",
    "revision": "9cdc8d698e728c0dc6c4aa4d89622931"
  },
  {
    "url": "static/yii.js",
    "revision": "43abc1f0d941b2dbed47eedd48ca64fe"
  },
  {
    "url": "img/32x32.png",
    "revision": "295e9ab2f973472412000b38793b7be6"
  },
  {
    "url": "img/70x70.png",
    "revision": "1eaf1a0f1eb8555244755558c29bea2c"
  },
  {
    "url": "img/A.png",
    "revision": "11ef0396dad0c1244b64290076f7d1c5"
  },
  {
    "url": "img/Ares_Logo-3.png",
    "revision": "bb81e610f6a02e95c437ee013e8dc477"
  },
  {
    "url": "img/B.png",
    "revision": "71dea0bfb25e010cd198b0eb6b3d734d"
  },
  {
    "url": "img/basiliscoe.png",
    "revision": "8def542df5cacf0a41de8cdd9aa2d9c1"
  },
  {
    "url": "img/C.png",
    "revision": "2875a3a63de21f28e77b760d6b7f374e"
  },
  {
    "url": "img/cannon_bronze.png",
    "revision": "310ab02ce89b1aa59e9ccaca7ecda1a9"
  },
  {
    "url": "img/cannon_chart.svg",
    "revision": "8803ed95ca023c6572fbbccc97a27870"
  },
  {
    "url": "img/cannon_gold_192.png",
    "revision": "a9666b7d89c2115d18fa6b84e70eca2f"
  },
  {
    "url": "img/cannon_gold.png",
    "revision": "beb52d01ab491b0dda98d57cd32cbf30"
  },
  {
    "url": "img/cannon_measuring.jpg",
    "revision": "475e6c4aa6013e7501d0575c96abc736"
  },
  {
    "url": "img/cannon_silver.png",
    "revision": "f070c22fcb86f3ffc136885ed19fc9b2"
  },
  {
    "url": "img/cannon.svg",
    "revision": "402501f2befdf63f4e0ff7468e287543"
  },
  {
    "url": "img/cismas.png",
    "revision": "4c1f096780e88dae602d9b5b66778bc2"
  },
  {
    "url": "img/Cyl.png",
    "revision": "0276ffb3d76d63ec13fd8e3e6e4a0bfa"
  },
  {
    "url": "img/E.png",
    "revision": "001deb093c7450efe7772feb8aced530"
  },
  {
    "url": "img/Ext.png",
    "revision": "1bd3e3d5e0f65f307683323c2fd670ae"
  },
  {
    "url": "img/F.png",
    "revision": "9c6edc49620608270898b24afb98c465"
  },
  {
    "url": "img/facebook.png",
    "revision": "9eea5ca26d649a1fe099cfbbbaa2507e"
  },
  {
    "url": "img/Fil.png",
    "revision": "27c252bb611079a13089f01f34dad260"
  },
  {
    "url": "img/Flat.png",
    "revision": "2fa2a12aa43feffb4820b7558e90d8ab"
  },
  {
    "url": "img/G.png",
    "revision": "af02106ed9006b905cd72fc2974afaeb"
  },
  {
    "url": "img/gun-map-192.png",
    "revision": "f6f19de3c47e29d02048edef4324831c"
  },
  {
    "url": "img/gun-map-512.png",
    "revision": "f4ac79bdaa1f5a66093cc504347961bf"
  },
  {
    "url": "img/gun-map-768.jpg",
    "revision": "5c3b51871d89bac47991b833233094ff"
  },
  {
    "url": "img/H.png",
    "revision": "cff64ef97fbf4057c3cea5d541f2fc6d"
  },
  {
    "url": "img/K.png",
    "revision": "56c9fd363b5f66ee9e4ade84c7fb3bb8"
  },
  {
    "url": "img/L.png",
    "revision": "f9e634e323b3f4637ddedd4e935c98a1"
  },
  {
    "url": "img/m1.png",
    "revision": "fe953f48d20a57a5155040dd7c8c41bc"
  },
  {
    "url": "img/m2.png",
    "revision": "558853d99c4fe2738843b60824a9eda9"
  },
  {
    "url": "img/m3.png",
    "revision": "4c6afbabe37e08ce966a66dc5031375c"
  },
  {
    "url": "img/mouldings.png",
    "revision": "6dc122ac7ac14cd1652f97ebfee3e85a"
  },
  {
    "url": "img/MSDS-768.png",
    "revision": "bed82a1ee8e063698eda3d6a76ed5f95"
  },
  {
    "url": "img/N.png",
    "revision": "dd4288bf8e6781320b16f62ca3fecad1"
  },
  {
    "url": "img/O.png",
    "revision": "a8068108ce9aebd1a1bee1277a414074"
  },
  {
    "url": "img/P.png",
    "revision": "8d332093838079515e1ee582a83da51c"
  },
  {
    "url": "img/Q.png",
    "revision": "e1b608fe02b8003d3881407a0417aebe"
  },
  {
    "url": "img/R.png",
    "revision": "7529d67e174080750b41be7a897f9cc1"
  },
  {
    "url": "img/S.png",
    "revision": "f8a4b7c57e20b31a83fbfa94486bde5c"
  },
  {
    "url": "img/Sph.png",
    "revision": "31e204f3f44ef594a79d4a2178e83a9b"
  },
  {
    "url": "img/T.png",
    "revision": "53249b9c0ff50f54e67ddfad658ccc04"
  },
  {
    "url": "img/U.png",
    "revision": "992671dae0a6781b49417fb7a6416c2c"
  },
  {
    "url": "img/ultima-ratio-logo.jpg",
    "revision": "05aeaa1767e89ed016ffa798bcc632fb"
  },
  {
    "url": "img/V.png",
    "revision": "19c82669ed749fd696227835f6fbe368"
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
  new workbox.strategies.CacheFirst({
    cacheName: 'libraries',
    plugins: [
      new workbox.expiration.Plugin({
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
      }),
    ],
  }),
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
