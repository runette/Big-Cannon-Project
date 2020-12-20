ng build --outputPath=../dist --aot --baseHref=/ --buildOptimizer $1
cd src/workbox
npx webpack swtemplate.ts  --config webpack.config
workbox injectManifest