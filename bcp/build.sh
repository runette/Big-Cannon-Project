ng build --outputPath=../dist --aot --baseHref=/ --build-optimizer $1
cd src/workbox
npx webpack ./swtemplate.ts  --config webpack.config
workbox injectManifest