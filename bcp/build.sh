ng build --outputPath=../dist --aot --baseHref=/ --buildOptimizer
cd src/workbox
npx webpack swtemplate.ts  --config webpack.config
workbox injectManifest